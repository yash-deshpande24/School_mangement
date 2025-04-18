const { PendingFees, OAuthToken, UserInfo, Payment, FeeType, FeeStructure, Classes, Section } = require('../../models');

const FilterFeesByName = async (req, res) => {
    try {
        console.log("FilterFeesByName***********");
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("accessToken", accessToken);
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        
        const storeClientId = adminToken.client.id;
        console.log("storeClientId", storeClientId);
        const findRole = adminToken.user.role;
        if (findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Fetch all pending fees for the client
        let allPendingFees = await PendingFees.findAll({ where: { clientId: storeClientId } });
        if (!allPendingFees || allPendingFees.length === 0) {
            return res.status(200).json({ message: "No pending fees found" });
        }
        
        // Fetch UserInfo for all StudentIDs
        const studentIds = allPendingFees.map(pendingFee => pendingFee.StudentID);
        console.log("Hello_____________-------______------______------",studentIds);
        const userInfoList = await UserInfo.findAll({ 
            where: { 
                id: studentIds 
            },
            attributes: ['id', 'firstName']
        });

        if (!userInfoList || userInfoList.length === 0) {
            return res.status(200).json({ message: "No user info found" });
        }

        // Filter by name if provided in URL params
        const { name } = req.params;
        if (name) {
            const filteredUserInfoList = userInfoList.filter(user => user.firstName.toLowerCase().includes(name.toLowerCase()));
            const filteredStudentIds = filteredUserInfoList.map(user => user.id);
            allPendingFees = allPendingFees.filter(pendingFee => filteredStudentIds.includes(pendingFee.StudentID));
        }

        // Check if any pending fees match the filter criteria
        if (allPendingFees.length === 0) {
            return res.status(200).json({ message: "No pending fees found for the specified name criteria" });
        }
        
        // Fetch payments made by students
        const paymentList = await Payment.findAll({ where: { clientId: storeClientId, StudentID: studentIds } });

        // Create a map for quick access to payments by StudentID
        const paymentMap = paymentList.reduce((map, payment) => {
            const studentID = payment.StudentID;
            if (!map[studentID]) {
                map[studentID] = 0;
            }
            map[studentID] += parseFloat(payment.AmountPaid);
            return map;
        }, {});

        // Create a map for quick access to userInfo by ID
        const userInfoMap = userInfoList.reduce((map, userInfo) => {
            map[userInfo.id] = userInfo;
            return map;
        }, {});

        // Aggregate AmountDue, and include firstName, classID, and sectionID for each StudentID
        const studentDetailsMap = {};
        for (const pendingFee of allPendingFees) {
            const { StudentID, AmountDue, classID, sectionID } = pendingFee;
            const key = `${StudentID}_${classID}_${sectionID}`;
            const amount = parseFloat(AmountDue);
            console.log("key(((((((((((((((", key);
            if (studentDetailsMap[key]) {
                studentDetailsMap[key].TotalAmountDue += amount;
            } else {
                studentDetailsMap[key] = {
                    StudentID: parseInt(StudentID),
                    firstName: userInfoMap[StudentID].firstName,
                    TotalAmountDue: amount,
                    classID,
                    sectionID
                };
            }
        }

        // Calculate pending fees for each student and prepare final response
        const aggregatedPendingFees = [];
        for (const key in studentDetailsMap) {
            if (studentDetailsMap.hasOwnProperty(key)) {
                const { StudentID, firstName, TotalAmountDue, classID, sectionID } = studentDetailsMap[key];
                const AmountPaid = paymentMap[StudentID] || 0;
                const PendingFee = TotalAmountDue - AmountPaid;

                let className = "";
                if (classID) {
                    const classDetails = await Classes.findOne({ where: { id: classID } });
                    className = classDetails ? classDetails.class_name : "";
                }

                let sectionName = "";
                let sectionId = sectionID;
                if (sectionID !== null) {
                    const sectionDetails = await Section.findOne({ where: { id: sectionID } });
                    sectionName = sectionDetails ? sectionDetails.section_name : "";
                } else {
                    sectionName = ""; // If sectionID is null, set sectionName to -1
                    sectionId = -1;
                }
                
                aggregatedPendingFees.push({
                    StudentID,
                    Name: firstName,
                    TotalAmountDue: TotalAmountDue.toFixed(2),
                    classID,
                    className,
                    sectionId: sectionId,
                    sectionName,
                    AmountPaid: AmountPaid.toFixed(2),
                    PendingFee: PendingFee.toFixed(2)
                });
            }
        }

        return res.status(200).json({ aggregatedPendingFees });
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = FilterFeesByName;

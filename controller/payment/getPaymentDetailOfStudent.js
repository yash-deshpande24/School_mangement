
const { PendingFees, OAuthToken, UserInfo, FeeType, Payment, Classes, Section, FeeStructure } = require('../../models');

const getPaymentDetailOfStudent = async (req, res) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        
        const storeClientId = adminToken.client.id;
        const getAdminId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if (findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: "Student id is required" });
        }
        
        const studentExist = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!studentExist) {
            return res.status(200).json({ message: "Student not found" });
        }
        
        const allPendingFees = await PendingFees.findAll({ where: { StudentID: studentId, clientId: storeClientId } });
        const getAllPayments = await Payment.findAll({ where: { StudentID: studentId, clientId: storeClientId } });

        if (!allPendingFees || allPendingFees.length === 0) {
            return res.status(200).json({ message: "No pending fees found" });
        } 
    
        const studentPaymentDetail = await Promise.all(allPendingFees.map(async pendingFee => {
            // const payment = getAllPayment.find(payment => payment.FeeID === pendingFee.FeeID) || null;
            const payments = getAllPayments.filter(payment => payment.FeeID === pendingFee.FeeID); 
            // const feeName = feeTypeMap[pendingFee.FeeID] || null; // Handle undefined or null fee names
            const totalAmountPaid = payments.reduce((sum,payment)=>  sum + parseFloat(payment.AmountPaid),0);

            const feeStructure = await FeeStructure.findOne({ where: { id: pendingFee.FeeID, clientId: storeClientId } });
            const feeType = await FeeType.findOne({ where: { id: feeStructure.FeeTypeID, clientId: storeClientId } }); 
            const feeName = feeType.FeeName;

            const remainingAmount = pendingFee.AmountDue - totalAmountPaid

            // Fetch class name
            let className = "";
            if (pendingFee.classID) {
                const classInfo = await Classes.findOne({ where: { id: pendingFee.classID, clientId: storeClientId } });
                if (classInfo) {
                    className = classInfo.class_name;
                }
            }

            // Fetch section name or set to -1 if sectionID is null
            let sectionID = pendingFee.sectionID !== null ? pendingFee.sectionID : -1;
            let sectionName = "";
            if (pendingFee.sectionID !== null) {
                const sectionInfo = await Section.findOne({ where: { id: pendingFee.sectionID, clientId: storeClientId } });
                if (sectionInfo) {
                    sectionName = sectionInfo.section_name;
                }
            } else {
                sectionName = "";
            }

            return {
                id: pendingFee.id,
                StudentID: pendingFee.StudentID,
                FeeID: pendingFee.FeeID,
                AmountDue: parseFloat(pendingFee.AmountDue).toFixed(2),
                DueDate: pendingFee.DueDate,
                status: pendingFee.status,
                classID: pendingFee.classID,
                className: className,
                sectionID: sectionID,
                sectionName: sectionName,
                FeeTypeID: feeType.id,
                FeeTypeName: feeName,
                AmountPaid: parseFloat(totalAmountPaid).toFixed(2),
                pendingFee: parseFloat(remainingAmount).toFixed(2)
            };
        }));

        return res.status(200).json({message: "Payment detail fetched successfully", studentPaymentDetail});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getPaymentDetailOfStudent;

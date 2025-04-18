const { Classes, OAuthToken, ClassEnrollments, UserInfo, PendingFees, FeeStructure, Section, FeeType} = require('../../models');

const enrollStudentInClass = async (req, res) => {
    try{
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
        if(findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {studentId, classId, sectionId} = req.params;
        console.log("*******************: studentId, classId, sectionId",studentId, classId, sectionId);
        if(!studentId ) {
            return res.status(400).json({ message: "Student id is required" });
        }else if(!classId ) {
            return res.status(400).json({ message: "Class id is required" });
        }

        const FeesStructureExist = await FeeStructure.findAll({ where: {ClassID: classId ,clientId: storeClientId } });

        console.log("FeesStructures*****************",FeesStructureExist);
        if (FeesStructureExist.length === 0) {
            return res.status(400).json({ message: "Fees structure not found" });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        console.log("Classes*****************",classExist.id);
        const studentExist = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        console.log("Students*****************",studentExist.firstName);
        if (!studentExist) {
            return res.status(200).json({ message: "Student not found" });
        }else if (!classExist) {
            return res.status(200).json({ message: "Class not found" });
        }


        var sectionExist = null;
        if (sectionId != -1) {
            sectionExist = await Section.findOne({ where: { id: sectionId, classId: classId, clientId: storeClientId, isDeleted: false } });
            if (!sectionExist) {
                return res.status(200).json({ message: "Section not found" });
            }
        }

        const isEnrolled = await ClassEnrollments.findOne({ where: { 
            studentId: studentId, 
            classId: classId, 
            clientId: storeClientId 
        }});
        if (isEnrolled) {
            return res.status(400).json({ message: "Student is already enrolled in this class" });
        }


        FeesStructureExist.forEach(item => {
            PendingFees.create({ 
                StudentID: studentId, 
                FeeID: item.id, 
                AmountDue: item.Amount, 
                DueDate: item.DueDate, 
                clientId: storeClientId,
                classID: classId,
                sectionID: sectionId != -1 ? sectionId : null
            });
        });
        
        console.log("*******************")
        await ClassEnrollments.create({ 
            studentId: studentId, 
            classId: classId, 
            sectionId: sectionId != -1 ? sectionId : null, 
            clientId: storeClientId 
        });
        return res.status(200).json({ message: "Student enrolled successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = enrollStudentInClass
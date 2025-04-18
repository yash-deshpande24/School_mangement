const { ClassEnrollments, Section, Classes, OAuthToken, PendingFees } = require('../../models');

const assignSectionToStudent = async (req, res) => {
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
        if(findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { studentId, classId, sectionId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: 'Student id is required' });
        }else if (!classId) {
            return res.status(400).json({ message: 'Class id is required' });
        }else if (!sectionId) {
            return res.status(400).json({ message: 'Section id is required' });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        const sectionExist = await Section.findOne({ where: { id: sectionId, clientId: storeClientId, isDeleted: false } });
        const studentExist = await ClassEnrollments.findOne({ where: { studentId: studentId, classId: classId, clientId: storeClientId } });

        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }else if (!sectionExist) {
            return res.status(400).json({ message: "Section does not exist" });
        }else if (!studentExist) {
            return res.status(400).json({ message: "Student does not exist" });
        }
        console.log("Student exist***************************", studentExist.sectionId)
        if (studentExist.sectionId || studentExist.sectionId === -1) {
            return res.status(400).json({ message: "Student already assigned to a section" });
        }

        await ClassEnrollments.update({ sectionId: sectionId }, { where: { studentId: studentId, classId: classId, clientId: storeClientId } });
        await PendingFees.update({ sectionID: sectionId }, { where: { StudentID: studentId, classID: classId, clientId: storeClientId } });
        return res.status(200).json({ message: "Section assigned successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = assignSectionToStudent
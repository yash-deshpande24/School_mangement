const {UserInfo , Attendance, ClassEnrollments, Classes, FeeStructure, FeeType, NoticeDetail, Notices, OAuthClient, OAuthToken, Payment, PendingFees, SchoolFAQ, SchoolInfo, SchoolParentStudent, Section, Subjects, TeacherDepartmentAssociation, Department, FacultyAttendance } = require('../../models');
const { Op } = require('sequelize'); 
 
const deleteSchool = async (req, res) => {
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
        if (findRole !== "SuperAdmin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({ message: "Client ID is required" });
        }
        
        const deletePayment = await Payment.destroy({ where: { clientId: clientId } });
        const deletePendingFees = await PendingFees.destroy({ where: { clientId: clientId } });
        const deleteAttendance = await Attendance.destroy({ where: { clientId: clientId } });
        const deleteNoticeDetail = await NoticeDetail.destroy({ where: { clientId: clientId } });
        const deleteNotices = await Notices.destroy({ where: { clientId: clientId } });
        const deleteSchoolFAQ = await SchoolFAQ.destroy({ where: { clientId: clientId } });
        const deleteSchoolParentStudent = await SchoolParentStudent.destroy({ where: { clientId: clientId } });
        const deleteSchool = await SchoolInfo.destroy({ where: { clientId: clientId } });
        const deleteFeeStructure = await FeeStructure.destroy({ where: { clientId: clientId } });
        const deleteClassEnrollments = await ClassEnrollments.destroy({ where: { clientId: clientId } });
        const deleteClass = await Classes.destroy({ where: { clientId: clientId } });
        const deleteSubjects = await Subjects.destroy({ where: { clientId: clientId } });
        const deleteTeacherDepartmentAssociation = await TeacherDepartmentAssociation.destroy({ where: { clientId: clientId } });
        const deleteDepartment = await Department.destroy({ where: { clientId: clientId } });
        const deleteFeeType = await FeeType.destroy({ where: { clientId: clientId } });
        const deleteSection = await Section.destroy({ where: { clientId: clientId } });
        const deleteOAuthToken = await OAuthToken.destroy({
          where: {
            client: {
              id: clientId
            }
          }
        });
        const facultyAttendance = await FacultyAttendance.destroy({ where: { clientId: clientId } });
        const deleteUserInfo = await UserInfo.destroy({ where: {clientId: clientId} })
        const deleteOAuthClient = await OAuthClient.destroy({ where: { clientId: clientId } });
        
        return res.status(200).json({ message: "Data deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
 
module.exports = deleteSchool

const {Attendance, OAuthToken, UserInfo, Classes, ClassEnrollments} = require('../../models');

const getAttendanceByStudentId = async (req, res) => {
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
        if(findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {studentId} = req.params;
        if(!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }
        const studentData = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, role: "Student", isDeleted: false } });
        if (!studentData) {
            return res.status(200).json({ message: "Student not found" });
        }
        if (studentData.role !== "Student") {
            return res.status(400).json({ message: "Invalid student ID" });
        }
        const attendance = await Attendance.findAll({ where: { studentId: studentId } });
        return res.status(200).json({ attendance });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getAttendanceByStudentId
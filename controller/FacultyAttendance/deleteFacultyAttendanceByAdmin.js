const {OAuthToken, FacultyAttendance} = require("../../models");

const deleteFacultyAttendanceByAdmin = async (req, res) => {
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
        const userId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if (findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {attendanceId} = req.params;

        if (!attendanceId) {
            return res.status(400).json({ message: "faculty ID is required" });
        }
        
        const findAttendance = await FacultyAttendance.findOne({ where: { id: attendanceId, clientId: storeClientId } });
        if (!findAttendance) {
            return res.status(200).json({ message: "Attendance doesn't exist" });
        }
        await findAttendance.destroy();
        return res.status(200).json({ message: 'Attendance deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = deleteFacultyAttendanceByAdmin
const {UserInfo, OAuthToken, FacultyAttendance} = require("../../models");

const getFacultyAttendance = async (req, res) => {
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
        const getFacultyId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if (findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const findUser = await UserInfo.findOne({ where: { id: getFacultyId, role: "Teacher", clientId: storeClientId, isDeleted: false } });
        if (!findUser) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const findAttendance = await FacultyAttendance.findAll({ where: { userId: getFacultyId, clientId: storeClientId }, attributes: {exclude: ['clientId'] }});
        if (findAttendance.length === 0) {
            return res.status(200).json({ message: "No attendance found" });
        }
        return res.status(200).json({ message: "Attendance found successfully", data: findAttendance });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = getFacultyAttendance
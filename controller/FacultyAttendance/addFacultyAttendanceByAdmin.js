const {UserInfo, OAuthToken, FacultyAttendance} = require("../../models");
const { Op } = require('sequelize'); // Ensure Op is imported for Sequelize queries
const addFacultyAttendanceByAdmin = async (req, res) => {
    const {clockInTime, clockOutTime, shiftType, userId} = req.body;
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
        if (findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!shiftType || !userId) {
            return res.status(400).json({ message: "All fields are required" });
        }else if (clockInTime !== undefined && clockOutTime !== undefined) {
            return res.status(400).json({ message: "At a time you can clock in or clock out" });
        }
        const findUser = await UserInfo.findOne({ where: { id: userId, role: "Teacher", clientId: storeClientId, isDeleted: false } });
        if (!findUser) {
            return res.status(400).json({ message: "Invalid user" });
        }

        var attendanceFound = false
        var isActive = true
        if (clockInTime !== null && clockInTime !== undefined) {
            isActive = false
        }else if (clockOutTime !== null && clockOutTime !== undefined) {
            const findFacultyAttendance = await FacultyAttendance.findOne({
                where: {
                    userId: userId,
                    clientId: storeClientId,
                    clockIn: { [Op.not]: null }, // Using Sequelize's operators to check for not null
                    clockOut: null
                }
            });       
            if (findFacultyAttendance) {
                attendanceFound = true
                await findFacultyAttendance.update({ clockOut: clockOutTime, isActive: isActive }, { where: { userId: userId, clientId: storeClientId } });
                return res.status(200).json({ message: "Attendance updated successfully"});
            } 
        }

        if (!attendanceFound) {
            await FacultyAttendance.create({
                clockIn: clockInTime,
                clockOut: clockOutTime,
                userId: userId,
                fullName: findUser.firstName + " " + findUser.lastName,
                isActive: isActive,
                shiftType: shiftType,
                clientId: storeClientId
            });
            return res.status(200).json({ message: "Attendance created successfully"});
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
module.exports = addFacultyAttendanceByAdmin
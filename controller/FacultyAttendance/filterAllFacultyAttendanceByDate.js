const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
const { Op } = require("sequelize");

const filterAllFacultyAttendanceByDate = async (req, res) => {
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

        if (findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const findUser = await UserInfo.findOne({
            where: { id: getFacultyId, role: "Admin", clientId: storeClientId, isDeleted: false }
        });

        if (!findUser) {
            return res.status(400).json({ message: "Invalid user" });
        }

        // Fetching start and end dates from query parameters
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Invalid date range" });
        }

        // Parse the start and end dates, ensuring they are in the correct timezone (UTC)
        const start = new Date(new Date(startDate).setHours(0, 0, 0, 0)); // Start of the day (00:00)
        const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)); // End of the day (23:59)

        // Fetch FacultyAttendance records and filter by date range
        const findAttendance = await FacultyAttendance.findAll({
            where: {
                clientId: storeClientId,
                clockIn: { [Op.between]: [start, end] } // Correctly filtering by clockIn between startDate and endDate
            },
            attributes: { exclude: ['clientId'] }
        });

        if (findAttendance.length === 0) {
            return res.status(200).json({ message: "No attendance found", data: findAttendance });
        }

        return res.status(200).json({ message: "Attendance found successfully", data: findAttendance });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = filterAllFacultyAttendanceByDate;

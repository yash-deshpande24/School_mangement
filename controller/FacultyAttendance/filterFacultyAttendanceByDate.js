const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
const { Op } = require("sequelize");
const filterFacultyAttendanceByDate = async (req, res) => {
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
        // if (findRole !== "Teacher" && findRole !== "Admin") {
        //     return res.status(401).json({ message: "Unauthorized" });
        // }
        // const findUser = await UserInfo.findOne({ where: { id: getFacultyId, role: "Teacher", clientId: storeClientId, isDeleted: false } });
        // if (!findUser) {
        //     return res.status(400).json({ message: "Invalid user" });
        // }

        // Fetching start and end dates from query parameters
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Invalid date range" });
        }
        var findAttendance = [];

        // Fetch FacultyAttendance records and filter by date range
        if (startDate && endDate) {

            // var newStartDate = new Date(0);
            // newStartDate.setSeconds(startDate);
            // newStartDate.setHours(0, 0, 0, 0);
            // //startDate = newStartDate.getSeconds();
            // newStartDate = newStartDate.getTime()/1000;

            // var newEndDate = new Date(0);
            // newEndDate.setSeconds(endDate);
            // newEndDate.setHours(23, 59, 59, 999);
            // //endDate = newEndDate.getSeconds();
            // newEndDate = newEndDate.getTime()/1000;

            findAttendance = await FacultyAttendance.findAll({
                where: {
                    userId: getFacultyId,
                    clientId: storeClientId,
                    clockIn: { [Op.between]: [startDate, endDate+86400] } // Filtering by clockInTime
                },
                attributes: { exclude: ['clientId'] }
            });
        }else if (startDate) {
            findAttendance = await FacultyAttendance.findAll({
                where: {
                    userId: getFacultyId,
                    clientId: storeClientId,
                    clockIn: { [Op.gte]: startDate } // Filtering by clockInTime greater than or equal to startDate
                },
                attributes: { exclude: ['clientId'] }
            });
        }

        if (findAttendance.length === 0) {
            return res.status(200).json({ message: "No attendance found" });
        }

        return res.status(200).json({ message: "Attendance found successfully", data: findAttendance });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

module.exports = filterFacultyAttendanceByDate;

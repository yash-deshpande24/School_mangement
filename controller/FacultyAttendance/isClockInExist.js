const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
const { Op } = require('sequelize'); // Import Op from Sequelize
const isClockInExist = async (req, res) => {
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
        
        // Get current date in epoch time
        const startOfDay = new Date().setHours(0, 0, 0, 0);
        const endOfDay = new Date().setHours(23, 59, 59, 999);
        const startOfDayEpoch = Math.floor(startOfDay / 1000); // Convert to seconds
        const endOfDayEpoch = Math.floor(endOfDay / 1000); // Convert to seconds

        // Check for active attendance record for today
        const findAttendance = await FacultyAttendance.findOne({ 
            where: { 
                userId: getFacultyId, 
                clientId: storeClientId, 
                clockIn: { 
                    [Op.between]: [startOfDayEpoch, endOfDayEpoch] // Use Op.between to filter by range
                },
                isActive: true 
            },
            attributes: { exclude: ['clientId'] }
        });
        
        if (findAttendance) {
            // If an active record is found, return true
            return res.status(200).json({ isExist: true, message: "Active clock-in found for today", data: findAttendance });
        }

        // If no active record, check for any record (active or inactive) for today
        const anyAttendance = await FacultyAttendance.findOne({
            where: {
                userId: getFacultyId,
                clientId: storeClientId,
                clockIn: { 
                    [Op.between]: [startOfDayEpoch, endOfDayEpoch] // Use Op.between to filter by range
                }
            },
            attributes: { exclude: ['clientId'] }
        });

        if (anyAttendance) {
            // If any record (active or inactive) is found but not active
            return res.status(200).json({ isExist: false, message: "Clock-in record exists but is not active", data: anyAttendance });
        }

        // No record found for today
        return res.status(200).json({ isExist: false, message: "No attendance record found for today", data: null });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = isClockInExist;

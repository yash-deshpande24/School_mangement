const {UserInfo, OAuthToken, FacultyAttendance, WifiDetail} = require("../../models");
const { Op } = require("sequelize");
const addFacultyAttendance = async (req, res) => {
    const {wifiName, clockInTime, clockOutTime, shiftType} = req.body;

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
        if (findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!shiftType) {
            return res.status(400).json({ message: "Shift Type is required" });
            
        }if (!wifiName) {
            return res.status(400).json({ message: "WiFi Name is required" });
            
        }else if (clockInTime !== undefined && clockOutTime !== undefined) {
            return res.status(400).json({ message: "At a time you can clock in or clock out" });
        }
        console.log("wifiName **************",wifiName)
        console.log("userId **************",userId)
        console.log("shiftType **************",shiftType)
        const findUser = await UserInfo.findOne({ where: { id: userId, role: "Teacher", clientId: storeClientId, isDeleted: false } });
        if (!findUser) {
            return res.status(400).json({ message: "Invalid user" });
        }
        const findWifi = await WifiDetail.findOne({ where: { wifiName: wifiName, clientId: storeClientId } });
        if (!findWifi) {
            const getWifi = await WifiDetail.findOne({ where: { clientId: storeClientId } });
            return res.status(400).json({ message: "Please use \"" + getWifi.wifiName + "\" wifi" });
        }
        var isActive = false
        if (clockInTime !== null && clockInTime !== undefined) {
            isActive = true
        }
        console.log("ClockInTime **************",clockInTime)
        console.log("ClockOutTime **************",clockOutTime)
        console.log("isActive **************",isActive)
        console.log("shiftType **************",shiftType)
        console.log("wifiName **************",wifiName)
        var attendanceFound = false
        if (clockOutTime !== null && clockOutTime !== undefined) {
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
module.exports = addFacultyAttendance
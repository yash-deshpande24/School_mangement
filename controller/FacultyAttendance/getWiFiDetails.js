const {OAuthToken, FacultyAttendance, WifiDetail} = require("../../models");

const getWiFiDetails = async (req, res) => {
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
        // const userId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if (findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const findWifi = await WifiDetail.findOne({ where: { clientId: storeClientId } });
        if (!findWifi) {
            return res.status(200).json({ status: false, message: "No Wifi details found" });
        }else{
            return res.status(200).json({ status: true, result: findWifi  });
        }
       
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getWiFiDetails

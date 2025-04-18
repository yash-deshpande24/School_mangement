const {OAuthToken, FacultyAttendance, WifiDetail} = require("../../models");

const addUpdateWiFiDetail = async (req, res) => {
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
            await WifiDetail.create({ wifiName: req.body.wifiName, clientId: storeClientId });
            return res.status(200).json({ status: true, message: "wifi name added successfully" });
        }else{
            await findWifi.update({ wifiName: req.body.wifiName });
            return res.status(200).json({ status: true, message: "wifi name updated successfully"  });
        }
       
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = addUpdateWiFiDetail

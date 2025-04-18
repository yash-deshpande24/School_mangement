const { PendingFees, OAuthToken, OAuthClient, UserInfo } = require('../../models');
const getAllPendingFees = async (req, res) => {
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
        if(findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {id} = req.params;
        if(!id) {
            return res.status(400).json({ message: "Pending fee ID is required" });
        }
        const pendingFeeExists = await PendingFees.findOne({ where: { id, clientId: storeClientId } });
        if (!pendingFeeExists) {
            return res.status(200).json({ message: "Pending fee doesn't exist" });
        }

        const pendingFees = await PendingFees.destroy({ where: { id, clientId: storeClientId } });
        return res.status(200).json({ pendingFees });  
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getAllPendingFees
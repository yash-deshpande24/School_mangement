const { FeeType, OAuthToken, SchoolInfo, FeeStructure, Classes } = require('../../models');

const deleteFeesStructure = async (req, res) => {
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
        const { feeStructureId } = req.params;
        const feeStructure = await FeeStructure.findOne({ where: { id: feeStructureId, clientId: storeClientId } });
        if (!feeStructure) {
            return res.status(400).json({ message: 'Fee structure does not exist' });
        }
        await FeeStructure.destroy({ where: { id: feeStructureId } });
        return res.status(200).json({ message: 'Fee structure deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = deleteFeesStructure
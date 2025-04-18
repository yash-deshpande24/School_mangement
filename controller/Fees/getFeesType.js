const { FeeType, FeeStructure,OAuthToken } = require('../../models');

const getFeesType = async (req, res) => {
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
        if(findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const feeTypes = await FeeType.findAll({ where: { clientId: storeClientId }, attributes:{exclude:['clientId']} });
        if (!feeTypes) {
            return res.status(200).json({ message: 'No fee types found' });
        }
        if (feeTypes.length === 0) {
            return res.status(200).json({ message: 'No fee types found' });
        }
        return res.status(200).json({ message: 'Fee types fetched successfully', feeTypes });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getFeesType

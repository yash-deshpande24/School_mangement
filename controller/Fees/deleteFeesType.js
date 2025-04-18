const { FeeType, OAuthToken, SchoolInfo, FeeStructure, PendingFees } = require('../../models');

const deleteFeesType = async (req, res) => {
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
        if (findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { feeTypeId } = req.params;
        const feeType = await FeeType.findOne({ where: { id: feeTypeId, clientId: storeClientId } });
        if (!feeType) {
            return res.status(400).json({ message: 'Fee type does not exist' });
        }

        const feeStructures = await FeeStructure.findAll({ where: { FeeTypeID: feeTypeId } });

        if (feeStructures.length > 0) {
            for (const feeStructure of feeStructures) {
                await PendingFees.destroy({ where: { FeeID: feeStructure.id } });
            }
            await FeeStructure.destroy({ where: { FeeTypeID: feeTypeId } });
        }
        await FeeType.destroy({ where: { id: feeTypeId } });
        return res.status(200).json({ message: 'Fee type deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = deleteFeesType;

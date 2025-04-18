const { FeeType, OAuthToken } = require('../../models');

const updateFeesTypeById = async (req, res) => {
    const { id } = req.params;
    const { feeName, description } = req.body;
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
        const feeTypeExist = await FeeType.findOne({ where: { id, clientId: storeClientId } });
        if (!feeTypeExist) {
            return res.status(200).json({ message: "Fee type not found" });
        }else if (feeTypeExist.feeName === "Tution Fee") {
            return res.status(400).json({ message: "Tution fee cannot be updated" });
        }
        const updateFeesType = await FeeType.update({ FeeName: feeName, Description : description }, { where: { id } });
        const updatedFeesType = await FeeType.findOne({ where: { id } });
        if (updateFeesType) {
            return res.status(200).json({ message: "Fees type updated successfully"});
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = updateFeesTypeById
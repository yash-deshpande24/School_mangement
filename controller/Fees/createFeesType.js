const { FeeType, OAuthToken, SchoolInfo } = require('../../models');
const { Op } = require("sequelize");
const createFeesType = async (req, res) => {
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
        const { feeName, description } = req.body;
        if (!feeName || feeName === '') {
            return res.status(400).json({ message: 'Fee name is required' });
        }
        if (!description || description === '') {
            return res.status(400).json({ message: 'Description is required' });
        }
        // const feeTypeExist = await FeeType.findOne({ where: { FeeName: feeName, clientId: storeClientId } });
        const feeTypeExist = await FeeType.findOne({
            where: {
                FeeName: {
                    [Op.like]: `%${feeName}%`
                },
                clientId: storeClientId
            }
        });
        if (feeTypeExist) {
            return res.status(400).json({ message: "Fee type already exists" });
        }

        const newFeeType = await FeeType.create({
            FeeName:feeName,
            Description:description,
            clientId: storeClientId
        });
        return res.status(201).json({ message: 'Fee type created successfully'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = createFeesType
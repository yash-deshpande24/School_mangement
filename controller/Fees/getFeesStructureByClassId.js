const { FeeType, OAuthToken, SchoolInfo, FeeStructure,Classes} = require('../../models');

const getFeesStructure = async (req, res) => {
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
        const { classId } = req.params;
        if (!classId || classId === '') {
            return res.status(400).json({ message: 'Class id is required' });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }
        const feeStructures = await FeeStructure.findAll({ where: { ClassID: classId, clientId: storeClientId }, attributes:{exclude:['clientId']} });
        if (!feeStructures) {
            return res.status(200).json({ message: 'No fee structures found' });
        }
        if (feeStructures.length === 0) {
            return res.status(200).json({ message: 'No fee structures found' });
        }
        return res.status(200).json({ message: 'Fee structures fetched successfully', feeStructures });
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getFeesStructure
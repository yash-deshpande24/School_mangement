const {Department, OAuthToken} = require('../../models');

const deleteDepartment = async (req, res) => {
    const {departmentId} = req.params;
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        console.log("Admin Token: ", adminToken);
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);
        const department = await Department.findOne({ where: { id: departmentId, clientId: storeClientId } });
        if (!department) {
            return res.status(200).json({ message: 'Department not found' });
        }
        await department.destroy();
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = deleteDepartment;
const {Department, OAuthToken} = require('../../models');


const updateDepartment = async (req, res) => {
    const { departmentId } = req.params;
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
        const department = await Department.findByPk(departmentId, { where: { clientId: storeClientId } });
        if (!department) {
            return res.status(200).json({ message: 'Department not found' });
        }
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }
        const existingDepartment = await Department.findOne({ where: { name , clientId: storeClientId} });
        if (existingDepartment && existingDepartment.id !== departmentId) {
            return res.status(400).json({message: 'Department already exists' });
        }
        await department.update({ name });
        res.status(200).json({ message: 'Department updated successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = updateDepartment;
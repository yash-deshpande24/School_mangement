const { Department, OAuthToken } = require('../../models');

const createDepartment = async (req, res) => {
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

        const findRole = adminToken.user.role;
        if (findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }


        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }
        const existingDepartment = await Department.findOne({ where: { name: name, clientId: storeClientId } });
        if (existingDepartment) {
            return res.status(400).json({message: 'Department already exists' });
        }
        const department = await Department.create({ name, clientId: storeClientId });

        res.status(201).json({ message: 'Department created successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = createDepartment;
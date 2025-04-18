const { Classes, OAuthToken } = require('../../models');

const getAllClasses = async (req, res) => {
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
        if(findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const classes = await Classes.findAll({ where: { clientId: storeClientId, isDeleted: false }, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] }});

        if (classes.length === 0) {
            return res.status(200).json({ message: 'No classes found', classes });
        }

        return res.status(200).json({ message: 'Classes fetched successfully', classes });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}    
module.exports = getAllClasses
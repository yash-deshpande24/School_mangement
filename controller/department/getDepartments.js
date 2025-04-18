const {Department, OAuthToken} = require('../../models');

const getAllDepartments = async (req, res) => {
    
    try{
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

        const departments = await Department.findAll({ where: { clientId: storeClientId }, attributes: {exclude: ['clientId']} });
        res.status(200).send({departments});
    }catch(err){
        return res.status(500).json({message: err.message });
    }
}

module.exports = getAllDepartments;
const { OAuthClient, OAuthToken, SchoolInfo } = require('../../models');

const getAllSchools = async (req, res) => {
    try{
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({where:{ accessToken: token }});
        console.log("Admin Token: ", adminToken);
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);

        const storeRole = adminToken.user.role;
        if (storeRole !== "SuperAdmin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const schools = await SchoolInfo.findAll({attributes: ['id', 'name', 'logo', 'clientId'] } );
        if (schools.length === 0) {
            return res.status(200).json({ message: 'No schools found' });
        }
        return res.status(200).json({message: 'Schools fetched successfully', schools});
    }catch(err){
        return res.status(500).json({ message: err.message });}

    }

module.exports = getAllSchools;
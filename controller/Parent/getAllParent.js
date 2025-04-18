// CREATE TYPE role AS ENUM ('Parent', 'Student', 'Admin', 'Owner', 'Teacher');
const {OAuthClient, OAuthToken, UserInfo} = require('../../models');

const getAllParent = async (req, res) => {
    try{
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token }});
        console.log("Admin Token: ", adminToken.user.role);
        let role = adminToken.user.role;
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        if (role !== "Admin" && role !== "Owner" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);

        const parents = await UserInfo.findAll({where : { clientId: storeClientId, role: "Parent", isDeleted: false }, attributes: {exclude: ['clientId', 'isDeleted', 'role', 'password']}});
        if(parents.length === 0){
            return res.status(200).json({ message: 'No parents found' });
        }
        console.log("Students: ", parents);
        return res.status(200).json({message: 'Parents fetched successfully', parents});
    }catch(err){
        return res.status(500).json({ message: err.message });}

    }

module.exports = getAllParent;
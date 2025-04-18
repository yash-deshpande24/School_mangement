const { Classes, OAuthToken, UserInfo } = require('../../models');
const { Op } = require("sequelize");

const getSchoolTeacherByName = async (req, res) => {
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
        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        // const teachers = await UserInfo.findAll({ where: { name: name, clientId: storeClientId, role: "Teacher", isDeleted: false } });
        const teachers = await UserInfo.findAll({ 
            where: { 
                firstName: { [Op.iLike]: `%${name}%` }, 
                clientId: storeClientId, 
                role: "Teacher", 
                isDeleted: false 
            } 
        });
        return res.status(200).json({ teachers });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getSchoolTeacherByName
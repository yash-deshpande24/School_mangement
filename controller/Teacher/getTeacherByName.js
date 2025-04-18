const {Classes, OAuthToken, UserInfo} = require('../../models');
const { Op } = require("sequelize");

const getTeacherByName = async (req, res) => {
    const {className} = req.params;
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
    const { name } = req.params;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    const teachers = await UserInfo.findAll({ where: { firstName: { [Op.iLike]: `%${name}%` }, clientId: storeClientId, isDeleted: false, role: "Teacher"}, attributes: {exclude: ['password', 'isDeleted', 'createdAt', 'updatedAt', 'clientId', 'role']}});
    return res.status(200).json({ message: 'Teachers fetched successfully', teachers });
}
module.exports = getTeacherByName;
const { where } = require('sequelize');
const {SchoolParentStudent, OAuthToken, UserInfo} = require('../../models');

const getParentByStudentID = async (req, res) => {
    const {studentId} = req.params;
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
        console.log("Student ID: ", studentId);
        const parent = await SchoolParentStudent.findAll({ where: { studentId: studentId, clientId: storeClientId} });
        if (parent.length === 0) {
            return res.status(200).json({ message: 'Parent not found' });
        }
        const parentId = parent.map((obj) => obj.parentId);

        console.log("Parent ID: ", parentId);

        const parents = []
        const findParents = await UserInfo.findAll({ where: { id: parentId, clientId: storeClientId, isDeleted: false } });
        console.log("Find Parents: ", findParents);
        return res.status(200).json({ message: 'Parent fetched successfully', parent: findParents });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
module.exports = getParentByStudentID;
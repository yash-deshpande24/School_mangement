const { Classes, OAuthToken } = require('../../models');

const deleteClass = async (req, res) => {
    try{
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
        if(findRole !== "Teacher" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {classId} = req.params;
        if(!classId) {
            return res.status(400).json({ message: "Class id is required" });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }
        classExist.isDeleted = true;
        await classExist.update({ isDeleted: true });
        return res.status(200).json({ message: 'Class deleted successfully'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = deleteClass
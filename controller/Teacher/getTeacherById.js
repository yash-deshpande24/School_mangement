const { OAuthClient, OAuthToken, UserInfo } = require('../../models');

const getTeacherById = async (req, res) => {
    try {
        const { teacherId } = req.params;
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
        const teacher = await UserInfo.findOne({ where: { id: teacherId, clientId: storeClientId, isDeleted: false } });
        if (!teacher) {
            return res.status(200).json({ message: 'Teacher not found' });
        }
        if (teacher.role !== "Teacher") {
            return res.status(400).json({ message: 'teacherId is not a teacher user' });
        }
        return res.status(200).json({ message: 'Teacher fetched successfully', teacher });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getTeacherById;
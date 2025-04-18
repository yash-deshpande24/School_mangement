const {OAuthToken, UserInfo, SchoolInfo, Subjects} = require('../../models');
const getAllSubjects = async (req, res) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token }});
        console.log("Admin Token: ", adminToken);
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
    
        const subjects = await Subjects.findAll({ where: { clientId: storeClientId }, attributes: { exclude: ['clientId'] } });
        if (subjects.length === 0) {
            return res.status(200).json({ message: 'No subjects found', subjects });
        }
        console.log("Subjects: ", subjects);
        return res.status(200).json({ message: 'Subjects fetched successfully', subjects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = getAllSubjects;
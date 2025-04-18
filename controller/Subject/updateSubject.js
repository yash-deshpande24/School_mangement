const { OAuthToken, UserInfo, SchoolInfo, Subjects} = require('../../models');

const updateSubject = async (req, res) => {
    const { subjectId } = req.params;
    const { subjectName } = req.body;
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
        console.log("Store Client ID: ", storeClientId);
        const findRole = adminToken.user.role;
        if (findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const subject = await Subjects.findOne({ where: { id: subjectId, clientId: storeClientId } });
        if (!subject) {
            return res.status(200).json({ message: 'Subject not found' });
        }
        subject.subject_name = subjectName;
        await subject.save();
        res.status(200).json({ message: 'Subject updated successfully' });  
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = updateSubject;
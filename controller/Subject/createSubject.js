const { OAuthToken, UserInfo, SchoolInfo, Subjects} = require('../../models');
const createSubject = async (req, res) => {
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

        const normalizedSubjectName = subjectName.toLowerCase();
        
        const subjectExists = await Subjects.findOne({ where: { subject_name: normalizedSubjectName, clientId: storeClientId } });
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject name is already in use' });
        }
        const subject = await Subjects.create({ subject_name:subjectName, clientId: storeClientId });
        
        res.status(201).json({ message: 'Subject created successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = createSubject;
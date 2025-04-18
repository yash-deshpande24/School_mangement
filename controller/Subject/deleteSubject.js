const { OAuthToken, Classes, SchoolInfo, Subjects} = require('../../models');


const deleteSubject = async (req, res) => {
    const { subjectId } = req.params;
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

        const classList = await Classes.findAll({ where: { subjectId: subjectId, clientId: storeClientId } });
        if (classList.length > 0) {
            await Promise.all(classList.map(async (item) => {
                await item.update({ subjectId: null });
                console.log(`Updated class: ${item.subjectId}`);
            }));
        }
        await subject.destroy();
        res.status(200).json({ message: 'Subject deleted successfully' });  
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = deleteSubject;
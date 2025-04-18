const { Section, Classes, OAuthToken } = require('../../models');

const createSection = async (req, res) => {
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
        if (findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { classId, sectionName } = req.body;
        if (!classId || classId === '' || !sectionName || sectionName === '') {
            return res.status(400).json({ message: 'Class id and section name are required' });
        }

        const sectionNameRegex = /^[a-zA-Z0-9\s]+$/;
        if (!sectionNameRegex.test(sectionName)) {
            return res.status(400).json({ message: 'Section name should only contain alphanumeric characters and spaces' });
        }

        const sectionExist = await Section.findOne({ where: { section_name: sectionName, classId: classId, clientId: storeClientId } });
        if (sectionExist) {
            return res.status(400).json({ message: "Section already exists" });
        }

        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }

        await Section.create({
            section_name: sectionName,
            classId: classId,
            clientId: storeClientId,
            isDeleted: false
        });

        return res.status(201).json({ message: 'Section created successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = createSection;
const { Section, Classes, OAuthToken } = require('../../models');

const deleteSection = async (req, res) => {
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
        const { sectionId } = req.params;
        if (!sectionId) {
            return res.status(400).json({ message: 'Section id is required' });
        }
        const sectionExist = await Section.findOne({ where: { id: sectionId, clientId: storeClientId } });
        if (!sectionExist) {
            return res.status(400).json({ message: "Section does not exist" });
        }
        // await Section.update({ isDeleted: true }, { where: { id: sectionId } });
        await sectionExist.destroy();
        return res.status(200).json({ message: 'Section deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = deleteSection
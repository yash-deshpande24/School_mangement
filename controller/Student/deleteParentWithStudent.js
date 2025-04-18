const { OAuthToken, SchoolParentStudent } = require('../../models');

const deleteParentWithStudent = async (req, res) => {
    const { studentId, parentId } = req.params;
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
        if(findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id } = req.params;
        
        const object = await SchoolParentStudent.findOne({ where: { id, clientId: storeClientId } });
        if (!object) {
            return res.status(200).json({ message: 'Parent not found' });
        }
        await object.update({ parentId: null });
        return res.status(200).json({ message: 'Parent deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = deleteParentWithStudent
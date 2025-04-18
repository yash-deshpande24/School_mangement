const {OAuthToken, UserInfo, SchoolInfo, Subjects, SchoolParentStudent} = require('../../models');

const deleteStudent = async (req, res) => {
    const { studentId } = req.params;
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
        if (findRole !== "Admin" && findRole !== "Owner" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const student = await UserInfo.findByPk(studentId, { where: { clientId: storeClientId, isDeleted: false } });
        if (!student) {
            return res.status(200).json({ message: 'Student not found' });
        }
        if (student.role !== "Student") {
            return res.status(400).json({ message: 'Student is not a student' });
        }
        
        const parentMapping = await SchoolParentStudent.findOne({ where: { student_id: studentId, clientId: storeClientId } });
        if (parent) {
            const parent = await UserInfo.findOne({ where: { parent_id:  parentMapping.parent_id, clientId: storeClientId, isDeleted: false } });
            await parent.destroy();
            await parentMapping.destroy();
        }
        await student.destroy();
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = deleteStudent;

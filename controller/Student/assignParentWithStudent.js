const {OAuthToken, UserInfo, SchoolInfo, Subjects, SchoolParentStudent} = require('../../models');

const assignParentWithStudent = async (req, res) => {
    const { studentId, parentId } = req.params;
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

        const school = await SchoolInfo.findOne({ where: { clientId: storeClientId } });
        if (!school) {
            return res.status(200).json({ message: 'School not found' });
        }

        const student = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!student) {
            return res.status(200).json({ message: 'Student not found' });
        }
        if (student.role !== "Student") {
            return res.status(400).json({ message: 'studentId is not a student user' });
        }
        
        const parent = await UserInfo.findOne({ where: { id: parentId, clientId: storeClientId, isDeleted: false } });
        if (!parent) {
            return res.status(200).json({ message: 'Parent not found' });
        }
        if (parent.role !== "Parent") {
            return res.status(400).json({ message: 'parentId is not a parent user' });
        }

        const isParentAlreadyAssigned = await SchoolParentStudent.findOne({ where: { studentId: studentId, parentId: null, clientId: storeClientId } });
        if (isParentAlreadyAssigned) {
            await isParentAlreadyAssigned.update({ parentId: parentId });
            return res.status(200).json({ message: 'Parent assigned successfully' });
        }else {
            await SchoolParentStudent.create({schoolId: school.id , studentId: studentId, parentId: parentId, clientId: storeClientId });
            return res.status(200).json({ message: 'Parent assigned successfully' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = assignParentWithStudent;
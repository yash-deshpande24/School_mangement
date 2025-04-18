const { Classes, OAuthToken, UserInfo,ClassEnrollments} = require('../../models');

const getStudentsOfClass = async (req, res) => {
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
        if(findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {className} = req.params;
        console.log("Class Name: ", className);
        const classExist = await Classes.findAll({ where: { class_name: className, clientId: storeClientId } });

        console.log("Class Exist: ", classExist);
        if (!classExist) {
            return res.status(200).json({ message: "Class not found" });
        }

        if (classExist.length === 0) {
            return res.status(200).json({ message: "Class not found" });
        }

        const findStudentId = await ClassEnrollments.findAll({ where: { classId: classExist[0].id, clientId: storeClientId } });
        if (findStudentId.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }

        const mapStudentId = findStudentId.map(student => student.studentId);
        console.log("Map Student Id: ", mapStudentId);
        const students = await UserInfo.findAll({ where: { id: mapStudentId, clientId: storeClientId, isDeleted: false }, attributes: ['id', 'firstName', 'lastName', 'email', 'role'] });
        return res.status(200).json({ message: 'Students fetched successfully', students });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getStudentsOfClass

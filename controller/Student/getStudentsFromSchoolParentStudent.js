const {SchoolParentStudent, OAuthToken, UserInfo} = require("../../models");

const getAllStudents = async (req, res) => {
    try{
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
        const students = await SchoolParentStudent.findAll({ clientId: storeClientId,parentId:null});
        if(students.length === 0){
            return res.status(200).json({ message: 'No students found' });
        }
        console.log("Students: ", students);

        const studentIds = students.map((student) => student.studentId);

        console.log("Student IDs: ", studentIds);
        const studentsInfo = await UserInfo.findAll({ where: { id: studentIds, role: "Student", clientId: storeClientId, isDeleted: false },attributes: ['id', 'firstName', 'lastName', 'mobileno', 'email'] });
        if(studentsInfo.length === 0){
            return res.status(200).json({ message: 'No students found' });
        }
        console.log("Students: ", studentsInfo);

        return res.status(200).json({message: 'Students fetched successfully', students: studentsInfo});
    }catch(err){
        return res.status(500).json({ message: err.message });}
    }

module.exports = getAllStudents;
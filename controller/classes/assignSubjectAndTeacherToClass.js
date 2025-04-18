const { Classes, OAuthToken, UserInfo, Subjects } = require('../../models');

const assignSubjectAndTeacherToClass = async (req, res) => {

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
        const {classId, subjectId, teacherId} = req.params;
        if(!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }
        if(!teacherId) {
            return res.status(400).json({ message: "Teacher ID is required" });

        }
        if(!subjectId) {
            return res.status(400).json({ message: "Subject ID is required" });
        }

        const subjectData = await Subjects.findOne({ where: { id: subjectId, clientId: storeClientId } });
        if (!subjectData) {
            return res.status(200).json({ message: "Subject not found" });
        }
        const classData = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classData) {
            return res.status(200).json({ message: "Class not found" });
        }
        const teacherData = await UserInfo.findOne({ where: { id: teacherId, clientId: storeClientId, role: "Teacher", isDeleted: false} });
        if (!teacherData) {
            return res.status(200).json({ message: "Teacher not found" });
        }
       
        if ((classData.teacherId !== null) && (classData.subjectId !== null) && (classData.teacherId != teacherId)) {
            await Classes.create({
                class_name: classData.class_name,
                teacherId: teacherId,
                subjectId: subjectId,
                clientId: classData.clientId,
                isDeleted: false
            })
            return res.status(200).json({ message: 'Teacher and subject assigned successfully'});
        }else if (classData.teacherId === null && classData.subjectId === null) {
            classData.teacherId = teacherId;
            classData.subjectId = subjectId;
            await classData.save();
            return res.status(200).json({ message: 'Teacher and subject assigned successfully'});
        }else {
            return res.status(400).json({ message: "Teacher with subject already exist" });
        }
        
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}    
module.exports = assignSubjectAndTeacherToClass
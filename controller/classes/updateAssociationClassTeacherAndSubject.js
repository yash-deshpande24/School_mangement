const { Classes, OAuthToken, Subjects, UserInfo, PendingFees, FeeStructure, Section} = require('../../models');
const { Op } = require('sequelize');
const updateAssociationClassTeacherAndSubject = async (req, res) => {
    try{
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

        const {id, teacherId, subjectId} = req.params;
        if(!id ) {
            return res.status(400).json({ message: "Class id is required" });
        }else if(!teacherId ) {
            return res.status(400).json({ message: "Teacher id is required" });
        }else if(!subjectId ) {
            return res.status(400).json({ message: "Subject id is required" });
        }
        console.log("HELLO*******")
        const classExist = await Classes.findOne({ 
            where: { 
                id: parseInt(id),
                clientId: storeClientId, 
                subjectId: { [Op.not]: null }, 
                teacherId: { [Op.not]: null }, 
                isDeleted: false 
            }, 
            attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } 
        });
        console.log("classExist: ******************************", classExist);

        if (!classExist) {
            return res.status(200).json({ message: 'No classes found with teacherId and subjectId' });
        }else if(classExist.teacherId == teacherId && classExist.subjectId == subjectId) {
            return res.status(400).json({ message: "Class already assigned to this teacher and subject" });
        }
        const teacherExist = await UserInfo.findOne({ where: { id: teacherId, clientId: storeClientId, isDeleted: false } });
        const subjectExist = await Subjects.findOne({ where: { id: subjectId, clientId: storeClientId} });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }else if (!teacherExist) {
            return res.status(400).json({ message: "Teacher does not exist" });
        }else if (!subjectExist) {
            return res.status(400).json({ message: "Subject does not exist" });
        }
        console.log("&&&&&&&&&&&&&&&&&&&&Hello: ", subjectExist.id)
        await Classes.update({ teacherId, subjectId }, { where: { id, clientId: storeClientId } });
        return res.status(200).json({ message: 'Class updated successfully'});

    } catch (err) {
        return res.status(500).json({message: err.message });
    }
}

module.exports = updateAssociationClassTeacherAndSubject
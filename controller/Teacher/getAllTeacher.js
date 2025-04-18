// CREATE TYPE role AS ENUM ('Parent', 'Student', 'Admin', 'Owner', 'Teacher');
const {OAuthClient, OAuthToken, UserInfo, TeacherDepartmentAssociation, Department} = require('../../models');

const getAllTeachers = async (req, res) => {
    try{
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token }});
        console.log("Admin Token: ", adminToken.user.role);
        let role = adminToken.user.role;
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        if (role !== "Admin" && role !== "Owner" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);

        var teachers = await UserInfo.findAll({where : { clientId: storeClientId, role: "Teacher", isDeleted: false }, attributes: {exclude: ['password', 'isDeleted', 'createdAt', 'updatedAt', 'clientId', 'role']}});

        const departments = await Department.findAll({where : { clientId: storeClientId}});

        for (let index = 0; index < teachers.length; index++) {
            const teacher = teachers[index];
            const teacTeacherDepartmentAssociation = await TeacherDepartmentAssociation.findOne({where : { teacherId: teacher.id }});
            if(teacTeacherDepartmentAssociation!=null){
                teachers[index].dataValues.departmentId = teacTeacherDepartmentAssociation.departmentId;
                departments.forEach(department => {
                    department.id == teacTeacherDepartmentAssociation.departmentId ? teachers[index].dataValues.departmentName = department.name : ""
                });
            }
        }

        console.log("Teachers: ", teachers);
        return res.status(200).json({message: 'Teachers fetched successfully', teachers});
    }catch(err){
        return res.status(500).json({ message: err.message });}

    }

module.exports = getAllTeachers;
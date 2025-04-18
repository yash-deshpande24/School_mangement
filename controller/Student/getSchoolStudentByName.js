const { Classes, OAuthToken, UserInfo, SchoolParentStudent } = require('../../models');
const { Op } = require("sequelize");

const getSchoolStudentByName = async (req, res) => {
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

        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
        const offset = (page - 1) * limit;

        // Search students by name with pagination
        let { rows: _students, count: totalStudents } = await UserInfo.findAndCountAll({ 
            where: { 
                firstName: { [Op.iLike]: `%${name}%` }, 
                clientId: storeClientId,
                role: "Student", 
                isDeleted: false 
            },
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        // If no students are found, attempt to search by ID
        if (_students.length === 0) {
            const result = await UserInfo.findAndCountAll({ 
                where: { 
                    id: name, 
                    clientId: storeClientId,
                    role: "Student", 
                    isDeleted: false 
                },
                offset: parseInt(offset),
                limit: parseInt(limit)
            });

            _students = result.rows;
            totalStudents = result.count;
        }

        if (_students.length === 0) {
            return res.status(200).json({ message: 'No students found', students: [] });
        }

        const studentIds = _students.map((student) => student.id);

        // Find parents associated with the fetched studentIds
        const parentRelations = await SchoolParentStudent.findAll({
            where: { studentId: studentIds, clientId: storeClientId }
        });

        const parentIds = parentRelations.map((relation) => relation.parentId);

        // Fetch parent details using the parentIds
        const parents = await UserInfo.findAll({
            where: { id: parentIds, clientId: storeClientId, isDeleted: false }
        });

        // Prepare the response with students and their associated parents
        const students = _students.map((student) => {
            const studentParentRelations = parentRelations.filter((relation) => relation.studentId === student.id);
            const studentParents = studentParentRelations.map((relation) => {
                const parent = parents.find((parent) => parent.id === relation.parentId);
                if (parent) {
                    const cleanedParent = parent.get({ plain: true });
                    delete cleanedParent.clientId; // Exclude clientId from parent object
                    return cleanedParent;
                }
                return null;
            });

            // Get plain object without Sequelize metadata for student
            const cleanedStudent = student.get({ plain: true });

            // Exclude clientId from cleanedStudent
            delete cleanedStudent.clientId;

            return {
                student: cleanedStudent,
                parent: studentParents.length > 0 ? studentParents : undefined
            };
        });

        const totalPages = Math.ceil(totalStudents / limit);

        return res.status(200).json({
            message: 'Students fetched successfully',
            pagination: {
                totalStudents,
                currentPage: parseInt(page),
                totalPages,
                pageSize: parseInt(limit),
                students,
            }
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getSchoolStudentByName;


// const { Classes, OAuthToken, UserInfo, SchoolParentStudent } = require('../../models');
// const { Op } = require("sequelize");

// const getSchoolStudentByName = async (req, res) => {
//     try {
//         const accessToken = req.headers.authorization;
//         if (!accessToken || !accessToken.startsWith('Bearer ')) {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         const token = accessToken.split(' ')[1];
//         const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
//         if (!adminToken) {
//             return res.status(400).json({ message: "Invalid token" });
//         }
//         const storeClientId = adminToken.client.id;
//         const getAdminId = adminToken.user.id;
//         const findRole = adminToken.user.role;
//         if(findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         const { name } = req.params;
//         if (!name) {
//             return res.status(400).json({ message: 'Name is required' });
//         }
//         // const students = await UserInfo.findAll({ where: { name: name, clientId: storeClientId, isDeleted: false } });
//         var _students = await UserInfo.findAll({ 
//             where: { 
//                 firstName: { [Op.iLike]: `%${name}%` }, 
//                 clientId: storeClientId,
//                 role: "Student", 
//                 isDeleted: false 
//             } 
//         });

//         if(_students.length === 0 ){
//             _students = await UserInfo.findAll({ 
//                 where: { 
//                     id: name, 
//                     clientId: storeClientId,
//                     role: "Student", 
//                     isDeleted: false 
//                 } 
//             });
//         }

//         const studentIds = _students.map((student) => student.id);

//         // Find parents associated with the fetched studentIds
//         const parentRelations = await SchoolParentStudent.findAll({
//             where: { studentId: studentIds, clientId: storeClientId }
//         });

//         const parentIds = parentRelations.map((relation) => relation.parentId);

//         // Fetch parent details using the parentIds
//         const parents = await UserInfo.findAll({
//             where: { id: parentIds, clientId: storeClientId, isDeleted: false }
//         });

//         // Prepare the response with students and their associated parents
//         const students = _students.map((student) => {
//             const studentParentRelations = parentRelations.filter((relation) => relation.studentId === student.id);
//             const studentParents = studentParentRelations.map((relation) => {
//                 const parent = parents.find((parent) => parent.id === relation.parentId);
//                 if (parent) {
//                     const cleanedParent = parent.get({ plain: true });
//                     delete cleanedParent.clientId; // Exclude clientId from parent object
//                     return cleanedParent;
//                 }
//                 return null;
//             });

//             // Assuming each student should have only one parent, you can directly access the first parent in the array
//             const studentParent = studentParents.length > 0 ? studentParents : null;

//             // Get plain object without Sequelize metadata for student
//             const cleanedStudent = student.get({ plain: true });

//             // Exclude clientId from cleanedStudent
//             delete cleanedStudent.clientId;

//             return {
//                 student: cleanedStudent,
//                 parent: studentParent || undefined // Exclude parent field if it's null
//             };
//         });

//         return res.status(200).json({ students });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }
// module.exports = getSchoolStudentByName
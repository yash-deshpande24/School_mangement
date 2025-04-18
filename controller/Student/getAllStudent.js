const { OAuthToken, UserInfo, SchoolParentStudent, ClassEnrollments, Classes, Section } = require('../../models');

const getAllStudents = async (req, res) => {
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

        const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10
        const offset = (page - 1) * limit;

        let role = adminToken.user.role;
        if (role !== "Admin" && role !== "Owner" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;

        // Fetch students with pagination
        const { rows: students, count: totalStudents } = await UserInfo.findAndCountAll({
            where: { clientId: storeClientId, role: "Student", isDeleted: false },
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        if (students.length === 0) {
            return res.status(200).json({ message: 'No students found',pagination: { totalStudents, currentPage:1,
                totalPages :1,
                pageSize: 10,
                students: []} });
        }

        const studentIds = students.map((student) => student.id);

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
        const studentsWithParents = await Promise.all(students.map(async (student) => {

            // add associated class name and ID while returning student List
            const classEnrollments = await ClassEnrollments.findAll({ where: { studentId: student.id } });
            var details = [];
            for (let index = 0; index < classEnrollments.length; index++) {
                const classEnrollmentDetails = classEnrollments[index];
                var sectionID = null;
                var sectionName = "";
                if (classEnrollmentDetails.sectionId !== null) {
                    sectionID = classEnrollmentDetails.sectionId;
                    const section = await Section.findOne({ where: { id: classEnrollmentDetails.sectionId } });
                    sectionName = section.section_name;
                }
                const classes = await Classes.findOne({ where: { id: classEnrollmentDetails.classId } });
                details.push({
                    classId: classes.id,
                    className: classes.class_name,
                    sectionId: sectionID,
                    sectionName: sectionName
                });
            }

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

            const studentParent = studentParents.length > 0 ? studentParents : null;

            const cleanedStudent = student.get({ plain: true });

            delete cleanedStudent.clientId;
            cleanedStudent['classDetails'] = details;

            return {
                student: cleanedStudent,
                parent: studentParent || undefined
            };
        }));

        const totalPages = Math.ceil(totalStudents / limit);

        return res.status(200).json({
            message: 'Students fetched successfully',
            
            pagination: {
                totalStudents,
                currentPage: parseInt(page),
                totalPages,
                pageSize: parseInt(limit),
                students: studentsWithParents,
            }
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getAllStudents;


// const { OAuthToken, UserInfo, SchoolParentStudent, ClassEnrollments, Classes, Section } = require('../../models');

// const getAllStudents = async (req, res) => {
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

//         let role = adminToken.user.role;
//         if (role !== "Admin" && role !== "Owner" && role !== "Teacher") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }

//         const storeClientId = adminToken.client.id;

//         // Fetch students belonging to the specified client and role 'Student'
//         const students = await UserInfo.findAll({
//             where: { clientId: storeClientId, role: "Student", isDeleted: false }
//         });

//         if (students.length === 0) {
//             return res.status(200).json({ message: 'No students found', students});
//         }

//         const studentIds = students.map((student) => student.id);

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
//         const studentsWithParents = await Promise.all(students.map(async(student) => {

//             // add associated class name and ID while returning student List
//             const classEnrollments = await ClassEnrollments.findAll({ where: { studentId: student.id } });
//             var details = [];
//             for (let index = 0; index < classEnrollments.length; index++) {
//                 const classEnrollmentDetails = classEnrollments[index];
//                 var sectionID = null;
//                 var sectionName = "";
//                 if (classEnrollmentDetails.sectionId !== null) {
//                     sectionID = classEnrollmentDetails.sectionId;
//                     const section = await Section.findOne({ where: { id: classEnrollmentDetails.sectionId } });
//                     sectionName = section.section_name;
//                 }
//                 const classes = await Classes.findOne({ where: { id: classEnrollmentDetails.classId } });
//                  details.push({
//                     classId: classes.id,
//                     className: classes.class_name,
//                     sectionId: sectionID,
//                     sectionName: sectionName
//                 });
//             }
                
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
//             cleanedStudent['classDetails'] = details;
            
//             return {
//                 student: cleanedStudent,
//                 parent: studentParent || undefined // Exclude parent field if it's null
//             };
//         }));

//         return res.status(200).json({
//             message: 'Students fetched successfully',
//             students: studentsWithParents
//         });

//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// };

// module.exports = getAllStudents;

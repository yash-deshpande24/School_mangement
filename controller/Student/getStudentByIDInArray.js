

const { OAuthToken, UserInfo, SchoolParentStudent, ClassEnrollments, Classes } = require('../../models');

const getStudentByIdInArray = async (req, res) => {
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

        let role = adminToken.user.role;
        if (role !== "Admin" && role !== "Owner" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;

        // Fetch students based on the provided studentId(s)
        const { studentId } = req.params;
        const students = await UserInfo.findAll({
            where: { id: studentId, clientId: storeClientId, role: "Student", isDeleted: false }
        });

        if (students.length === 0) {
            return res.status(200).json({ message: 'No students found' });
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

        // Fetch class details associated with the student(s)
        const classEnrollments = await ClassEnrollments.findAll({ where: { studentId: studentIds } });
        const classDetails = await Promise.all(classEnrollments.map(async (enrollment) => {
            const classData = await Classes.findOne({ where: { id: enrollment.classId, clientId: storeClientId } });
            if (classData) {
                return {
                    classId: classData.id,
                    className: classData.class_name
                };
            }
            return null;
        }));

        // Map parent details to student's parent relations
        const studentsWithParents = students.map((student) => {
            const studentId = student.id;
            const studentParentRelations = parentRelations.filter((relation) => relation.studentId === studentId);
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
            delete cleanedStudent.clientId; // Exclude clientId from student object
            cleanedStudent['classDetails'] = classDetails.filter((detail) => detail !== null);

            return {
                student: cleanedStudent,
                parent: studentParents.length > 0 ? studentParents : undefined // Exclude parent field if it's empty
            };
        });

        return res.status(200).json({
            message: 'Students fetched successfully',
            students: studentsWithParents
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getStudentByIdInArray;


const { Classes, OAuthToken, UserInfo, Subjects } = require('../../models');
const { Op } = require('sequelize');

const getAllClassesWithTeacherAndSubject = async (req, res) => {
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
        if (findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Fetch classes with teacherId and subjectId
        const classes = await Classes.findAll({
            where: {
                clientId: storeClientId,
                subjectId: { [Op.not]: null },
                teacherId: { [Op.not]: null },
                isDeleted: false
            },
            attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] }
        });

        if (classes.length === 0) {
            return res.status(200).json({ message: 'No classes found', classes });
        }

        // Fetch teacher names
        const teacherIds = classes.map(c => c.teacherId);
        const teachers = await UserInfo.findAll({
            where: {
                id: { [Op.in]: teacherIds },
                clientId: storeClientId,
                isDeleted: false
            },
            attributes: ['id', 'firstName', 'lastName'] // Assuming 'fullName' is the attribute containing the teacher's name
        });

        // Fetch subject names
        const subjectIds = classes.map(c => c.subjectId);
        const subjects = await Subjects.findAll({
            where: {
                id: { [Op.in]: subjectIds }
            },
            attributes: ['id', 'subject_name'] // Assuming 'subjectName' is the attribute containing the subject's name
        });

        // Map teacherId to teacherName
        // const teacherMap = {};
        // teachers.forEach(teacher => {
        //     teacherMap[teacher.id] = teacher.firstName;
        //     teacherMap[teacher.id] += ' ';
        //     teacherMap[teacher.id] += teacher.lastName;
        // });

        const teacherMap = {};
        teachers.forEach(teacher => {
            if (teacher) {
                teacherMap[teacher.id] = `${teacher.firstName} ${teacher.lastName}`;
            }
        });

        // Map subjectId to subjectName
        const subjectMap = {};
        subjects.forEach(subject => {
            subjectMap[subject.id] = subject.subject_name;
        });

        // Prepare response with teacherName and subjectName
        // const classesWithDetails = classes.map(c => ({
        //     id: c.id,
        //     className: c.class_name, // Adjust attributes as per your Class model
        //     teacherId: c.teacherId,
        //     teacherName: teacherMap[c.teacherId],
        //     subjectId: c.subjectId,
        //     subjectName: subjectMap[c.subjectId],
        //     // Add other attributes as needed
        // }));

        const classesWithDetails = classes.map(c => ({
            id: c.id,
            className: c.class_name,
            teacherId: c.teacherId,
            teacherName: teacherMap[c.teacherId],
            subjectId: c.subjectId,
            subjectName: subjectMap[c.subjectId],
        })).filter(c => c.teacherName && c.subjectName);

        return res.status(200).json({ message: 'Classes fetched successfully', classes: classesWithDetails });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getAllClassesWithTeacherAndSubject;
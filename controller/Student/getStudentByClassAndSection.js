
const { ClassEnrollments, Classes, OAuthToken, UserInfo, Section } = require('../../models');

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
        const findRole = adminToken.user.role;
        if (findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { classId, sectionId } = req.params;
        if (!classId) {
            return res.status(400).json({ message: 'Class id is required' });
        }
        if (!sectionId) {
            return res.status(400).json({ message: 'Section id is required' });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(200).json({ message: "Class not found" });
        }

        let sectionExist;
        if (sectionId) {
            sectionExist = await Section.findOne({ where: { id: sectionId, classId: classId, clientId: storeClientId, isDeleted: false } });
            if (!sectionExist) {
                return res.status(200).json({ message: "Section not found for this class" });
            }
        }

        const enrollments = await ClassEnrollments.findAll({
            where: { classId: classId, sectionId: sectionId, clientId: storeClientId },
            attributes: ['studentId', 'classId', 'sectionId']
        });

        if (enrollments.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }

        const students = await Promise.all(
            enrollments.map(async (enrollment) => {
                console.log("Enrollment*************: ", enrollment);
                const userInfo = await UserInfo.findOne({
                    where: { id: enrollment.studentId, clientId: storeClientId, isDeleted: false },
                    attributes: ['firstName', 'lastName']
                });
                console.log("User Info*************: ", userInfo);
                if (userInfo !== null && userInfo.firstName !== null) {
                    return {
                        studentId: enrollment.studentId,
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        classId: enrollment.classId !== null ? enrollment.classId : -1,
                        className: classExist.class_name !== null ? classExist.class_name : "",
                        sectionId: enrollment.sectionId !== null ? enrollment.sectionId : -1,
                        sectionName: sectionExist !== null ? sectionExist.section_name : ""
                    };
                }
            })
        );

        console.log("Students*************: ", students);

        const filteredStudents = students.filter(student => student !== undefined);
        console.log("Filtered Students*******************: ", filteredStudents);
        if (filteredStudents.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }

        return res.status(200).json({ message: 'Students fetched successfully', filteredStudents: filteredStudents });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getStudentsOfClass;
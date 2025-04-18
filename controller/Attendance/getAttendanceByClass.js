
const { ClassEnrollments, Classes, OAuthToken, UserInfo, Section, Attendance } = require('../../models');

const getStudentsAttendaceOfClass = async (req, res) => {
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
        const { classId } = req.params;
        console.log("Class ID: ", classId);
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(200).json({ message: "Class not found" });
        }

        const sectionExist = await Section.findOne({ where: { classId: classId, clientId: storeClientId, isDeleted: false } });

        const enrollments = await ClassEnrollments.findAll({
            where: { classId: classId, clientId: storeClientId },
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
                    attributes: ['firstName']
                });
                const attendance = await Attendance.findOne({
                    where: { studentId: enrollment.studentId, classId: classId, clientId: storeClientId},
                    attributes: ['status']
                })
                console.log("User Info*************: ", userInfo);
                if (userInfo !== null && userInfo.firstName !== null) {
                    return {
                        studentId: enrollment.studentId,
                        firstName: userInfo.firstName,
                        classId: enrollment.classId !== null ? enrollment.classId : -1,
                        className: classExist.class_name !== null ? classExist.class_name : "",
                        sectionId: sectionExist !== null ? sectionExist.id : -1, // Add null check here
                        sectionName: sectionExist !== null ? sectionExist.section_name : "", // Add null check here
                        status: attendance.status
                    };
                }
            })
        );

        console.log("Students*************: ", students);

        // Filter out undefined entries (null returns) from students array
        const filteredStudents = students.filter(student => student !== undefined);
        console.log("Filtered Students*******************: ", filteredStudents);
        if (filteredStudents.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }
        return res.status(200).json({ message: 'Students fetched successfully', filteredStudents });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getStudentsAttendaceOfClass;

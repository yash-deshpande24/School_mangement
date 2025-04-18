const { Classes, OAuthToken, ClassEnrollments, UserInfo } = require('../../models');

const enrollStudentsInClass = async (req, res) => {
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
        const { classId } = req.params
        const { studentIds } = req.body;
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: "An array of student ids is required" });
        }
        if (!classId) {
            return res.status(400).json({ message: "Class id is required" });
        }

        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }

        let results = [];

        for (const studentId of studentIds) {
            const studentExist = await UserInfo.findOne({ where: { id:studentId, clientId: storeClientId , role: "Student", isDeleted: false} });
            // Uncomment the following lines if you need to check if the student exists
            if (!studentExist) {
                results.push({ studentId, status: "failed", message: "Student does not exist" });
                continue;
            }

            const classEnrollment = await ClassEnrollments.findOne({ where: { studentId, classId } });
            if (classEnrollment) {
                results.push({ studentId, status: "failed", message: "Student already enrolled in this class" });
                continue;
            }

            const newClassEnrollment = await ClassEnrollments.create({
                studentId,
                classId,
                clientId: storeClientId,
            });

            results.push({ studentId, status: "success", newClassEnrollment });
        }

        return res.status(201).json({ message: 'Class enrollments processed'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = enrollStudentsInClass;

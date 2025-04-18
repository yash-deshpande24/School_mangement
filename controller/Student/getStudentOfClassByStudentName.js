const { ClassEnrollments, Classes, OAuthToken, UserInfo, Section } = require('../../models');
const { Op } = require('sequelize'); // Import Sequelize's operators

const getStudentsOfClassByStudentName = async (req, res) => {
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

        const { studentName } = req.params;

        // Find users matching the studentName
        const findUsers = await UserInfo.findAll({
            where: {
                [Op.or]: [
                    { firstName: { [Op.iLike]: `%${studentName}%` } },
                    { lastName: { [Op.iLike]: `%${studentName}%` } }
                ],
                clientId: storeClientId,
                isDeleted: false
            }
        });

        if (findUsers.length === 0) {
            return res.status(200).json({ message: "No students found" });
        }

        // Extract user IDs from found users
        const mapUserIds = findUsers.map(user => user.id);

        // Find class enrollments for the found user IDs
        const enrollments = await ClassEnrollments.findAll({
            where: { studentId: { [Op.in]: mapUserIds }, clientId: storeClientId }
        });

        // Extract class IDs from enrollments
        const mapClassIds = enrollments.map(enrollment => enrollment.classId);

        // Find class names based on the extracted class IDs
        const findClasses = await Classes.findAll({
            where: { id: { [Op.in]: mapClassIds }, clientId: storeClientId }
        });

        // Map section IDs from enrollments
        const mapSectionIds = enrollments.map(enrollment => enrollment.sectionId);

        // Find section names based on the extracted section IDs
        const findSections = await Section.findAll({
            where: { id: { [Op.in]: mapSectionIds }, clientId: storeClientId }
        });

        // Prepare the response with students, including class and section details
        const filteredStudents = enrollments.map(enrollment => {
            const user = findUsers.find(user => user.id === enrollment.studentId);
            const className = findClasses.find(cls => cls.id === enrollment.classId)?.class_name || "";
            const sectionName = findSections.find(sec => sec.id === enrollment.sectionId)?.section_name || "";
            const addName = user ? `${user.firstName} ${user.lastName}` : "";

            return {
                studentId: user.id,
                firstName: addName,
                // lastName: user.lastName,
                classId: enrollment.classId !== null ? enrollment.classId : -1,
                className: className,
                sectionId: enrollment.sectionId !== null ? enrollment.sectionId : -1,
                sectionName: sectionName
            };
        });

        return res.status(200).json({ message: 'Students fetched successfully', filteredStudents });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getStudentsOfClassByStudentName;
const { Notices, OAuthToken, UserInfo, SchoolParentStudent, ClassEnrollments } = require('../../models');

const getNoticeToClass = async (req, res) => {
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

        if (findRole !== "Student" && findRole !== "Parent") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Fetch all notices for the client
        const notices = await Notices.findAll({ where: { clientId: storeClientId } });
        if (!notices || notices.length === 0) {
            return res.status(200).json({ message: 'Notices not found' });
        }

        // Fetch enrolled classes if user is a student
        let classData = [];
        if (findRole === "Student") {
            classData = await ClassEnrollments.findAll({ where: { clientId: storeClientId } });
        }

        // Filter notices based on user role
        let relevantNotices = [];

        if (findRole === "Student") {
            const studentNotices = notices.filter(notice => notice.studentId === getAdminId);
            const classNotices = notices.filter(notice => classData.some(enrollment => enrollment.classId === notice.classId && enrollment.studentId === getAdminId));
            relevantNotices = [...studentNotices, ...classNotices];
        } else if (findRole === "Parent") {
            const parentStudents = await SchoolParentStudent.findAll({ where: { parentId: getAdminId } });
            const parentStudentIds = parentStudents.map(ps => ps.studentId);

            const parentNotices = notices.filter(notice => notice.forParents && parentStudentIds.includes(notice.studentId));
            const studentNotices = notices.filter(notice => parentStudentIds.includes(notice.studentId));
            const classNotices = notices.filter(notice => classData.some(enrollment => enrollment.classId === notice.classId && parentStudentIds.includes(notice.studentId)));
            relevantNotices = [...parentNotices, ...studentNotices, ...classNotices];
        }

        if (relevantNotices.length === 0) {
            return res.status(200).json({ message: 'No relevant notices found' });
        }

        // Fetch user info for posted_by field in relevant notices
        const postedByIds = relevantNotices.map(notice => notice.posted_by);
        const postedByUsers = await UserInfo.findAll({ where: { id: postedByIds } });

        // Map notices with usernames
        const noticesWithUsernames = relevantNotices.map(notice => {
            const postedByUser = postedByUsers.find(user => user.id === notice.posted_by);
            return {
                ...notice.dataValues,
                posted_by_username: postedByUser ? `${postedByUser.firstName} ${postedByUser.lastName}` : null
            };
        });

        res.status(200).json({ message: 'Notices fetched successfully', notices: noticesWithUsernames });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getNoticeToClass;

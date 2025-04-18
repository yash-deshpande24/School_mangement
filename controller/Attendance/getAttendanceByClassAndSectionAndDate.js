const { ClassEnrollments, Classes, OAuthToken, UserInfo, Section, Attendance } = require('../../models');

const getStudentsAttendaceOfClassAndSectionWithDate = async (req, res) => {
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

        const { classId, sectionId, date, page = 1, limit = 10 } = req.query;
        if (!classId || !sectionId || !date) {
            return res.status(400).json({ message: "Class ID, Section ID, and Date are required" });
        }

        const findClasses = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!findClasses) {
            return res.status(400).json({ message: "Class does not exist" });
        }
        const storeClassName = findClasses.class_name;

        const sectionExist = await Section.findOne({ where: { classId: classId, clientId: storeClientId, isDeleted: false, id: sectionId } });
        if (!sectionExist) {
            return res.status(200).json({ message: "Section not found", sectionExist });
        }

        // Fetch enrollments with pagination
        const offset = (page - 1) * limit;
        const { rows: enrollments, count: totalEnrollments } = await ClassEnrollments.findAndCountAll({
            where: { classId: classId, clientId: storeClientId, sectionId: sectionId },
            offset: parseInt(offset),
            limit: parseInt(limit)
        });

        if (enrollments.length === 0) {
            return res.status(200).json({ message: "No students found", enrollments });
        }

        const students = [];

        for (const enrollment of enrollments) {
            const userInfo = await UserInfo.findOne({
                where: { id: enrollment.studentId, clientId: storeClientId, isDeleted: false }
            });

            const attendance = await Attendance.findOne({
                where: { studentId: enrollment.studentId, classId: classId, attendance_date: date, clientId: storeClientId },
                attributes: ['status']
            });

            if (attendance) {
                students.push({
                    studentId: enrollment.studentId,
                    firstName: userInfo ? userInfo.firstName : 'Unknown',
                    lastName: userInfo ? userInfo.lastName : 'Unknown',
                    classId: enrollment.classId || -1,
                    className: storeClassName || "",
                    sectionId: enrollment.sectionId || -1,
                    sectionName: sectionExist.section_name,
                    status: attendance.status
                });
            }
        }

        const totalPages = Math.ceil(totalEnrollments / limit);

        if (students.length === 0) {
            return res.status(200).json({ message: "Attendance not found for any student",pagination: { totalEnrollments, currentPage: parseInt(page), totalPages, pageSize: parseInt(limit), students } });
        }

        return res.status(200).json({
            message: 'Students fetched successfully',
            pagination: {
                totalEnrollments,
                currentPage: parseInt(page),
                totalPages,
                pageSize: parseInt(limit),
                students
            }
        });

    } catch (err) {
        console.error("Error in getStudentsAttendaceOfClassAndSectionWithDate:", err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getStudentsAttendaceOfClassAndSectionWithDate;


// const { ClassEnrollments, Classes, OAuthToken, UserInfo, Section, Attendance } = require('../../models');
// const getStudentsAttendaceOfClassAndSectionWithDate = async (req, res) => {
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
//         const findRole = adminToken.user.role;
//         if (findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
//                 return res.status(401).json({ message: "Unauthorized" });
//             }
//         const { classId, sectionId, date } = req.query;
//         if (!classId || !sectionId || !date) {
//             return res.status(400).json({ message: "Class ID, Section ID and Date are required" });
//         }
        
//         const findClasses = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
//         if (!findClasses) {
//             return res.status(400).json({ message: "Class does not exist" });
//         }
//         const storeClassName = findClasses.class_name;
        
//         const sectionExist = await Section.findOne({ where: { classId: classId, clientId: storeClientId, isDeleted: false, id: sectionId } });
//         if (!sectionExist) {
//             return res.status(200).json({ message: "Section not found", sectionExist });
//         }
        
//         const enrollments = await ClassEnrollments.findAll({
//             where: { classId: classId, clientId: storeClientId, sectionId: sectionId }
//         });

//         if (enrollments.length === 0) {
//             return res.status(200).json({ message: "No students found", enrollments });
//         }
        
//         const students = [];
        
//         for (const enrollment of enrollments) {
//             const userInfo = await UserInfo.findOne({
//                 where: { id: enrollment.studentId, clientId: storeClientId, isDeleted: false }
//             });

//             const attendance = await Attendance.findOne({
//                 where: { studentId: enrollment.studentId, classId: classId, attendance_date: date, clientId: storeClientId },
//                 attributes: ['status']
//             });

//             if (attendance) {
//                 students.push({
//                     studentId: enrollment.studentId,
//                     firstName: userInfo ? userInfo.firstName : 'Unknown',
//                     lastName: userInfo ? userInfo.lastName : 'Unknown',
//                     classId: enrollment.classId || -1,
//                     className: storeClassName || "",
//                     sectionId: enrollment.sectionId || -1,
//                     sectionName: sectionExist.section_name,
//                     status: attendance.status
//                 });
//             }
//             // If attendance is not found, do nothing (skip adding to students array)
//         }

//         if (students.length === 0) {
//             return res.status(200).json({ message: "Attendance not found for any student", students });
//         }

//         return res.status(200).json({ message: 'Students fetched successfully', students });
//     } catch (err) {
//         console.error("Error in getStudentsAttendaceOfClassAndSectionWithDate:", err);
//         return res.status(500).json({ message: err.message });
//     }
// };

// module.exports = getStudentsAttendaceOfClassAndSectionWithDate;
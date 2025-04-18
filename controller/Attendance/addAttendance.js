// ('Present', 'Absent', 'Late', 'Excused')
const {Attendance, OAuthToken, UserInfo, Classes, ClassEnrollments} = require('../../models');

const addAttendance = async (req, res) => {
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
        if(findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {studentArray, classId,attendance_date} = req.body;
        console.log("Student Array", studentArray)
        console.log("Today's Date: ", new Date().toISOString().slice(0, 10));
        console.log("Date: ", new Date())

        const checkIsArray = Array.isArray(studentArray);
        if(!checkIsArray) {
            return res.status(400).json({ message: "Attendance array is required with id and status field" });
        }

        if(!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }
        if(!studentArray) {
            return res.status(400).json({ message: "Student array is required" });
        }
        const classData = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classData) {
            return res.status(200).json({ message: "Class not found" });
        }
        const teacherId = classData.teacherId;
        if (!teacherId) {
            return res.status(400).json({ message: "Teacher is not associated with this class." });
        }
        const teacherData = await UserInfo.findOne({ where: { id: teacherId, clientId: storeClientId, role: "Teacher", isDeleted: false } });
        if (!teacherData) {
            return res.status(200).json({ message: "Teacher not found" });
        }
        if (teacherData.role !== "Teacher") {
            return res.status(400).json({ message: "Invalid teacher ID" });
        }

        const idset = new Set();
        for (let i = 0; i < studentArray.length; i++) {
            const studentId = studentArray[i].id;
            const studentExistInClass = await ClassEnrollments.findOne({ where: { studentId: studentId, classId: classId } });
            if (!studentExistInClass) {
                return res.status(200).json({ message: "Student not found in class" });
            }
            if (idset.has(studentId)) {
                return res.status(400).json({ message: "Duplicate student ID" });
            }
            idset.add(studentId);
        }

        for (let i = 0; i < studentArray.length; i++) {
            const studentStatus = studentArray[i].status;
            if(studentStatus !== "Present" && studentStatus !== "Absent" && studentStatus !== "Late" && studentStatus !== "Excused") {
                return res.status(400).json({ message: "Invalid status" });
            }
            const studentId = studentArray[i].id;
            console.log("Student ID: ", studentId);
            const studentData = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, role: "Student", isDeleted: false } });
            if (!studentData) {
                return res.status(200).json({ message: "Student not found" });
            }
            if (studentData.role !== "Student") {
                return res.status(400).json({ message: "Invalid student ID" });
            }
            if (studentArray[i].status !== "Present" && studentArray[i].status !== "Absent" && studentArray[i].status !== "Late" && studentArray[i].status !== "Excused") {
                return res.status(400).json({ message: "Invalid status" });
            }
        }

        const attendanceRecords = studentArray.map(student => ({
            studentId: student.id,
            classId: classId,
            teacherId: teacherId,
            attendance_date,
            status: student.status,
            clientId: storeClientId,
          }));

        const attendance = await Attendance.bulkCreate(attendanceRecords);
        console.log("All students attendance: ", attendanceRecords);
    
        return res.status(200).json({ message: 'Attendance added successfully'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = addAttendance
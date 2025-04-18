const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
const { Op } = require('sequelize'); // Ensure Op is imported for Sequelize queries

const getAllFacultyAttendance = async (req, res) => {
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        if (!adminToken) {
            return res.status(400).json({ status: false, message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        const getAdminUserId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if (findRole !== "Admin") {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }
        const findUser = await UserInfo.findOne({ where: { id: getAdminUserId, role: "Admin", clientId: storeClientId, isDeleted: false } });
        if (!findUser) {
            return res.status(400).json({ status: false, message: "Invalid user" });
        }

        const { month } = req.params;
        console.log("month*****************", month);

        // Validate month format (YYYY-MM)
        const monthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
        if (!monthRegex.test(month)) {
            return res.status(400).json({ status: false, message: "Invalid month format. Use YYYY-MM" });
        }
        console.log("monthRegex*****************", monthRegex);

        // Get the start and end date of the month
        const [year, monthNumber] = month.split('-').map(Number);
        const startDate = new Date(year, monthNumber - 1, 1).getTime() / 1000; // Convert to seconds
        const endDate = new Date(year, monthNumber, 0).getTime() / 1000; // Last day of the month, convert to seconds
        const dateAndTime = new Date(startDate * 1000);
        const monthName = dateAndTime.toLocaleString();

        console.log("startDate*****************", monthName);
        console.log("endDate*****************", endDate);

        // Retrieve attendance records within the specified month
        const findAttendance = await FacultyAttendance.findAll({
            where: {
                clientId: storeClientId,
                clockIn: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });
        console.log("findAttendance*****************", findAttendance);
        if (findAttendance.length === 0) {
            return res.status(200).json({ status: false, message: "No attendance found for the specified month" });
        }

        // Get the current date
        const currentDate = new Date().getTime() / 1000; // Convert to seconds

        // Grouping attendance by faculty member
        const attendanceByFaculty = {};

        findAttendance.forEach(attendance => {
            const fullName = attendance.fullName; // Assuming fullName corresponds to faculty name
            if (!attendanceByFaculty[fullName]) {
                attendanceByFaculty[fullName] = {
                    name: fullName,
                    present: 0,
                    absent: 0,
                    attendanceData: {}
                };
            }

            // Convert epoch timestamps to date objects
            console.log("attendance.clockIn*****************", attendance.clockIn);
            const clockInDate = new Date(attendance.clockIn * 1000); // Convert seconds to milliseconds
            console.log("New clockInDate*****************", clockInDate);
            const clockOutDate = attendance.clockOut ? new Date(attendance.clockOut * 1000) : null;

            // Determine status
            const status = determineStatus(clockInDate, clockOutDate, currentDate);

            // Extract day and date separately
            const dayString = clockInDate.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Thursday"
            const dateString = clockInDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); // e.g., "08/08/2024"

            // Only count presence once per day
            if (status === 'P' && !attendanceByFaculty[fullName].attendanceData[dateString]) {
                attendanceByFaculty[fullName].present++;
                attendanceByFaculty[fullName].attendanceData[dateString] = { day: dayString, status: status };
            } else if (status === 'A') {
                if (!attendanceByFaculty[fullName].attendanceData[dateString]) {
                    attendanceByFaculty[fullName].attendanceData[dateString] = { day: dayString, status: status };
                }
            }
        });

        // Generate a list of all dates in the month
        const daysInMonth = new Date(year, monthNumber, 0).getDate();

        Object.values(attendanceByFaculty).forEach(faculty => {
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, monthNumber - 1, day);
                const dayString = date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Thursday"
                const dateString = date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }); // e.g., "08/08/2024"

                if (!faculty.attendanceData[dateString]) {
                    const status = date.getDay() === 0 ? '' : (date > new Date() ? '-' : 'A'); // Empty string for Sundays, "-" for future dates, "A" for absences
                    faculty.attendanceData[dateString] = { day: dayString, status: status };

                    if (status === 'A') {
                        faculty.absent++;
                    }
                }
            }

            // Transform attendanceData to a list of objects for response
            faculty.attendanceData = Object.keys(faculty.attendanceData).map(date => ({
                day: faculty.attendanceData[date].day,
                date: date,
                status: faculty.attendanceData[date].status
            }));

            // Sort attendanceData by date
            faculty.attendanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
        });

        const transformedAttendance = Object.values(attendanceByFaculty);

        return res.status(200).json({ status: true, result: transformedAttendance });

    } catch (error) {
        return res.status(500).json({ status: false, message: error.message });
    }
}

// Helper function to determine attendance status
function determineStatus(clockInDate, clockOutDate, currentDate) {
    console.log("clockInDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockInDate);
    console.log("clockOutDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockOutDate);
    console.log("currentDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", currentDate);
    if (clockInDate.getTime() / 1000 > currentDate) {
        return '-'; // Date is in the future
    }
    if (clockInDate) {
        return 'P'; // Present
    } else {
        return 'A'; // Absent
    }
}

module.exports = getAllFacultyAttendance;


// const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
// const { Op } = require('sequelize'); // Ensure Op is imported for Sequelize queries

// const getAllFacultyAttendance = async (req, res) => {
//     try {
//         const accessToken = req.headers.authorization;
//         if (!accessToken || !accessToken.startsWith('Bearer ')) {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const token = accessToken.split(' ')[1];
//         const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
//         if (!adminToken) {
//             return res.status(400).json({ status: false, message: "Invalid token" });
//         }
//         const storeClientId = adminToken.client.id;
//         const getAdminUserId = adminToken.user.id;
//         const findRole = adminToken.user.role;
//         if (findRole !== "Admin") {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const findUser = await UserInfo.findOne({ where: { id: getAdminUserId, role: "Admin", clientId: storeClientId, isDeleted: false } });
//         if (!findUser) {
//             return res.status(400).json({ status: false, message: "Invalid user" });
//         }

//         const { month } = req.params;
//         console.log("month*****************", month);

//         // Validate month format (YYYY-MM)
//         const monthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
//         if (!monthRegex.test(month)) {
//             return res.status(400).json({ status: false, message: "Invalid month format. Use YYYY-MM" });
//         }
//         console.log("monthRegex*****************", monthRegex);

//         // Get the start and end date of the month
//         const [year, monthNumber] = month.split('-').map(Number);
//         const startDate = new Date(year, monthNumber - 1, 1).getTime() / 1000; // Convert to seconds
//         const endDate = new Date(year, monthNumber, 0).getTime() / 1000; // Last day of the month, convert to seconds
//         const dateAndTime = new Date(startDate * 1000);
//         const monthName = dateAndTime.toLocaleString();

//         console.log("startDate*****************", monthName);
//         console.log("endDate*****************", endDate);

//         // Retrieve attendance records within the specified month
//         const findAttendance = await FacultyAttendance.findAll({
//             where: {
//                 clientId: storeClientId,
//                 clockIn: {
//                     [Op.between]: [startDate, endDate]
//                 }
//             }
//         });
//         console.log("findAttendance*****************", findAttendance);
//         if (findAttendance.length === 0) {
//             return res.status(200).json({ status: false, message: "No attendance found for the specified month" });
//         }

//         // Get the current date
//         const currentDate = new Date().getTime() / 1000; // Convert to seconds

//         // Grouping attendance by faculty member
//         const attendanceByFaculty = {};

//         findAttendance.forEach(attendance => {
//             const fullName = attendance.fullName; // Assuming fullName corresponds to faculty name
//             if (!attendanceByFaculty[fullName]) {
//                 attendanceByFaculty[fullName] = {
//                     name: fullName,
//                     present: 0,
//                     absent: 0,
//                     attendanceData: {}
//                 };
//             }

//             // Convert epoch timestamps to date objects
//             console.log("attendance.clockIn*****************", attendance.clockIn);
//             const clockInDate = new Date(attendance.clockIn * 1000); // Convert seconds to milliseconds
//             console.log("New clockInDate*****************", clockInDate);
//             const clockOutDate = attendance.clockOut ? new Date(attendance.clockOut * 1000) : null;

//             // Determine status
//             const status = determineStatus(clockInDate, clockOutDate, currentDate);

//             // Format date as 'Day, MM/DD/YYYY'
//             const dateString = clockInDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });

//             // Only count presence once per day
//             if (status === 'P' && !attendanceByFaculty[fullName].attendanceData[dateString]) {
//                 attendanceByFaculty[fullName].present++;
//                 attendanceByFaculty[fullName].attendanceData[dateString] = status;
//             } else if (status === 'A') {
//                 if (!attendanceByFaculty[fullName].attendanceData[dateString]) {
//                     attendanceByFaculty[fullName].attendanceData[dateString] = status;
//                 }
//             }
//         });

//         // Generate a list of all dates in the month
//         const daysInMonth = new Date(year, monthNumber, 0).getDate();

//         Object.values(attendanceByFaculty).forEach(faculty => {
//             for (let day = 1; day <= daysInMonth; day++) {
//                 const date = new Date(year, monthNumber - 1, day);
//                 const dateString = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' });

//                 if (!faculty.attendanceData[dateString]) {
//                     const status = date.getDay() === 0 ? '' : (date > new Date() ? '-' : 'A'); // Empty string for Sundays, "-" for future dates, "A" for absences
//                     faculty.attendanceData[dateString] = status;

//                     if (status === 'A') {
//                         faculty.absent++;
//                     }
//                 }
//             }

//             // Transform attendanceData to a list of objects for response
//             faculty.attendanceData = Object.keys(faculty.attendanceData).map(date => ({
//                 date: date, // This will now be in the 'Day, MM/DD/YYYY' format
//                 status: faculty.attendanceData[date]
//             }));

//             // Sort attendanceData by date
//             faculty.attendanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
//         });

//         const transformedAttendance = Object.values(attendanceByFaculty);

//         return res.status(200).json({ status: true, result: transformedAttendance });

//     } catch (error) {
//         return res.status(500).json({ status: false, message: error.message });
//     }
// }

// // Helper function to determine attendance status
// function determineStatus(clockInDate, clockOutDate, currentDate) {
//     console.log("clockInDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockInDate);
//     console.log("clockOutDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockOutDate);
//     console.log("currentDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", currentDate);
//     if (clockInDate.getTime() / 1000 > currentDate) {
//         return '-'; // Date is in the future
//     }
//     if (clockInDate) {
//         return 'P'; // Present
//     } else {
//         return 'A'; // Absent
//     }
// }

// module.exports = getAllFacultyAttendance;


// const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
// const { Op } = require('sequelize'); // Ensure Op is imported for Sequelize queries

// const getAllFacultyAttendance = async (req, res) => {
//     try {
//         const accessToken = req.headers.authorization;
//         if (!accessToken || !accessToken.startsWith('Bearer ')) {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const token = accessToken.split(' ')[1];
//         const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
//         if (!adminToken) {
//             return res.status(400).json({ status: false, message: "Invalid token" });
//         }
//         const storeClientId = adminToken.client.id;
//         const getAdminUserId = adminToken.user.id;
//         const findRole = adminToken.user.role;
//         if (findRole !== "Admin") {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const findUser = await UserInfo.findOne({ where: { id: getAdminUserId, role: "Admin", clientId: storeClientId, isDeleted: false } });
//         if (!findUser) {
//             return res.status(400).json({ status: false, message: "Invalid user" });
//         }

//         const { month } = req.params;
//         console.log("month*****************", month);

//         // Validate month format (YYYY-MM)
//         const monthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
//         if (!monthRegex.test(month)) {
//             return res.status(400).json({ status: false, message: "Invalid month format. Use YYYY-MM" });
//         }
//         console.log("monthRegex*****************", monthRegex);

//         // Get the start and end date of the month
//         const [year, monthNumber] = month.split('-').map(Number);
//         const startDate = new Date(year, monthNumber - 1, 1).getTime() / 1000; // Convert to seconds
//         const endDate = new Date(year, monthNumber, 0).getTime() / 1000; // Last day of the month, convert to seconds
//         const dateAndTime = new Date(startDate * 1000);
//         const monthName = dateAndTime.toLocaleString();

//         console.log("startDate*****************", monthName);
//         console.log("endDate*****************", endDate);
//         // Retrieve attendance records within the specified month
//         const findAttendance = await FacultyAttendance.findAll({
//             where: {
//                 clientId: storeClientId,
//                 clockIn: {
//                     [Op.between]: [startDate, endDate]
//                 }
//             }
//         });
//         console.log("findAttendance*****************", findAttendance);
//         if (findAttendance.length === 0) {
//             return res.status(200).json({ status: false, message: "No attendance found for the specified month" });
//         }

//         // Get the current date
//         const currentDate = new Date().getTime() / 1000; // Convert to seconds

//         // Grouping attendance by faculty member
//         const attendanceByFaculty = {};

//         findAttendance.forEach(attendance => {
//             const fullName = attendance.fullName; // Assuming fullName corresponds to faculty name
//             if (!attendanceByFaculty[fullName]) {
//                 attendanceByFaculty[fullName] = {
//                     name: fullName,
//                     present: 0,
//                     absent: 0,
//                     attendanceData: {}
//                 };
//             }

//             // Convert epoch timestamps to date objects
//             console.log("attendance.clockIn*****************", attendance.clockIn);
//             const clockInDate = new Date(attendance.clockIn * 1000); // Convert seconds to milliseconds
//             console.log("New clockInDate*****************", clockInDate);
//             const clockOutDate = attendance.clockOut ? new Date(attendance.clockOut * 1000) : null;

//             // Determine status
//             const status = determineStatus(clockInDate, clockOutDate, currentDate);

//             // Use the date as a string in YYYY-MM-DD format
//             const dateString = clockInDate.toISOString().split('T')[0]; // YYYY-MM-DD

//             // Only count presence once per day
//             if (status === 'P' && !attendanceByFaculty[fullName].attendanceData[dateString]) {
//                 attendanceByFaculty[fullName].present++;
//                 attendanceByFaculty[fullName].attendanceData[dateString] = status;
//             } else if (status === 'A') {
//                 if (!attendanceByFaculty[fullName].attendanceData[dateString]) {
//                     attendanceByFaculty[fullName].attendanceData[dateString] = status;
//                 }
//             }
//         });

//         // Generate a list of all dates in the month
//         const daysInMonth = new Date(year, monthNumber, 0).getDate();

//         Object.values(attendanceByFaculty).forEach(faculty => {
//             for (let day = 1; day <= daysInMonth; day++) {
//                 const date = new Date(year, monthNumber - 1, day);
//                 // const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
//                 const dateString = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }); // e.g., "Monday, 07/25/2024"

//                 if (!faculty.attendanceData[dateString]) {
//                     const status = date.getDay() === 0 ? '' : (date > new Date() ? '-' : 'A'); // Empty string for Sundays, "-" for future dates, "A" for absences
//                     faculty.attendanceData[dateString] = status;

//                     if (status === 'A') {
//                         faculty.absent++;
//                     }
//                 }
//             }

//             // Transform attendanceData to a list of objects for response
//             faculty.attendanceData = Object.keys(faculty.attendanceData).map(date => ({
//                 date: date,
//                 status: faculty.attendanceData[date]
//             }));

//             // Sort attendanceData by date
//             faculty.attendanceData.sort((a, b) => new Date(a.date) - new Date(b.date));
//         });

//         const transformedAttendance = Object.values(attendanceByFaculty);

//         return res.status(200).json({ status: true, result: transformedAttendance });

//     } catch (error) {
//         return res.status(500).json({ status: false, message: error.message });
//     }
// }

// // Helper function to determine attendance status
// function determineStatus(clockInDate, clockOutDate, currentDate) {
//     console.log("clockInDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockInDate);
//     console.log("clockOutDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockOutDate);
//     console.log("currentDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", currentDate);
//     if (clockInDate.getTime() / 1000 > currentDate) {
//         return '-'; // Date is in the future
//     }
//     if (clockInDate) {
//         return 'P'; // Present
//     } else {
//         return 'A'; // Absent
//     }
// }

// module.exports = getAllFacultyAttendance;











// const { UserInfo, OAuthToken, FacultyAttendance } = require("../../models");
// const { Op } = require('sequelize'); // Ensure Op is imported for Sequelize queries

// const getAllFacultyAttendance = async (req, res) => {
//     try {
//         const accessToken = req.headers.authorization;
//         if (!accessToken || !accessToken.startsWith('Bearer ')) {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const token = accessToken.split(' ')[1];
//         const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
//         if (!adminToken) {
//             return res.status(400).json({ status: false, message: "Invalid token" });
//         }
//         const storeClientId = adminToken.client.id;
//         const getAdminUserId = adminToken.user.id;
//         const findRole = adminToken.user.role;
//         if (findRole !== "Admin") {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }
//         const findUser = await UserInfo.findOne({ where: { id: getAdminUserId, role: "Admin", clientId: storeClientId, isDeleted: false } });
//         if (!findUser) {
//             return res.status(400).json({ status: false, message: "Invalid user" });
//         }

//         const { month } = req.params;
//         console.log("month*****************", month);

//         // Validate month format (YYYY-MM)
//         const monthRegex = /^(\d{4})-(0[1-9]|1[0-2])$/;
//         if (!monthRegex.test(month)) {
//             return res.status(400).json({ status: false, message: "Invalid month format. Use YYYY-MM" });
//         }
//         console.log("monthRegex*****************", monthRegex);

//         // Get the start and end date of the month
//         const [year, monthNumber] = month.split('-').map(Number);
//         const startDate = new Date(year, monthNumber - 1, 1).getTime() / 1000; // Convert to seconds
//         const endDate = new Date(year, monthNumber, 0).getTime() / 1000; // Last day of the month, convert to seconds
//         const dateAndTime = new Date(startDate * 1000);
//         const monthName = dateAndTime.toLocaleString();

//         console.log("startDate*****************", monthName);
//         console.log("endDate*****************", endDate);
//         // Retrieve attendance records within the specified month
//         const findAttendance = await FacultyAttendance.findAll({
//             where: {
//                 clientId: storeClientId,
//                 clockIn: {
//                     [Op.between]: [startDate, endDate]
//                 }
//             }
//         });
//         console.log("findAttendance*****************", findAttendance);
//         if (findAttendance.length === 0) {
//             return res.status(200).json({ status: false, message: "No attendance found for the specified month" });
//         }

//         // Get the current date
//         const currentDate = new Date().getTime() // / 1000; // Convert to seconds

//         // Grouping attendance by faculty member
//         const attendanceByFaculty = {};

//         findAttendance.forEach(attendance => {
//             const fullName = attendance.fullName; // Assuming fullName corresponds to faculty name
//             if (!attendanceByFaculty[fullName]) {
//                 attendanceByFaculty[fullName] = {
//                     name: fullName,
//                     present: 0,
//                     absent: 0,
//                     attendanceData: []
//                 };
//             }

//             // Convert epoch timestamps to date objects
//             console.log("attendance.clockIn*****************", attendance.clockIn);
//             const clockInDate = new Date(attendance.clockIn * 1000); // Convert seconds to milliseconds
//             console.log("New clockInDate*****************", clockInDate);
//             const clockOutDate = attendance.clockOut ? new Date(attendance.clockOut * 1000) : null;

//             // Determine status and update counts
//             const status = determineStatus(clockInDate, clockOutDate, currentDate);
//             if (status === 'P') {
//                 attendanceByFaculty[fullName].present++;
//             } else if (status === 'A') {
//                 attendanceByFaculty[fullName].absent++;
//             }

//             // Format dates for response
//             const formattedDate = clockInDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }); // e.g., "Monday, 07/25/2024"
//             const formattedTime = clockInDate.toISOString().split('T')[1].split('.')[0]; // Format time as HH:MM:SS
//             console.log("formattedDate*****************", formattedDate + " " + formattedTime);
//             console.log("formattedTime*****************", formattedTime);
//             const existingRecord = attendanceByFaculty[fullName].attendanceData.find(record => record.date.includes(formattedDate.split(',')[1].trim()));

//             if (existingRecord) {
//                 existingRecord.time = formattedTime;
//                 existingRecord.status = status;
//             } else {
//                 attendanceByFaculty[fullName].attendanceData.push({
//                     date: `${formattedDate + " " + formattedTime}`, // e.g., "Monday, 07/25/2024"
//                     status: status
//                 });
//             }
//         });

//         // Generate a list of all dates in the month
//         const daysInMonth = new Date(year, monthNumber, 0).getDate();

//         Object.values(attendanceByFaculty).forEach(faculty => {
//             for (let day = 1; day <= daysInMonth; day++) {
//                 const date = new Date(year, monthNumber - 1, day);
//                 const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }); // e.g., "Monday, 07/25/2024"
//                 console.log("formattedDate@@@@@@@@@@@@@@@@@@@@@@@", formattedDate);
//                 if (!faculty.attendanceData.some(record => record.date.includes(formattedDate.split(',')[1].trim()))) {
//                     const status = date.getDay() === 0 ? '' : (date > new Date() ? '-' : 'A'); // Empty string for Sundays, "-" for future dates, "A" for absences
//                     faculty.attendanceData.push({
//                         date: formattedDate, // e.g., "Monday, 07/25/2024"
//                         status: status
//                     });

//                     if (status === 'A') {
//                         faculty.absent++;
//                     }
//                 }
//             }

//             // Sort attendanceData by date
//             faculty.attendanceData.sort((a, b) => new Date(a.date.split(',')[1].trim()) - new Date(b.date.split(',')[1].trim()));
//         });

//         const transformedAttendance = Object.values(attendanceByFaculty);

//         return res.status(200).json({ status: true, result: transformedAttendance });

//     } catch (error) {
//         return res.status(500).json({ status: false, message: error.message });
//     }
// }

// // Helper function to determine attendance status
// function determineStatus(clockInDate, clockOutDate, currentDate) {
//     console.log("clockInDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockInDate);
//     console.log("clockOutDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", clockOutDate);
//     console.log("currentDate&&&&&&&&&&&&&&&&&&&&&&&&&&&", currentDate);
//     if (clockInDate.getTime() / 1000 > currentDate) {
//         return '-'; // Date is in the future
//     }
//     if (clockInDate) {
//         return 'P'; // Present
//     } else {
//         return 'A'; // Absent
//     }
// }

// module.exports = getAllFacultyAttendance;

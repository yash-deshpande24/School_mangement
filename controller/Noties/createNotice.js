const { Notices, NoticeDetail, OAuthToken, UserInfo, SchoolParentStudent, Classes, ClassEnrollments } = require('../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const createNotice = async (req, res) => {
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

        const role = adminToken.user.role;
        const getAdminId = adminToken.user.id;

        if (role !== "Admin" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;
        const date_posted = new Date();

        const { title, content, classIds, studentIds, forParents, expiry_date } = req.body;

        if (!moment(expiry_date, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({ message: "Invalid expiry date" });
        }

        if (!title || !content || !expiry_date || (forParents == null || forParents == undefined)) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if ((!classIds || classIds.length === 0) && (!studentIds || studentIds.length === 0)) {
            return res.status(400).json({ message: "Either classIds or studentIds must be provided" });
        }

        if (classIds && studentIds && (classIds.length > 0 && studentIds.length > 0)) {
            return res.status(400).json({ message: "Both classIds and studentIds cannot be provided together" });
        }

        const postedByUserExists = await UserInfo.findOne({ where: { id: getAdminId, clientId: storeClientId, isDeleted: false } });

        if (!postedByUserExists) {
            return res.status(200).json({ message: "User who posted the notice doesn't exist" });
        }

        if (postedByUserExists.role !== "Admin" && postedByUserExists.role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate classIds
        if (classIds && classIds.length > 0) {
            for (let classId of classIds) {
                const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
                if (!classExist) {
                    return res.status(400).json({ message: "Class does not exist" });
                }
            }
        }

        // Validate studentIds
        if (studentIds && studentIds.length > 0) {
            for (let studentId of studentIds) {
                const studentExist = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
                if (!studentExist) {
                    return res.status(400).json({ message: `ID ${studentId} does not exist` });
                }
            }
        }

        // Create the notice
        const notice = await Notices.create({
            title,
            content,
            date_posted,
            posted_by: getAdminId,
            classId: classIds && classIds.length > 0 ? classIds : null,
            forParents,
            expiry_date,
            clientId: storeClientId
        });

        console.log("Notice created successfully", notice);

        let noticesToCreate = [];

        // Creating notices based on classIds
        if (classIds && classIds.length > 0) {
            const uniqueStudentIds = new Set(); // Use a set to store unique studentIds

            for (let classId of classIds) {
                const classEnrollments = await ClassEnrollments.findAll({ where: { classId, clientId: storeClientId } });

                for (let enrollment of classEnrollments) {
                    const studentId = enrollment.studentId;

                    const studentExist = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
                    if (studentExist) {
                        // Ensure each student appears only once per notice
                        if (!uniqueStudentIds.has(studentId)) {
                            noticesToCreate.push({ noticeId: notice.id, userId: studentId, clientId: storeClientId });
                            uniqueStudentIds.add(studentId); // Add studentId to set
                        }

                        // Create parent notices if forParents is true
                        if (forParents) {
                            const parent = await SchoolParentStudent.findOne({ where: { 
                                studentId, 
                                parentId: {[Op.not]: null},
                                clientId: storeClientId 
                            } });

                            if (parent) {
                                if (!uniqueStudentIds.has(parent.parentId)) {
                                    const parentId = parent.parentId;
                                    noticesToCreate.push({ noticeId: notice.id, userId: parentId, clientId: storeClientId });
                                    uniqueStudentIds.add(parentId);
                                }   
                            }
                        }
                    }
                }
            }
        }

        // Creating notices based on studentIds
        if (studentIds && studentIds.length > 0) {
            const uniqueStudentIds = new Set(); // Use a set to store unique studentIds

            for (let studentId of studentIds) {
                if (!uniqueStudentIds.has(studentId)) {
                    noticesToCreate.push({ noticeId: notice.id, userId: studentId, clientId: storeClientId });
                    uniqueStudentIds.add(studentId);
                }
                

                // Create parent notices if forParents is true
                if (forParents) {
                    const parent = await SchoolParentStudent.findOne({ where: { 
                        studentId, 
                        parentId: {[Op.not]: null},
                        clientId: storeClientId 
                    } });

                    if (parent) {
                        if (!uniqueStudentIds.has(parent.parentId)) {
                            const parentId = parent.parentId;
                            noticesToCreate.push({ noticeId: notice.id, userId: parentId, clientId: storeClientId });
                            uniqueStudentIds.add(parentId);
                        } 
                    }
                }
            }
        }

        // Use bulkCreate to create all NoticeDetail objects at once
        if (noticesToCreate.length > 0) {
            await NoticeDetail.bulkCreate(noticesToCreate);
        }

        console.log("Notices created: ", noticesToCreate);
        return res.status(201).json({ message: 'Notices created successfully' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = createNotice;

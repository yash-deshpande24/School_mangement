const { where } = require("sequelize");
const { UserInfo, SchoolParentStudent, OAuthToken, SchoolInfo, TeacherDepartmentAssociation } = require("../../models");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
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
        if (findRole !== "Admin" && findRole !== "Owner" && findRole !== "SuperAdmin") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let findSchoolId = null;
        let schoolId = "";
        if (findRole === "Admin" || findRole === "Owner") {
            findSchoolId = await SchoolInfo.findOne({ where: { clientId: storeClientId } });
            if (!findSchoolId) {
                return res.status(200).json({ message: 'Please add school first' });
            }
            schoolId = findSchoolId.id;
        }

        const { firstName, lastName, email, password, mobileno, role, dob, alternateMobileNumber, addressLine1, addressLine2, addressLine3, city, state, feeDiscount, aadhar, govtIdentityName, govtIdentityNumber, clientId, departmentId, RollNumber, BloodGroup, LocalIdentificationDetails, AccountNumber, AccountName, BankName, IFSCcode, schoolCode, scholarNumber, samargaNumber, childId, previousScholarNumber, previousSchoolTC } = req.body;
        if (!firstName || !lastName || !email || !password || !mobileno) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const emailLowerCase = email.toLowerCase();
        const existingUser = await UserInfo.findOne({ where: { email: emailLowerCase, isDeleted: false, clientId: storeClientId } });

        if (existingUser) {
            if (existingUser.role === 'Teacher') {
                return res.status(400).json({ message: 'Teacher already exists' });
            }
            if (existingUser.role === 'Parent') {
                return res.status(400).json({ message: 'Parent already exists' });
            }
            if (existingUser.role === 'Student') {
                return res.status(400).json({ message: 'Student already exists' });
            }
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserInfo.create({
            firstName,
            lastName,
            email: emailLowerCase,
            password: hashedPassword,
            mobileno,
            role,
            dob,
            alternateMobileNumber,
            addressLine1,
            addressLine2,
            addressLine3,
            city,
            state,
            feeDiscount: feeDiscount ? feeDiscount : 0,
            aadhar,
            govtIdentityName,
            govtIdentityNumber,
            clientId: storeClientId,
            department: role === "Teacher" ? departmentId : null,
            imageUrl: "https://cdn.pixabay.com/photo/2016/03/23/15/00/ice-cream-1274894_1280.jpg",
            isDeleted: false,
            RollNumber,
            BloodGroup,
            LocalIdentificationDetails,
            AccountNumber,
            AccountName,
            BankName,
            IFSCcode,
            schoolCode,
            scholarNumber,
            samargaNumber,
            childId,
            previousScholarNumber,
            previousSchoolTC
        });

        if (role === "Admin" || role === "Student") {
            await SchoolParentStudent.create({ schoolId: schoolId || null, studentId: user.id, clientId: storeClientId });
        } else if (role === "Parent") {
            var studentMapping = await SchoolParentStudent.findOne({ where: { studentId: req.body.studentId, parentId: null } });
            if (studentMapping && !studentMapping.parentId) {
                await SchoolParentStudent.update({ parentId: user.id, schoolId: schoolId }, { where: { id: studentMapping.id } });
            } else {
                await SchoolParentStudent.create({ schoolId: schoolId, studentId: req.body.studentId, parentId: user.id, clientId: storeClientId });
            }
        } else if (role == "Teacher") {
            await TeacherDepartmentAssociation.create({ teacherId: user.id, departmentId: departmentId, clientId: storeClientId });
        }

        res.status(201).json({ message: 'User created successfully' });

    } catch (err) {
        console.log(err);
        res.status(err.code || 500).json(err);
    }
};

module.exports = createUser;
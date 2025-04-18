const { Transaction } = require('sequelize');
const { Classes, OAuthToken, UserInfo, ClassEnrollments, Section, FeeStructure, PendingFees, Payment, FeeType,  sequelize } = require('../../models');
const bcrypt = require('bcrypt');

const createStudent = async (req, res) => {
    const transaction = await sequelize.transaction();

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

        const findRole = adminToken.user.role;
        if (findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client?.id;
        if (!storeClientId) {
            return res.status(400).json({ message: "Client ID not found" });
        }

        const {
            firstName, lastName, email, password, mobileno, classId, dob,
            alternateMobileNumber, addressLine1, addressLine2, addressLine3,
            city, state, feeDiscount, aadhar, govtIdentityName, govtIdentityNumber,
            departmentId, sectionId, RollNumber, BloodGroup, LocalIdentificationDetails,
            AccountName, AccountNumber, BankName, IFSCcode
        } = req.body;

        if (!firstName || !lastName || !email || !password || !mobileno || !classId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const findClass = await Classes.findOne({ where: { id: classId, clientId: storeClientId } }, { transaction });
        if (!findClass) {
            return res.status(200).json({ message: 'Class not found' });
        } else if (sectionId != -1) {
            const findSection = await Section.findOne({ where: { id: sectionId, clientId: storeClientId } }, { transaction });
            if (!findSection) {
                return res.status(200).json({ message: 'Section not found' });
            }
        }

        let emailLowerCase = email.toLowerCase();
        const existingUser = await UserInfo.findOne({ where: { email: emailLowerCase, isDeleted: false, clientId: storeClientId } }, { transaction });
        if (existingUser) {
            return res.status(409).json({ message: "emailId already exists" });
        }

        const FeesStructureExist = await FeeStructure.findAll({ where: { ClassID: classId, clientId: storeClientId } }, { transaction });
        if (FeesStructureExist.length == 0) {
            return res.status(200).json({ message: 'Fees structure not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await UserInfo.create({
            firstName,
            lastName,
            email: emailLowerCase,
            password: hashedPassword,
            mobileno,
            role: "Student",
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
            departmentId,
            RollNumber,
            BloodGroup,
            LocalIdentificationDetails,
            AccountName,
            AccountNumber,
            BankName,
            IFSCcode,
            imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            isDeleted: false
        }, { transaction });

        for (const item of FeesStructureExist) {
            await PendingFees.create({
                StudentID: student.id,
                FeeID: item.id,
                AmountDue: item.Amount,
                DueDate: item.DueDate,
                clientId: storeClientId,
                classID: classId,
                sectionID: sectionId != -1 ? sectionId : null
            }, { transaction });
        }

        await ClassEnrollments.create({
            studentId: student.id,
            classId: classId,
            clientId: storeClientId,
            sectionId: sectionId != -1 ? sectionId : null
        }, { transaction });

        if (feeDiscount > 0) {
            const feeTypeInfo = await FeeType.findOne({ where: { FeeName: "Tution Fee", clientId: storeClientId } }, { transaction });
            if (!feeTypeInfo) {
                return res.status(400).json({ message: 'Fee type not found' });
            }

            const feeStructureInfo = await FeeStructure.findOne({ where: { FeeTypeID: feeTypeInfo.id, ClassID: classId, clientId: storeClientId } }, { transaction });
            if (!feeStructureInfo) {
                return res.status(400).json({ message: 'Fee structure for the fee type not found' });
            }

            await Payment.create({
                StudentID: student.id,
                FeeID: feeStructureInfo.id,
                AmountPaid: feeDiscount,
                PaymentDate: new Date(),
                PaymentMethod: "Discount",
                TransactionID: "Cash",
                clientId: storeClientId,
                classID: classId,
                sectionID: sectionId != -1 ? sectionId : null
            }, { transaction });
        }

        await transaction.commit();

        res.status(200).json({ message: 'Student created successfully', data: student });
    } catch (err) {
        await transaction.rollback();
        return res.status(500).json({ message: err.message });
    }
}

module.exports = createStudent;


// const { Transaction } = require('sequelize');
// const { Classes, OAuthToken, UserInfo, ClassEnrollments, Section, FeeStructure, PendingFees, Payment, FeeType } = require('../../models');
// const bcrypt = require('bcrypt');

// const createStudent = async (req, res) => {
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

//         const findRole = adminToken.user.role;
//         if (findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }

//         const storeClientId = adminToken.client?.id;
//         if (!storeClientId) {
//             return res.status(400).json({ message: "Client ID not found" });
//         }

//         const {
//             firstName, lastName, email, password, mobileno, classId, dob,
//             alternateMobileNumber, addressLine1, addressLine2, addressLine3,
//             city, state, feeDiscount, aadhar, govtIdentityName, govtIdentityNumber,
//             departmentId, sectionId
//         } = req.body;

//         if (!firstName || !lastName || !email || !password || !mobileno || !classId) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         const findClass = await Classes.findOne({ where: { id: classId, clientId: storeClientId } });
//         if (!findClass) {
//             return res.status(200).json({ message: 'Class not found' });
//         } else if (sectionId != -1) {
//             const findSection = await Section.findOne({ where: { id: sectionId, clientId: storeClientId } });
//             if (!findSection) {
//                 return res.status(200).json({ message: 'Section not found' });
//             }
//         }

//         let emailLowerCase = email.toLowerCase();
//         const existingUser = await UserInfo.findOne({ where: { email: emailLowerCase, isDeleted: false, clientId: storeClientId } });
//         if (existingUser) {
//             return res.status(409).json({ message: "emailId already exists" });
//         }

//         const FeesStructureExist = await FeeStructure.findAll({ where: { ClassID: classId, clientId: storeClientId } });
//         if (FeesStructureExist.length == 0) {
//             return res.status(200).json({ message: 'Fees structure not found' });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const student = await UserInfo.create({
//             firstName,
//             lastName,
//             email: emailLowerCase,
//             password: hashedPassword,
//             mobileno,
//             role: "Student",
//             dob,
//             alternateMobileNumber,
//             addressLine1,
//             addressLine2,
//             addressLine3,
//             city,
//             state,
//             feeDiscount: feeDiscount ? feeDiscount : 0,
//             aadhar,
//             govtIdentityName,
//             govtIdentityNumber,
//             clientId: storeClientId,
//             departmentId,
//             imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//             isDeleted: false
//         });

//         FeesStructureExist.forEach(item => {
//             PendingFees.create({
//                 StudentID: student.id,
//                 FeeID: item.id,
//                 AmountDue: item.Amount,
//                 DueDate: item.DueDate,
//                 clientId: storeClientId,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         });

//         await ClassEnrollments.create({
//             studentId: student.id,
//             classId: classId,
//             clientId: storeClientId,
//             sectionId: sectionId != -1 ? sectionId : null
//         });

//         if (feeDiscount > 0) {
//             const feeTypeInfo = await FeeType.findOne({ where: { FeeName: "Tution Fee", clientId: storeClientId } });
//             if (!feeTypeInfo) {
//                 return res.status(400).json({ message: 'Fee type not found' });
//             }

//             const feeStructureInfo = await FeeStructure.findOne({ where: { FeeTypeID: feeTypeInfo.id, ClassID: classId, clientId: storeClientId } });
//             if (!feeStructureInfo) {
//                 return res.status(400).json({ message: 'Fee structure for the fee type not found' });
//             }

//             await Payment.create({
//                 StudentID: student.id,
//                 FeeID: feeStructureInfo.id,
//                 AmountPaid: feeDiscount,
//                 PaymentDate: new Date(),
//                 PaymentMethod: "Discount",
//                 TransactionID: "Cash",
//                 clientId: storeClientId,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         }

//         res.status(200).json({ message: 'Student created successfully', data: student });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

// module.exports = createStudent;


// const { Transaction } = require('sequelize');
// const { Classes, OAuthToken, UserInfo, ClassEnrollments, Section, FeeStructure, PendingFees, Payment, FeeType } = require('../../models');
// const bcrypt = require('bcrypt');

// const createStudent = async (req, res) => {
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

//         const findRole = adminToken.user.role;
//         if (findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         const storeClientId = adminToken.client.id;
//         const {
//             firstName, lastName, email, password, mobileno, classId, dob,
//             alternateMobileNumber, addressLine1, addressLine2, addressLine3,
//             city, state, feeDiscount, aadhar, govtIdentityName, govtIdentityNumber,
//             departmentId, sectionId
//         } = req.body;

//         if (!firstName || !lastName || !email || !password || !mobileno || !classId) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         const findClass = await Classes.findOne({ where: { id: classId, clientId: storeClientId } });
//         if (!findClass) {
//             return res.status(200).json({ message: 'Class not found' });
//         } else if (sectionId != -1) {
//             const findSection = await Section.findOne({ where: { id: sectionId, clientId: storeClientId } });
//             if (!findSection) {
//                 return res.status(200).json({ message: 'Section not found' });
//             }
//         }

//         let emailLowerCase = email.toLowerCase();
//         const existingUser = await UserInfo.findOne({ where: { email: emailLowerCase, isDeleted: false, clientId: storeClientId } });
//         if (existingUser) {
//             return res.status(409).json({ message: "emailId already exists" });
//         }

//         const FeesStructureExist = await FeeStructure.findAll({ where: { ClassID: classId, clientId: storeClientId } });
//         if (FeesStructureExist.length == 0) {
//             return res.status(200).json({ message: 'Fees structure not found' });
//         }

//         // Hash the password only after all other checks
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create the student after all validations are done
//         const student = await UserInfo.create({
//             firstName,
//             lastName,
//             email: emailLowerCase,
//             password: hashedPassword,
//             mobileno,
//             role: "Student",
//             dob,
//             alternateMobileNumber,
//             addressLine1,
//             addressLine2,
//             addressLine3,
//             city,
//             state,
//             feeDiscount: feeDiscount ? feeDiscount : 0,
//             aadhar,
//             govtIdentityName,
//             govtIdentityNumber,
//             clientId: adminToken.client.id,
//             departmentId,
//             imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//             isDeleted: false
//         });

//         // Process pending fees after student creation
//         FeesStructureExist.forEach(item => {
//             PendingFees.create({
//                 StudentID: student.id,
//                 FeeID: item.id,
//                 AmountDue: item.Amount,
//                 DueDate: item.DueDate,
//                 clientId: adminToken.client.id,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         });

//         await ClassEnrollments.create({
//             studentId: student.id,
//             classId: classId,
//             clientId: adminToken.client.id,
//             sectionId: sectionId != -1 ? sectionId : null
//         });

//         if (feeDiscount > 0) {
//             const feeTypeInfo = await FeeType.findOne({ where: { FeeName: "Tution Fee", clientId: storeClientId } });
//             const feeStructureInfo = await FeeStructure.findOne({ where: { FeeTypeID: feeTypeInfo.id, ClassID: classId, clientId: storeClientId } });
//             await Payment.create({
//                 StudentID: student.id,
//                 FeeID: feeStructureInfo.id,
//                 AmountPaid: feeDiscount,
//                 PaymentDate: new Date(),
//                 PaymentMethod: "Discount",
//                 TransactionID: "Cash",
//                 clientId: storeClientId,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         }

//         res.status(200).json({ message: 'Student created successfully', data: student });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }

// module.exports = createStudent;



// const { Transaction } = require('sequelize');
// const { Classes, OAuthToken, UserInfo, ClassEnrollments, Section, FeeStructure, PendingFees, Payment, FeeType } = require('../../models');
// const bcrypt = require('bcrypt');

// const createStudent = async (req, res) => {
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

//         const findRole = adminToken.user.role;
//         if (findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         const storeClientId = adminToken.client.id;
//         const {firstName, lastName, email, password, mobileno, classId, dob, alternateMobileNumber, addressLine1, addressLine2, addressLine3, city, state, feeDiscount, aadhar, govtIdentityName, govtIdentityNumber, departmentId, sectionId, } = req.body;

//         if (!firstName || !lastName || !email || !password || !mobileno || !classId) {
//             return res.status(400).json({ message: 'All fields are required' });
//         }

//         const findClass = await Classes.findOne({ where: { id: classId, clientId: storeClientId } });
//         if (!findClass) {
//             return res.status(200).json({ message: 'Class not found' });
//         } else if (sectionId != -1) {
//             const findSection = await Section.findOne({ where: { id: sectionId, clientId: storeClientId } });
//             if (!findSection) {
//                 return res.status(200).json({ message: 'Section not found' });
//             }
//         }

        
//         let emailLowerCase = email.toLowerCase();
//         const existingUser = await UserInfo.findOne({ where: { email: emailLowerCase, isDeleted: false, clientId: storeClientId } });
//         if (existingUser) {
//             return res.status(409).json({ message: "emailId already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const student = await UserInfo.create({
//             firstName,
//             lastName,
//             email: emailLowerCase,
//             password: hashedPassword,
//             mobileno,
//             role: "Student",
//             dob,
//             alternateMobileNumber,
//             addressLine1,
//             addressLine2,
//             addressLine3,
//             city,
//             state,
//             feeDiscount : feeDiscount ? feeDiscount : 0,
//             aadhar,
//             govtIdentityName,
//             govtIdentityNumber,
//             clientId: adminToken.client.id,
//             departmentId,
//             imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
//             isDeleted: false
//         });

//         const FeesStructureExist = await FeeStructure.findAll({ where: { ClassID: classId, clientId: storeClientId } });
//         console.log("FeesStructureExist****************", FeesStructureExist)
//         if (FeesStructureExist.length == 0) {
//             return res.status(200).json({ message: 'Fees structure not found' });
//         }
        
//         FeesStructureExist.forEach(item => {
//             PendingFees.create({ 
//                 StudentID: student.id, 
//                 FeeID: item.id, 
//                 AmountDue: item.Amount, 
//                 DueDate: item.DueDate, 
//                 clientId: adminToken.client.id,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         });

//         await ClassEnrollments.create({
//             studentId: student.id,
//             classId: classId,
//             clientId: adminToken.client.id,
//             sectionId: sectionId != -1 ? sectionId : null
//         });

//         if (feeDiscount > 0) {
//             const feeTypeInfo = await FeeType.findOne({ where: { FeeName: "Tution Fee", clientId: storeClientId } });
//             const feeStructureInfo = await FeeStructure.findOne({ where: { FeeTypeID: feeTypeInfo.id , ClassID: classId, clientId: storeClientId } });
//             console.log("FeeTyepInfo****************", feeTypeInfo.FeeName)
//             console.log("FeeStructureInfo****************", feeStructureInfo.id)
//             await Payment.create({
//                 StudentID: student.id,
//                 FeeID: feeStructureInfo.id,
//                 AmountPaid: feeDiscount,
//                 PaymentDate: new Date(),
//                 PaymentMethod: "Discount",
//                 TransactionID: "Cash",
//                 clientId: storeClientId,
//                 classID: classId,
//                 sectionID: sectionId != -1 ? sectionId : null
//             });
//         }
//         res.status(200).json({ message: 'Student created successfully', data: student });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }
// module.exports = createStudent;


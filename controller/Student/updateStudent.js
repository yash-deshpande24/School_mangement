const { Transaction } = require('sequelize');
const { UserInfo, OAuthToken, BankDetail, sequelize, Classes, FeeStructure } = require('../../models');
const bcrypt = require('bcrypt');
const moment = require('moment');

const updateStudent = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const studentId = parseInt(req.params.studentId, 10);

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
            schoolCode, scholarNumber, RollNumber, aadhar, samargaNumber, childId,
            previousScholarNumber, previousSchoolTC, dob, classId, AccountName, AccountNumber, BankName, IFSCcode
        } = req.body;

        if (
            !schoolCode || !scholarNumber || !RollNumber || !aadhar || !samargaNumber ||
            !childId || !previousScholarNumber || !previousSchoolTC || !dob || !classId ||
            !AccountName || !AccountNumber || !BankName || !IFSCcode
        ) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const classExists = await Classes.findOne({ where: { id: classId, clientId: storeClientId } });

        if (!classExists) {
            return res.status(400).json({ message: "ClassID is missing or invalid" });
        }

        const existingUser = await UserInfo.findOne({
            where: { id: studentId, isDeleted: false, clientId: storeClientId }
        }, { transaction });

        if (!existingUser) {
            return res.status(404).json({ message: "Student not found" });
        }

        const FeesStructureExist = await FeeStructure.findAll({
            where: { ClassID: classId, clientId: storeClientId }
        }, { transaction });

        if (FeesStructureExist.length === 0) {
            return res.status(200).json({ message: 'Fees structure not found' });
        }

        const currentYear = moment().year();
        const aprilFirst = moment(`01-04-${currentYear}`, 'DD-MM-YYYY');
        const age = aprilFirst.diff(moment(dob, 'YYYY-MM-DD'), 'years');

        await UserInfo.update({
            schoolCode,
            scholarNumber,
            RollNumber,
            aadhar,
            samargaNumber,
            childId,
            previousScholarNumber,
            previousSchoolTC,
            dob,
            classId,
            age,
            AccountName,
            AccountNumber,
            BankName,
            IFSCcode,
            clientId: storeClientId
        }, {
            where: { id: studentId },
            transaction
        });

        await BankDetail.update({
            AccountNumber: [AccountNumber],
            AccountName: AccountName,
            BankName: [BankName],
            IFSCcode: [IFSCcode],
        }, {
            where: { userInfoID: studentId },
            transaction
        });

        const updatedUser = await UserInfo.findOne({
            where: { id: studentId },
            transaction
        });

        await transaction.commit();

        res.status(200).json({
            message: 'Student updated successfully',
            data: {
                ...updatedUser.dataValues,  // Includes all fields from UserInfo
                schoolCode,
                scholarNumber,
                RollNumber,
                aadhar,
                samargaNumber,
                childId,
                previousScholarNumber,
                previousSchoolTC,
                dob,
                classId,
                bankDetails: {
                    AccountNumber: [AccountNumber],
                    AccountName: AccountName,
                    BankName: [BankName],
                    IFSCcode: [IFSCcode]
                }
            }
        });
    } catch (err) {
        console.error("Error occurred:", err.message);
        await transaction.rollback();
        return res.status(500).json({ message: err.message });
    }
};

module.exports = updateStudent;

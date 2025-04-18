const { Payment, OAuthToken, UserInfo, FeeStructure, FeeType, Section } = require('../../models');
 
const getAllPaymentByStudentID = async (req, res) => {
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
        if (findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
 
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }
 
        const studentExists = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!studentExists) {
            return res.status(200).json({ message: "Student doesn't exist" });
        }
 
        const payments = await Payment.findAll({ where: { clientId: storeClientId, StudentID: studentId } });
 
        const paymentDetails = await Promise.all(payments.map(async payment => {
            const feeStructure = await FeeStructure.findOne({ where: { id: payment.FeeID, clientId: storeClientId } });
            const feeType = await FeeType.findOne({ where: { id: feeStructure.FeeTypeID, clientId: storeClientId } });
 
            let sectionID = payment.sectionID !== null ? payment.sectionID : -1;
            let sectionName = "";
            if (payment.sectionID !== null) {
                const sectionInfo = await Section.findOne({ where: { id: payment.sectionID, clientId: storeClientId } });
                if (sectionInfo) {
                    sectionName = sectionInfo.section_name;
                }
            }
 
            return {
                id: payment.id,
                StudentID: payment.StudentID,
                FeeID: payment.FeeID,
                FeeTypeName: feeType.FeeName,
                AmountPaid: payment.AmountPaid,
                PaymentDate: payment.PaymentDate,
                PaymentMethod: payment.PaymentMethod,
                TransactionID: payment.TransactionID,
                clientId: payment.clientId,
                classID: payment.classID,
                sectionID: sectionID,
                sectionName: sectionName
            };
        }));
 
        return res.status(200).json({ paymentDetails });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
 
module.exports = getAllPaymentByStudentID;
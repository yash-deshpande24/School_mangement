const { Payment, OAuthToken, UserInfo } = require('../../models');

const getPaymentByStudentId = async (req, res) => {
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
        if(findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {studentId} = req.params;
        if(!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }
        const studentExists = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!studentExists) {
            return res.status(200).json({ message: "Student doesn't exist" });
        }
        const payments = await Payment.findAll({ where: { clientId: storeClientId, StudentID: studentId } });
        return res.status(200).json({ payments });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}   

module.exports = getPaymentByStudentId
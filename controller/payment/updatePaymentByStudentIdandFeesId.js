const { Payment, OAuthToken, UserInfo } = require('../../models');

const updatePaymentByStudentIdandFeesId = async (req, res) => {
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
        const {studentId, feesId} = req.params;
        if(!studentId || !feesId) {
            return res.status(400).json({ message: "Student ID or Fees ID is required" });
        }
        const studentExists = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!studentExists) {
            return res.status(200).json({ message: "Student doesn't exist" });
        }
        const payment = await Payment.findOne({ where: { clientId: storeClientId, StudentID: studentId, FeeID: feesId } });
        if (!payment) {
            return res.status(200).json({ message: "Payment doesn't exist" });
        }
        const {paymentMethod, amountPaid, paymentDate} = req.body;
        if(!paymentMethod && !amountPaid && !paymentDate) {
            return res.status(400).json({ message: "You are not updating anything" });
        }
        const updayePayment = await payment.update(
            { PaymentMethod: paymentMethod, AmountPaid:amountPaid, PyamentDate: paymentDate }, 
            { where: 
                {clientId: storeClientId, StudentID: studentId, FeeID: feesId } 
            });
        if (!updayePayment) {
            return res.status(200).json({ message: "Payment doesn't exist" });
        }    
        // await payment.save();
        return res.status(200).json({ message: "Payment updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = updatePaymentByStudentIdandFeesId
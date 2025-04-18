const { Payment, OAuthToken} = require('../../models');

const deletePayment = async (req, res) => {
    try {
        console.log("Inside Delete Payment")
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
        const {paymentId} = req.params;
        console.log("paymentId", paymentId)
        if(!paymentId) {    
            return res.status(400).json({ message: "payment ID is required" });
        }
        const paymentExists = await Payment.findOne({ where: { id: paymentId, clientId: storeClientId } });
        console.log("paymentExists", paymentExists)
        if (!paymentExists) {
            return res.status(200).json({ message: "Payment doesn't exist" });
        }
        await paymentExists.destroy();
        return res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = deletePayment
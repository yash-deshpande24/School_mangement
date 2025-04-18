const { PendingFees, OAuthToken, OAuthClient, UserInfo, FeeStructure } = require('../../models');

const updatePendingFees = async (req, res) => {
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
            return res.status(400).json({ message: "Student ID and fees ID is required" });
        }
        const studentExists = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, isDeleted: false } });
        if (!studentExists) {
            return res.status(200).json({ message: "Student doesn't exist" });
        }

        const feesExists = await FeeStructure.findOne({ where: { id: feesId, clientId: storeClientId } });
        if (!feesExists) {
            return res.status(200).json({ message: "Fees structure doesn't exist" });
        }  

        const { AmountDue, status} = req.body;
        if(!AmountDue && !status ) {
            return res.status(400).json({ message: "You are not updating anything" });
        }

        const pendingFees = await PendingFees.findOne({ where: { StudentID: studentId, FeeID: feesId, clientId: storeClientId } });
        if (!pendingFees) {
            return res.status(200).json({ message: "Pending fees not found" });
        }

        await pendingFees.update({ AmountDue, status });
    

        return res.status(200).json({ message: "Pending fees updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = updatePendingFees
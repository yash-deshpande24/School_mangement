const { FeeType, OAuthToken, SchoolInfo, FeeStructure, Classes } = require('../../models');

const createFeesStructure = async (req, res) => {
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

        const { feeTypeId, classId, amount, dueDate } = req.body;
        if (!feeTypeId || feeTypeId === '') {
            return res.status(400).json({ message: 'Select fee type from dropdown' });
        }
        if (!classId || classId === '') {
            return res.status(400).json({ message: 'Select class from dropdown' });
        }
        if (!amount || amount === '' || isNaN(amount)) {
            return res.status(400).json({ message: 'valid amount is required' });
        }
        if (!dueDate || dueDate === '') {
            return res.status(400).json({ message: 'Due date is required' });
        }
        const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
        if (!classExist) {
            return res.status(400).json({ message: "Class does not exist" });
        }
        const feeTypeExist = await FeeType.findOne({ where: { id: feeTypeId, clientId: storeClientId } });
        if (!feeTypeExist) {
            return res.status(400).json({ message: "Fee type does not exist" });
        }
        const existingFeeStructure = await FeeStructure.findOne({ 
            where: { 
                FeeTypeID: feeTypeId, 
                ClassID: classId, 
                clientId: storeClientId 
            } 
        });
        if (existingFeeStructure) {
            return res.status(400).json({ message: 'Fee structure already exists' });
        }
        const newFeeStructure = await FeeStructure.create({
            FeeTypeID:feeTypeId,
            ClassID:classId,
            Amount:amount,
            DueDate:dueDate,
            clientId: storeClientId
        });
        return res.status(201).json({ message: 'Fee structure created successfully'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = createFeesStructure

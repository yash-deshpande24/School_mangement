const { Classes, OAuthToken, FeeStructure, FeeType } = require('../../models');
const { Op } = require('sequelize');

const createClass = async (req, res) => {
    try{
        
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
        if(findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {class_name} = req.body;
        if(!class_name) {
            return res.status(400).json({ message: "Class name is required" });
        }
        // const existingClass = await Classes.findOne({ where: { class_name, clientId: storeClientId, isDeleted: false } });
        const existingClass = await Classes.findOne({
            where: {
              class_name: {
                [Op.iLike]: class_name
              },
              clientId: storeClientId,
              isDeleted: false
            }
          });
        if (existingClass) {
            return res.status(400).json({ message: "Class already exists" });
        }                   
        const feeType = await FeeType.findOne({ where: { FeeName: "Tution Fee", clientId: storeClientId } });
        if (!feeType) {
            return res.status(400).json({ message: "Fee type not found" });
        }
        const newClass = await Classes.create({
            class_name,
            // teacherId: getAdminId || null,
            teacherId: null,
            clientId: storeClientId || null,
            isDeleted: false
        });

        

        await FeeStructure.create({
            FeeTypeID : feeType.id,
            ClassID: newClass.id,
            Amount: 100,
            DueDate: "2024-12-31",
            clientId: storeClientId || null,
        });
        return res.status(201).json({ message: 'Class created successfully'});
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = createClass;
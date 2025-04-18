const { FeeStructure, FeeType, OAuthToken, ClassEnrollments, Classes } = require("../../models");

const updateFeesStructureById = async (req, res) => {
  const { id } = req.params;
  const { classId, feeTypeId, amount, dueDate } = req.body;
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
    const feeStructureExist = await FeeStructure.findOne({ where: { id, clientId: storeClientId } });
    if (!feeStructureExist) {
      return res.status(200).json({ message: "Fees structure not found" });
    }

    let tempFeeTypeId = null;
    let tempClassId = null;
    let tempAmount = null;
    let tempDueDate = null;

    if (feeTypeId) {
      const feeTypeExist = await FeeType.findOne({ where: { id: feeTypeId, clientId: storeClientId } });
      if (!feeTypeExist) {
        return res.status(200).json({ message: "Fee type not found" });
      }
      tempFeeTypeId = feeTypeId;
    } else {
      tempFeeTypeId = feeStructureExist.FeeTypeID;
    }

    if (classId) {
      const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
      if (!classExist) {
        return res.status(200).json({ message: "Class not found" });
      }
      tempClassId = classId;
    } else {
      tempClassId = feeStructureExist.ClassID;
    }

    if (amount) {
      tempAmount = amount;
    } else {
      tempAmount = feeStructureExist.Amount;
    }

    if (dueDate) {
      tempDueDate = dueDate;
    } else {
      tempDueDate = feeStructureExist.DueDate;
    }

    // Check if fee type ID already exists and amount is updated
    if (feeTypeId && amount) {
      const checkAlreadyFeeStructure = await FeeStructure.findOne({ where: { ClassID: tempClassId, FeeTypeID: tempFeeTypeId, clientId: storeClientId } });
      if (checkAlreadyFeeStructure) {
        // Update the amount of the existing fee structure
        const updateFeesStructure = await FeeStructure.update({ Amount: tempAmount }, { where: { id: checkAlreadyFeeStructure.id } });
        return res.status(200).json({ message: "Fees structure updated successfully" });
      }
    }

    // If fee type ID does not exist or amount is not updated, proceed with the original logic
    const updateFeesStructure = await FeeStructure.update({ ClassID: tempClassId, FeeTypeID: tempFeeTypeId, Amount: tempAmount, DueDate: tempDueDate }, { where: { id } });
    const updatedObject = await FeeStructure.findOne({ where: { id } });

    if (updateFeesStructure) {
      return res.status(200).json({ message: "Fees structure updated successfully"});
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
module.exports = updateFeesStructureById;

// const { FeeStructure, FeeType, OAuthToken, ClassEnrollments, Classes } = require("../../models");

// const updateFeesStructureById = async (req, res) => {
//     const { id } = req.params;
//     const { classId, feeTypeId, amount, dueDate } = req.body;
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
//         const storeClientId = adminToken.client.id;
//         const getAdminId = adminToken.user.id;
//         const findRole = adminToken.user.role;
//         if(findRole !== "Owner" && findRole !== "Admin") {
//             return res.status(401).json({ message: "Unauthorized" });
//         }
//         const feeStructureExist = await FeeStructure.findOne({ where: { id, clientId: storeClientId } });
//         if (!feeStructureExist) {
//             return res.status(200).json({ message: "Fees structure not found" });
//         }

//         const checkAlreadyFeeStructure = await FeeStructure.findOne({ where: { ClassID: classId, FeeTypeID: feeTypeId, clientId: storeClientId } });
//         if (checkAlreadyFeeStructure) {
//             return res.status(400).json({ message: "Fee structure already exists" });
//         }

//         let tempFeeTypeId = null;
//         let tempClassId = null;
//         let tempAmount = null;
//         let tempDueDate = null;

//         if (feeTypeId) {
//             const feeTypeExist = await FeeType.findOne({ where: { id: feeTypeId, clientId: storeClientId } });
//             if (!feeTypeExist) {
//                 return res.status(200).json({ message: "Fee type not found" });
//             }
//             tempFeeTypeId = feeTypeId;
//         }else {
//             tempFeeTypeId = feeStructureExist.FeeTypeID;
//         }

//         if (classId) {
//             const classExist = await Classes.findOne({ where: { id: classId, clientId: storeClientId, isDeleted: false } });
//             if (!classExist) {
//                 return res.status(200).json({ message: "Class not found" });
//             }
//             tempClassId = classId;
//         }else {
//             tempClassId = feeStructureExist.ClassID;
//         }
//         if (amount) {
//             tempAmount = amount;
//         }else {
//             tempAmount = feeStructureExist.Amount;
//         }
//         if (dueDate) {
//             tempDueDate = dueDate;
//         }else {
//             tempDueDate = feeStructureExist.DueDate;
//         }
        
//         const updateFeesStructure = await FeeStructure.update({ ClassID:tempClassId, FeeTypeID: tempFeeTypeId, Amount: tempAmount, DueDate: tempDueDate }, { where: { id } });
//         const updatedObject = await FeeStructure.findOne({ where: { id } });

//         if (updateFeesStructure) {
//             return res.status(200).json({ message: "Fees structure updated successfully"});
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// }
// module.exports = updateFeesStructureById
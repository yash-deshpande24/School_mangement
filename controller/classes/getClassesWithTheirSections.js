const { Classes, OAuthToken,Section, FeeStructure, FeeType} = require('../../models');

const getAllClassesWithTheirSections = async (req, res) => {
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
        if(findRole !== "Teacher" && findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const classes = await Classes.findAll({ where: { clientId: storeClientId , isDeleted: false}, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } });

        if (classes.length === 0) {
            return res.status(200).json({ message: 'No classes found', classes});
        }
        const mapClassId = classes.map((item) => item.id);
        const findSection = await Section.findAll({ where: { classId: mapClassId, clientId: storeClientId }, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } });
        console.log("findSection", findSection)
        const findTutionFees = await FeeStructure.findAll({ where: { ClassID: mapClassId, clientId: storeClientId }, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } });
        const feeTypeArray = [];
        var feeTypeName = "";
        var feeTypeId = null;
        for (let i = 0; i < findTutionFees.length; i++) {
            const feeTypeInfo = await FeeType.findOne({ where: { id: findTutionFees[i].FeeTypeID, clientId: storeClientId }, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } });
            
            if (feeTypeInfo.FeeName === "Tution Fee") {
                feeTypeName = feeTypeInfo.FeeName;
                feeTypeId = feeTypeInfo.id;
            }
            feeTypeArray.push({
                ...findTutionFees[i].dataValues,
                feeTypeName: feeTypeInfo.FeeName
            });
        }
        console.log("feeTypeArray****************", feeTypeArray)
        const mapFeeTypeId = findTutionFees.map((item) => item.FeeTypeID);
        console.log("mapFeeTypeId", mapFeeTypeId)
        const findFeeTypeName = await FeeType.findAll({ where: { id: mapFeeTypeId, clientId: storeClientId }, attributes: { exclude: ['createdAt', 'updatedAt', 'clientId'] } });
        console.log("findFeeTypeName", findFeeTypeName)
        const feeTypeMap = findFeeTypeName.map((item) => {
            return {
                id: item.id,
                name: item.FeeName
            }
        })
        const updatedClasses = classes.map((classItem) => {
            const sections = findSection.filter((sectionItem) => sectionItem.classId === classItem.id);
            const sectionArray = sections.map((section) => ({
                id: section.id,
                sectionName: section.section_name
            }));
            return {
                ...classItem.toJSON(),
                sections: sectionArray.length > 0 ? sectionArray : null,
                FeeName : feeTypeName,
                FeeAmount: parseFloat(findTutionFees[0].Amount),
            };
        });
        
        return res.status(200).json({ message: 'Classes fetched successfully', classes: updatedClasses });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}    
module.exports = getAllClassesWithTheirSections
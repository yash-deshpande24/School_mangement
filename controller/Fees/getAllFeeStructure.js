const { FeeType, OAuthToken, SchoolInfo, FeeStructure,Classes} = require('../../models');


const getAllFeesStructure = async (req, res) => {
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
        const feeStructures = await FeeStructure.findAll({ where: { clientId: storeClientId },attributes:{exclude:['clientId']}});
        // if (!feeStructures) {
        //     return res.status(200).json({ message: 'No fee structures found' });
        // }
        if (feeStructures.length === 0) {
            return res.status(200).json({ message: 'No fee structures found', feeStructures });
        }

        for (let index = 0; index < feeStructures.length; index++) {
            const feeStructure = feeStructures[index];
            const feeType = await FeeType.findOne({where : { id : feeStructure.FeeTypeID }});
            const classes = await Classes.findOne({where : { id : feeStructure.ClassID }});
            feeStructures[index].dataValues.feeTypeName = feeType.FeeName;
            feeStructures[index]['dataValues']['className'] = classes.class_name;
        }
        

        return res.status(200).json({ message: 'Fee structures fetched successfully', feeStructures });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = getAllFeesStructure;
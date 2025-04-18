const { OAuthClient,OAuthToken, SchoolInfo, SchoolParentStudent} = require('../../models');
const updateSchoolInfo = async (req, res) => {
    try{
        const { schoolId } = req.params;
        // const { mobileNo1, city, state} = req.body;
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({where:{ accessToken: token }});
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        const getAdminId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if(findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const schoolInfoExist = await SchoolInfo.findOne({ where: { id: schoolId, clientId: storeClientId } });
        if (!schoolInfoExist) {
            return res.status(200).json({ message: "School info not found" });
        }
        const updateSchoolInfo = await SchoolInfo.update(req.body, { where: { id: schoolId } });
        if(updateSchoolInfo) {
            return res.status(200).json({ message: "School info updated successfully"});
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}


module.exports = updateSchoolInfo
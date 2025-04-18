const {SchoolFAQ, OAuthToken, SchoolInfo} = require('../../models');


const getFAQ = async (req, res) => {
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
        if(findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const school = await SchoolInfo.findOne({ where: { clientId: storeClientId } });
        if (!school) {
            return res.status(400).json({ message: 'School does not exist' });
        }
        const schoolFAQ = await SchoolFAQ.findAll({ where: { schoolId: school.id, clientId: storeClientId} });
        if (schoolFAQ.length === 0) {
            return res.status(200).json({ message: 'FAQ not found', data:schoolFAQ });
        }

        return res.status(200).json({ data: schoolFAQ });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = getFAQ;
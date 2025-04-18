const {SchoolFAQ, OAuthToken, SchoolInfo} = require('../../models');

const deleteFAQ = async (req, res) => {
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
        const {faqid} = req.params;
        const school = await SchoolInfo.findOne({ where: { clientId: storeClientId } });
        if (!school) {
            return res.status(400).json({ message: 'School does not exist' });
        }
        const faq = await SchoolFAQ.findOne({ where: { id: faqid, clientId: storeClientId } });
        if (!faq) {
            return res.status(400).json({ message: 'FAQ does not exist' });
        }
        await SchoolFAQ.destroy({ where: { id: faqid } });
        return res.status(200).json({ message: 'FAQ deleted successfully' });  
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
module.exports = deleteFAQ
const { OAuthClient, UserInfo, SchoolInfo} = require('../../models');
const getClientDetail = async (req, res) => {
    try{
        const {clientId} = req.params;
        const client = await OAuthClient.findOne({ where: { clientId: clientId } });
        if (!client) {
            return res.status(200).json({ message: "Client not found" });
        }
        const clientSecret = client.clientSecret;
        const findSchool = await SchoolInfo.findOne({ where: { clientId: clientId } });
        if (!findSchool) {
            return res.status(200).json({ message: "School not found" });
        }
        res.status(200).json({ message: "Client details fetched successfully",client:{
            clientSecret: clientSecret,
            schoolName: findSchool.name,
            schoolSlogan: findSchool.slogan,
            schoolLogo: findSchool.logo
        }});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    }

module.exports = getClientDetail;
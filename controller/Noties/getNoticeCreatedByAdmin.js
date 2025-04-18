const { Notices, OAuthToken} = require('../../models');


const getNoticeCreatedByAdmin = async (req, res) => {
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
        const notices = await Notices.findAll({ where: { clientId: storeClientId } });
        if (!notices || notices.length === 0) {
            return res.status(200).json({ message: 'Notices not found', notices });
        }

        return res.status(200).json({ Notices: notices });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


module.exports = getNoticeCreatedByAdmin;
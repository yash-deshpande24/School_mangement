const { Notices, OAuthToken, NoticeDetail } = require('../../models');

const deleteNoticeById = async (req, res) => {
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
        if (findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {noticeId} = req.params;
        const notice = await Notices.findOne({ where: { id: noticeId, clientId: storeClientId } });
        if (!notice) {
            return res.status(200).json({ message: "Notice not found" });
        }

        const noticeDetails = await NoticeDetail.findAll({ where: { noticeId: noticeId } });
        if (noticeDetails && noticeDetails.length > 0) {
            await NoticeDetail.destroy({ where: { noticeId: noticeId } });
        }


        await notice.destroy();
        return res.status(200).json({ message: "Notice deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = deleteNoticeById;
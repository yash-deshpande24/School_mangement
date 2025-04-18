const { Notices, OAuthToken, Classes } = require('../../models');

const getAdminNotice = async (req, res) => {
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
        const findRole = adminToken.user.role;
        if (findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const noticeForUser = await Notices.findAll({ where: { clientId: storeClientId } });
        if (noticeForUser.length === 0) {
            return res.status(200).json({ message: 'No notice found' });
        }
    
        const notice = [];
        for (let noticeDetail of noticeForUser) {
            const noticeId = noticeDetail.id;
            const noticeDetailData = await Notices.findOne({ where: { id: noticeId, clientId: storeClientId }, attributes: { exclude: ['clientId'] }  });
            
            let noticeDataWithoutClassId = { ...noticeDetailData.toJSON() };
            
            if (noticeDataWithoutClassId.classId && noticeDataWithoutClassId.classId.length > 0) {
                const classIds = noticeDataWithoutClassId.classId;
                const classData = await Classes.findAll({ where: { id: classIds, clientId: storeClientId } });
                const className = classData.map(item => ({ classId: item.id, className: item.class_name }));
                const { classId, ...noticeDataWithoutClassIdArray } = noticeDetailData.toJSON(); // Exclude classId
                noticeDataWithoutClassId = {
                    ...noticeDataWithoutClassIdArray,
                    class: className
                }

            }
            else {
                const { classId, ...noticeDataWithoutClassIdArray } = noticeDetailData.toJSON(); // Exclude classId
                noticeDataWithoutClassId = {
                    ...noticeDataWithoutClassIdArray,
                }
            }
            
            notice.push(noticeDataWithoutClassId);
        }
        
        return res.status(200).json({ message: 'Notice fetched successfully', notice: notice });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getAdminNotice;

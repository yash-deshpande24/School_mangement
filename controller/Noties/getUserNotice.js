const { Notices, NoticeDetail, OAuthToken, UserInfo, SchoolParentStudent, Classes, ClassEnrollments } = require('../../models');

const getUserNotice = async (req, res) => {
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

        const noticeForUser = await NoticeDetail.findAll({ where: { userId: getAdminId, clientId: storeClientId } });
        if (noticeForUser.length === 0) {
            return res.status(200).json({ message: 'No notice found' });
        }
    
        const notice = [];
        for (let noticeDetail of noticeForUser) {
            const noticeId = noticeDetail.noticeId;
            const noticeDetailData = await Notices.findOne({ where: { id: noticeId, clientId: storeClientId }, attributes: { exclude: ['clientId'] }  });

            if (!noticeDetailData) {
                continue;
            }
            if (noticeDetailData.classId && noticeDetailData.classId.length > 0) {
                const classIds = noticeDetailData.classId;
                const classData = await Classes.findAll({ where: { id: classIds, clientId: storeClientId } });
                const className = classData.map(item => ({ classId: item.id, className: item.class_name }));
                const { classId, ...noticeDataWithoutClassId } = noticeDetailData.toJSON(); 
                const object = {
                    ...noticeDataWithoutClassId,
                    class: className
                }
                notice.push(object);
            } else {
                notice.push(noticeDetailData);
            }
        }

       
        console.log("Array*************: ",notice);
        return res.status(200).json({ message: 'Notice fetched successfully', notice: notice });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports = getUserNotice;

const { Notices, OAuthToken, NoticeDetail, ClassEnrollments } = require('../../models');
const updateNotice = async (req, res) => {
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

        const role = adminToken.user.role;
        const getAdminId = adminToken.user.id;

        if (role !== "Admin" && role !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const storeClientId = adminToken.client.id;
        const date_posted = new Date();

        const { noticeId } = req.params; // Assuming noticeId is passed as a parameter

        const existingNotice = await Notices.findOne({ where: { id: noticeId, clientId: storeClientId } });

        if (!existingNotice) {
            return res.status(200).json({ message: "Notice not found" });
        }

        const { title, content} = req.body;

        // Update the notice fields if provided
        if (title) {
            existingNotice.title = title;
        }

        if (content) {
            existingNotice.content = content;
        }
        
        // Save the updated notice
        console.log("Notice updated successfully&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", existingNotice);
        await existingNotice.save();

        console.log("Notice updated successfully", existingNotice);

        // Handle NoticeDetail updates or deletions if needed

        return res.status(200).json({ message: 'Notice updated successfully' });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = updateNotice;

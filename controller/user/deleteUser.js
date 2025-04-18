const {OAuthToken, UserInfo} = require('../../models');

const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token }});
        console.log("Admin Token: ", adminToken);
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);
        

        const user = await UserInfo.findOne({ where: { id: userId, clientId: storeClientId, isDeleted: false} });
        if (!user) {
            return res.status(200).json({ message: 'User not found' });
        }
        await user.update({ isDeleted: true });
        const deletedUser = await UserInfo.findByPk(userId, { where: { clientId: storeClientId, isDeleted: true } });
        // await user.destroy();
        res.status(200).json({ message: 'User deleted successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = deleteUser;
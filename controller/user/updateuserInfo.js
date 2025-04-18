const { UserInfo, OAuthToken, TeacherDepartmentAssociation } = require("../../models");

const updateUserInfo = async (req, res) => {
    try {
        const { id } = req.params;
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

        const userInfoExist = await UserInfo.findOne({ where: { id, clientId: storeClientId, isDeleted: false } });
        if (!userInfoExist) {
            return res.status(404).json({ message: "User info not found" });
        }

        if (req.body.email && req.body.email !== userInfoExist.email) {
            const checkEmail = await UserInfo.findOne({ where: { email: req.body.email, clientId: storeClientId, isDeleted: false } });
            if (checkEmail) {
                return res.status(409).json({ message: "Email ID already exists" });
            }
        }

        await UserInfo.update(req.body, { where: { id } });

        if (req.body.role === "Teacher") {
            await TeacherDepartmentAssociation.update(
                { departmentId: req.body.departmentId }, 
                { where: { teacherId: id } }
            );
        }

        return res.status(200).json({ message: "User info updated successfully" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = updateUserInfo;
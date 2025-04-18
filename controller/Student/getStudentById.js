const { OAuthToken, UserInfo, SchoolParentStudent } = require('../../models');

const getStudentById = async (req, res) => {
    const { studentId } = req.params;
    try {
        const accessToken = req.headers.authorization;
        if (!accessToken || !accessToken.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const token = accessToken.split(' ')[1];
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        console.log("Admin Token: ", adminToken);
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token" });
        }
        const storeClientId = adminToken.client.id;
        console.log("Store Client ID: ", storeClientId);
        
        const student = await UserInfo.findOne({
            where: { id: studentId, clientId: storeClientId, isDeleted: false },
            attributes: { exclude: ['clientId'] }
        });

        if (!student) {
            return res.status(200).json({ message: 'Student not found' });
        }
        if (student.role !== "Student") {
            return res.status(400).json({ message: 'studentId is not a student user' });
        }

        const parentIdRecords = await SchoolParentStudent.findAll({
            where: { studentId: studentId, clientId: storeClientId }
        });

        let parents = [];
        for (let i = 0; i < parentIdRecords.length; i++) {
            const parentId = parentIdRecords[i].parentId;
            const parent = await UserInfo.findOne({
                where: { id: parentId, clientId: storeClientId, isDeleted: false },
                attributes: { exclude: ['clientId'] }
            });
            if (parent) {
                parents.push(parent);
            }
        }

        return res.status(200).json({ message: 'Student fetched successfully', student, parents });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = getStudentById;
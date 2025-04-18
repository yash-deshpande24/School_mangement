const { OAuthClient,OAuthToken, SchoolInfo, SchoolParentStudent} = require('../../models');

const createSchool = async (req, res) => {
    try{
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

        const { name, logo, mobileNo1, mobileNo2, mobileNo3, emailId, addressLine1, addressLine2, addressLine3, city, state, website} = req.body;
        if(!name || !logo || !mobileNo1 || !mobileNo2 || !mobileNo3 || !emailId || !addressLine1 || !addressLine2 || !addressLine3 || !city || !state || !website){
            return res.status(400).json({ message: 'All fields are required' });
        }

        const ClientExist = await OAuthClient.findOne({ where: { clientId: storeClientId } });
        console.log("isClientExist: ", ClientExist);
        if (!ClientExist) {
            return res.status(400).json({ message: 'Client does not exist' });
        }
        const role = adminToken.user.role;
        console.log("Role: ", role);
        const getStudentId = adminToken.user.id;
        if (role !== "Admin" && role !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isExistingSchool = await SchoolInfo.findOne({ where: { emailId: emailId, clientId: storeClientId } });
        if (isExistingSchool) {
            return res.status(400).json({ message: 'School already exists' });
        }   

        
        const school = await SchoolInfo.create({
            name,
            logo,
            mobileNo1,
            mobileNo2,
            mobileNo3,
            emailId,
            addressLine1,
            addressLine2,
            addressLine3,
            city,
            state,
            website,
            clientId: storeClientId
        });

        const parent = await SchoolParentStudent.create({
            parentId: null,
            studentId: getStudentId,
            schoolId: school.id,
            clientId: storeClientId
        });
        console.log("Parent: ", parent);

        return res.status(201).json({message: 'School created successfully'});
    }catch(err){
        return res.status(500).json({ message: err.message });}

    }

module.exports = createSchool;
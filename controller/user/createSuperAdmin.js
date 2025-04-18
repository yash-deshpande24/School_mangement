const {UserInfo} = require("../../models");
const bcrypt = require("bcrypt");

const registerSuperAdmin = async (req, res) => {
    try {
        const {firstName, lastName, email, password, mobileno, clientId} = req.body;
        if(!firstName || !lastName || !email || !password || !mobileno){
            return res.status(400).json({ message: 'All fields are required' });
        }
        const emailLowerCase = email.toLowerCase();
        const existingUser = await UserInfo.findOne({ where: { email, isDeleted: false } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        console.log("Request Body: ", req.body);
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserInfo.create({
            firstName,
            lastName,
            email: emailLowerCase,
            password: hashedPassword,
            mobileno,
            role:"SuperAdmin",
            clientId,
            isDeleted: false,
            imageUrl: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        });
        res.status(201).json({message: 'Super Admin created successfully'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
module.exports = registerSuperAdmin;
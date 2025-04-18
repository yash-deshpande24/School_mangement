const { OAuthClient,UserInfo,SchoolInfo, FeeType} = require('../../models'); // Adjust the path to your models if necessary
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const createClient = async (req, res) => {
    try{
        const {school_name, adminEmail} = req.body;
        if(!school_name || !adminEmail){
            return res.status(400).json({ message: 'All Fields are required' });
        }
        const schoolNameWithoutSpace = school_name.replace(/\s/g, '');
        console.log("removeSpace", schoolNameWithoutSpace)

        const clientID = `df-schoolmanagement-${schoolNameWithoutSpace}-${Math.random().toString(36).substring(2, 15)}`; // Generate automatic client ID
        const clientIDLength = clientID.length;
        console.log("clientIDLength", clientIDLength)
        // const clientSecret = Math.random().toString(36).substring(2, clientIDLength + 2);

        const ExistingClient = await OAuthClient.findOne({ where: { clientId: clientID } });
        if (ExistingClient) {
            return res.status(400).json({ message: 'Client ID already exists' });
        }
        const existingSchool = await SchoolInfo.findOne({ where: { name: school_name } });
        if (existingSchool) {
            return res.status(400).json({ message: 'School With Same Name Already exists' });
        }
      
        let clientSecret = '';
        while (clientSecret.length < clientIDLength) {
            clientSecret += Math.random().toString(36).substring(2);
        }
        clientSecret = clientSecret.substring(0, clientIDLength);
        console.log("clientSecret", clientSecret)
        const generateRandomPassword = Math.random().toString(36).substring(2, 15);
        console.log("generateRandomPassword", generateRandomPassword)
        const hashedPassword = await bcrypt.hash(generateRandomPassword, 10);
        const adminEmailLowercase = adminEmail.toLowerCase();
        const checkExistingUser = await UserInfo.findOne({ where: { email: adminEmailLowercase } });
        if (checkExistingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const client = await OAuthClient.create({
            clientId: clientID,
            clientSecret: clientSecret,
            grants:["password","refresh_token"],
        });

        const schoolAdd = await SchoolInfo.create({
            name: school_name,
            slogan: "School slogan",
            logo: "https://cdn.pixabay.com/photo/2016/03/23/15/00/ice-cream-1274894_1280.jpg",
            clientId: client.clientId,
        })
        const addAdminUser = await UserInfo.create({
            firstName: "Admin",
            lastName: "User",
            email: adminEmailLowercase,
            password: hashedPassword,
            role: "Admin",
            clientId: client.clientId,
            isDeleted: false,
            imageUrl: "https://cdn.pixabay.com/photo/2016/03/23/15/00/ice-cream-1274894_1280.jpg",
        })
          // Sending email after user registration
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'dreamfillerofficial@gmail.com',
                pass: 'rjqyiuemtmqkdicn' // Replace with your actual Gmail password
            }
        });

        // Prepare email content
        const mailOptions = {
            from: 'dreamfillerofficial@gmail.com',
            to: adminEmail,
            subject: 'Welcome to Our Platform',
            html: `
                <p>Hello ${school_name},</p>
                <p>Thank you for registering on our School Portal platform. Your account has been successfully created.</p>
                <p>Here are your login credentials to the School Portal:</p>
                <table border="1">
                    <tr>
                        <th>Unique ID</th>
                        <th>Email</th>
                        <th>Password</th>
                    </tr>
                    <tr>
                        <td>${clientID}</td>
                        <td>${adminEmail}</td>
                        <td>${generateRandomPassword}</td>
                    </tr>
                </table>
                <p>Best regards,<br>The Admin Team</p>
            `
        };

        // Send email
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        await FeeType.create({
            FeeName: "Tution Fee",
            Description: "Default Tution Fee",
            clientId: client.clientId,
        })

        return res.status(201).json({message: 'Client created successfully', client});
    }catch(err){
        return res.status(500).json({ message: err.message });}
    }
module.exports = createClient;
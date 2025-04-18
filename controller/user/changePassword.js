const { OAuthToken, UserInfo } = require('../../models');
const bcrypt = require("bcrypt");

const changePassword = async (req, res) => {
    try {
        // Extract and validate access token from headers
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized: No or invalid authorization header" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        console.log('Extracted token:', token);

        // Find the admin token from the database
        const adminToken = await OAuthToken.findOne({ where: { accessToken: token } });
        if (!adminToken) {
            return res.status(400).json({ message: "Invalid token: Token not found in database" });
        }

        console.log('Admin token found:', adminToken);

        const storeClientId = adminToken.client.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new passwords are required' });
        }

        console.log('Store Client ID:', storeClientId);

        // Find the user and ensure they exist, using the user ID from the token
        const user = await UserInfo.findOne({
            where: { id: adminToken.user.id, clientId: storeClientId, isDeleted: false }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user);

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        // Extract special characters, symbols, and numbers from the password
        // const extractSymbolsAndNumbers = (password) => {
        //     return password.replace(/[a-zA-Z\s]/g, ''); // Remove letters and whitespace, leaving symbols and numbers
        // };

        // const oldPasswordSymbols = extractSymbolsAndNumbers(oldPassword);
        // const newPasswordSymbols = extractSymbolsAndNumbers(newPassword);

        // console.log('Old Password Symbols:', oldPasswordSymbols);
        // console.log('New Password Symbols:', newPasswordSymbols);
        

        // if (oldPasswordSymbols === newPasswordSymbols) {
        //     return res.status(400).json({ message: 'New password cannot have the same symbols or numbers as the old password' });
        // }

        // Check if the new password is the same as the old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be the same as the old password' });
        }

        // Hash and update the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('New hashed password:', hashedPassword);

        await user.update({ password: hashedPassword });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = changePassword;
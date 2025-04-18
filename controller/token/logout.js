const { OAuthToken } = require('../../models');

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }
        console.log('Token to revoke:', token);

        const tokenRecord = await OAuthToken.findOne({ where: { accessToken: token } });

        if (!tokenRecord) {
            return res.status(400).json({ error: 'Invalid token: Token not found in database' });
        }
        await tokenRecord.destroy();

        res.status(200).json({ message: ' logged out Successfully' });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ error: 'An error occurred', details: err.message });
    }
};

module.exports = logout;

const OAuth2Server = require("oauth2-server")
var Request = OAuth2Server.Request
var Response = OAuth2Server.Response;

const oauthServer = new OAuth2Server({
    model: require("../../oauthServer"),
    grants: ["password", "refresh_token"],
    accessTokenLifetime: 28800, // 1 hr in seconds
    refreshTokenLifetime: 86400, // 1 hr in seconds
    allowBearerTokensInQueryString: true
});


const obtainToken = async (req, res) => {
    try {
        const request = new Request(req);
        const response = new Response(res);
        
        const token = await oauthServer.token(request, response);
        res.json(token);
    } catch (err) {
        console.error(err);
        res.status(err.code || 500).json(err);
    }
};


module.exports = obtainToken 
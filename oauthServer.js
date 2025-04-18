// modele.exports = oauth;
const { UserInfo, oAuthClient, oAuthToken} = require('./models');
const bcrypt = require('bcrypt');
var express = require('express');
const {where} = require('sequelize');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var getAccessToken = async function (token) {
    try {
        console.log("Inside Acccess Token", token);
        console.log("token", token);
        const foundToken = await oAuthToken.findOne({ where: { accessToken: token } });

        if (foundToken) {
            return foundToken;
        } else {
            return null;
        }
    } catch (error) {
        console.log("message finding Access Token", error);
        return null;
    }
}

let globalClientID;
var getClient = async function (clientId, clientSecret) {
    try {
        console.log("Inside Client", clientId, clientSecret);
        const foundClient = await oAuthClient.findOne({ where: { clientId: clientId, clientSecret: clientSecret } });
        if (foundClient) {
            console.log("foundClient", foundClient);
            return null;
        }
        console.log("foundClient", foundClient);
        globalClientID = foundClient.clientId;
        console.log("globalClientID", globalClientID);
        return foundClient;
    } catch (error) {
        console.log("message finding Client", error);
        return null;
    }
}

const saveToken = async (token, client, user) => {
    try {
        const existingToken = await oAuthToken.findOne({ where: { 'user.email': user.email, 'client.id': client.clientId } });
        if(existingToken){
            if(existingToken.accessTokenExpireAt > Date.now()){
                return existingToken;
            }
            else{
                await oAuthToken.destroy({ where: { 'user.email': user.email, 'client.id': client.clientId } });
            }
        }

       // Create new OAuthToken object
       const newClient = new OAuthClient({
        id: client.clientId,
        clientName: client.clientName,
    });
    console.log("newClient%%%%%%%%%%%%%%%%%%", user.firstName)
    const newUser = new UserInfo({
        id: user.id,
        // firstName: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role,
    });

    const mapNameInAboveResponse = {
        id: user.id,
        name: user.firstName + " " + user.lastName,
        email: user.email,
        role: user.role
    }
    console.log("mapNameInAboveResponse ((((((((((", mapNameInAboveResponse)

    console.log("newClient", newClient)
    console.log("newUser", newUser)

    const newToken = new OAuthToken({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        client: newClient,
        user: mapNameInAboveResponse,
    });

    console.log("newToken@@@@@@@@@@@@@@@@@@", newToken)

    const savedToken = await newToken.save(); // Save the new token

    return savedToken; 
    } catch (error) {
        console.log("message saving Token", message);
        return null;
    }
};

var getUser = async function (email, password) {
    // console.log("Inside getUser", email, password)
    try {
        console.log("Inside getUser Email", email)

        const foundUser = await UserInfo.findOne({where : {email: email, isDeleted: false, clientId: globalClientID}});
        console.log("foundUser Check", foundUser)
        console.log("foundUser", foundUser.clientId);
        console.log("foundUser Global", globalClientID);
        if (foundUser.clientId !== globalClientID) {
            console.log('User not found');
            return null;
        }
        // console.log("foundClient", foundClient.clientID)
        if (!foundUser) {
            console.log('User not found');
            return null;
        }
        const getpassword = await bcrypt.compare(password, foundUser.password);
        if (!getpassword) {
            console.log('User Password not found');

            return null;
        }
        console.log("foundUser )))))))))))))))", foundUser)
        return foundUser;
    } catch (err) {
        console.log('message finding User:', err);
        return null;
    }
}

app.use(express.urlencoded({ extended: true }));

var getUserFromClient = async function (clientId, clientSecret) {
    // console.log("Inside getUserFromClient", clientId, clientSecret)
    try {
        console.log("Inside getUserFromClient")
        const foundClient = await OAuthClient.findOne({ where: { clientId: clientId, clientSecret: clientSecret, grants: 'client_credentials' } });
        console.log("Get User From Client", foundClient)
        if (!foundClient) {
            console.log('Client not found');
            return null;
        }
        return foundClient;
    } catch (err) {
        console.log('message finding Client:', err);
        return null;
    }
}

var getRefreshToken = async function (refreshToken) {
    try {
        console.log("Inside Refresh Token: ", refreshToken)
        const foundToken = await OAuthToken.findOne({ where: { refreshToken: refreshToken } });
        // console.log("foundToken", foundToken)
        if (!foundToken) {
            console.log('Refresh Token not found');
            return null;
        }
        console.log("foundToken inside Refresh Token", foundToken)
        return foundToken;
    } catch (err) {
        console.log('message finding Refresh Token:', err);
        return null;
    }
}

var revokeToken = async function (token) {
    try {
        console.log("Inside Revoke Token: ", token)
        const findResult = await OAuthToken.findOne({ where: { refreshToken: token.refreshToken } });
        console.log("findResult inside Revoke Token", findResult)
        const result = await OAuthToken.destroy({ where: { refreshToken: token.refreshToken } });
        console.log("result inside Revoke Token", result)
        const deleteSuccess = result && result.deletedCount === 1;
        if (!deleteSuccess) {
            console.log('Token not found');
            return null;
        }

        // console.log("foundToken inside Revoke Token", foundToken)
        return findResult;
    }
    catch (err) {
        console.log('message finding Token:', err);
        return null;
    }
}

module.exports = {
    getAccessToken: getAccessToken,
    getClient: getClient,
    saveToken: saveToken,
    getUser: getUser,
    getUserFromClient: getUserFromClient,
    getRefreshToken: getRefreshToken,
    revokeToken: revokeToken,
}
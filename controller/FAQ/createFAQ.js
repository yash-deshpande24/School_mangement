const {SchoolFAQ, OAuthToken, SchoolInfo} = require('../../models');
const createFAQ = async (req, res) => {
    try{
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
        const getAdminId = adminToken.user.id;
        const findRole = adminToken.user.role;
        if(findRole !== "Owner" && findRole !== "Admin" && findRole !== "Teacher") {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { questionAnswerArray } = req.body;
        console.log("Question and Answer******************************: ", questionAnswerArray);
        if (!questionAnswerArray) {
            return res.status(400).json({ message: 'Question and answer are required' });
        }
        if (!Array.isArray(questionAnswerArray)) {
            return res.status(400).json({ message: 'Question and answer must be an array' });
        }

        if (questionAnswerArray.length === 0) {
            return res.status(400).json({ message: 'Question and answer array is empty' });
        }
        const school = await SchoolInfo.findOne({ where: { clientId: storeClientId } });
        console.log("School ID: ", school.id);
        if (!school) {
            return res.status(400).json({ message: 'School does not exist' });
        }

        for (let i = 0; i < questionAnswerArray.length; i++) {
            const { question, answer } = questionAnswerArray[i];
            console.log("Question: ************************* ", question, "Answer: ******************************** ", answer);
            if ((!question || !answer) || ( question === '' || answer === '') || (question === undefined || answer === undefined)) {
                return res.status(400).json({ message: 'Question and answer are required' });
            }
            await SchoolFAQ.create({
                schoolId: school.id,
                question,
                answer,
                clientId: storeClientId
            });
        }
        return res.status(201).json({ message: 'FAQ created successfully' });

    }catch(err){
        return res.status(500).json({ message: err.message });}
}
module.exports = createFAQ
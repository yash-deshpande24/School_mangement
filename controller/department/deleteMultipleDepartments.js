const {Department, OAuthToken} = require('../../models');

const deleteMultipleDepartments=async(req,res)=>{
    try{
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

        const findRole = adminToken.user.role;
        if (findRole !== "Admin" && findRole !== "Owner") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {departmentIds}=req.body;
        if(!departmentIds){
            return res.status(400).json({message:"Department ids are required"})
        }
        const checkDepartments=await Department.findAll({
            where:{
                id:{
                    [Sequelize.Op.in]:departmentIds
                }
            }
        });
        
        if(!checkDepartments){
            return res.status(200).json({message:"Departments not found"})
        }
        const deletedDepartments=await Department.destroy({
            where:{
                id:{
                    [Sequelize.Op.in]:departmentIds
                }
            }
        });
        return res.status(200).json({
            message:"Departments deleted successfully"
        })
    }catch(err){
        return res.status(500).json({ message: err.message });
    }

}
module.exports=deleteMultipleDepartments;
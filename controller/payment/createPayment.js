const {Payment, PendingFees, OAuthToken, UserInfo, FeeStructure, ClassEnrollments, FeeType, Section, Classes} = require('../../models');

const createPayment = async (req, res) => {
    try {
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
        if(findRole !== "Owner" && findRole !== "Admin") {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {studentId} = req.params;
        let { amountPaid, paymentDate, FeesID, paymentMethod, transactionId, ClassID, SectionID} = req.body;

        if(!studentId  || !amountPaid || !FeesID || !paymentDate || !paymentMethod || !ClassID || !SectionID) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const studentData = await UserInfo.findOne({ where: { id: studentId, clientId: storeClientId, role: "Student", isDeleted: false } });
        console.log("studentData: ", studentData);
        const feeStructure = await FeeStructure.findOne({ where: { id: FeesID, clientId: storeClientId } });
        console.log("feeStructure: ", feeStructure);
        const feesType = await FeeType.findOne({ where: { id: feeStructure.FeeTypeID, clientId: storeClientId } });
        const classExist = await Classes.findOne({ where: { id: ClassID, clientId: storeClientId, isDeleted: false } });
        if(SectionID && SectionID != -1) {
            const sectionExist = await Section.findOne({ where: { id: SectionID, classId: ClassID, clientId: storeClientId, isDeleted: false } });
            if (!sectionExist) {
                return res.status(200).json({ message: "Section not found" });
            }
        }else {
            SectionID = null;
        }
        if (!studentData) {
            return res.status(200).json({ message: "Student not found" });
        }else if (studentData.role !== "Student") {
            return res.status(400).json({ message: "Invalid student ID" });
        }else if (!feeStructure) {
            return res.status(200).json({ message: "Fee structure not found" });
        }else if (!feesType) {
            return res.status(200).json({ message: "Fees type not found" });
        }else if (!classExist) {
            return res.status(200).json({ message: "Class not found" });
        }

        const pendingFees = await PendingFees.findOne({ where: { StudentID: studentId, FeeID: FeesID, classID: ClassID, sectionID: SectionID, clientId: storeClientId } });
        console.log("pendingFees: ", pendingFees);
        if (!pendingFees) {
            return res.status(200).json({ message: "Pending fees not found" });
        }
        const PaymentCheck = await Payment.findAll({ where: { StudentID: studentId, FeeID: FeesID, classID: ClassID,clientId: storeClientId } });

        const addedPayment = PaymentCheck.map((payment) => payment.AmountPaid).reduce((acc, val) => parseFloat(acc) + parseFloat(val), 0);
        console.log("addedPayment: ", addedPayment);
        // console.log("addedPayment: ", parseFloat(addedPayment));
        console.log("PaymentCheck: ", PaymentCheck); 
        console.log("pendingFees: ", pendingFees.AmountDue);
        console.log("amountPaid: ", amountPaid);

        const findTotalPendingFees = pendingFees.AmountDue - addedPayment;
        console.log("findTotalPendingFees: ", findTotalPendingFees);

        if (amountPaid > pendingFees.AmountDue) {
            return res.status(400).json({ message: "Pending fees amount is: " + findTotalPendingFees });
        }
        if(addedPayment + amountPaid > pendingFees.AmountDue) {
            return res.status(400).json({ message: "Pending fees amount is: " + findTotalPendingFees });
        }
        
        const isEnrolled = await ClassEnrollments.findOne({ where: { studentId: studentId, classId: ClassID, sectionId: SectionID, clientId: storeClientId } });
        if (!isEnrolled) {
            return res.status(200).json({ message: "Student is not enrolled in this class" });
        }
        await Payment.create({ StudentID: studentId, FeeID: FeesID, AmountPaid:amountPaid, PaymentDate:paymentDate, PaymentMethod:paymentMethod, TransactionID:transactionId, classID: ClassID, sectionID: SectionID, clientId: storeClientId });
        return res.status(200).json({ message: "Payment created successfully"});   

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}   
module.exports = createPayment
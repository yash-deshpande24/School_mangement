const multer = require("multer");
const xlsx = require("xlsx");
const express = require("express");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const createData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        console.log(req.file);

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames;
        const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName[0]]);

        const mapsData = xlData.map((row) => ({
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            mobileno: row.mobileno,
            role: row.role,
            dob: row.dob,
            govtIdentityNumber: row.govtIdentityNumber,
            RollNumber: row.RollNumber,
            BloodGroup: row.BloodGroup,
            LocalIdentificationDetails: row.LocalIdentificationDetails,
            AccountNumber: row.AccountNumber,
            AccountName: row.AccountName,
            BankName: row.BankName,
            IFSCcode: row.IFSCcode,
            
        }));
        res.status(200).json({
            message: "File uploaded and processed successfully.",
            data: mapsData,
        });
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({
            message: "Failed to process file.",
            error: error.message,
        });
    }
};

module.exports = createData;
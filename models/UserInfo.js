const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('UserInfo', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mobileno: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM("Parent","Student","Admin","Owner","Teacher","SuperAdmin","Reception"),
      allowNull: true
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    alternateMobileNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressLine3: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    feeDiscount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    aadhar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    govtIdentityName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    govtIdentityNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    RollNumber: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    AccountName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    schoolCode: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    scholarNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    samargaNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    childId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    previousScholarNumber: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    previousSchoolTC: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    parentName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentMobileNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    BloodGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    LocalIdentificationDetails: {
      type: DataTypes.STRING,
      allowNull: true
    },
    AccountNumber: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    BankName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    IFSCcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isTrial: {
      type: DataTypes.STRING,
      allowNull: true
    },
    trialEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    actualName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'UserInfo',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "UserInfo_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Payment', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    StudentID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    FeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'FeeStructure',
        key: 'id'
      }
    },
    AmountPaid: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    PaymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    PaymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    TransactionID: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    classID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    sectionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Section',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Payment',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Payment_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fki_Payment_ClassID_fkey",
        fields: [
          { name: "classID" },
        ]
      },
      {
        name: "fki_Payment_SectionID_fkey",
        fields: [
          { name: "sectionID" },
        ]
      },
    ]
  });
};

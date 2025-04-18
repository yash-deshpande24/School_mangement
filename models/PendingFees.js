const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PendingFees', {
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
    AmountDue: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    DueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Pending"
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
    tableName: 'PendingFees',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "PendingFees_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fki_PendingFees_ClassID_fkey",
        fields: [
          { name: "classID" },
        ]
      },
      {
        name: "fki_PendingFees_SectionID_fkey",
        fields: [
          { name: "sectionID" },
        ]
      },
    ]
  });
};

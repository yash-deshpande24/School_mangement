const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FeeStructure', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    FeeTypeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'FeeType',
        key: 'id'
      }
    },
    ClassID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    Amount: {
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
    }
  }, {
    sequelize,
    tableName: 'FeeStructure',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "FeeStructure_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TransactionType', {
    transaction_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    transaction_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'TransactionType',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "TransactionType_pkey",
        unique: true,
        fields: [
          { name: "transaction_id" },
        ]
      },
    ]
  });
};

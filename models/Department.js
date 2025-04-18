const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Department', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Department',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Department_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

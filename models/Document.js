const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Document', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userInfoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Document',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Document_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

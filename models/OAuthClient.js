const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('OAuthClient', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clientId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "OAuthClient_clientId_key"
    },
    clientSecret: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    redirectUri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    grants: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'OAuthClient',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "OAuthClient_clientId_key",
        unique: true,
        fields: [
          { name: "clientId" },
        ]
      },
      {
        name: "OAuthClient_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

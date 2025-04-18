const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('OAuthToken', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    accessToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    accessTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refreshToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    client: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    user: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'OAuthToken',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "OAuthToken_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('WifiDetail', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    wifiName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    clientId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: 'OAuthClient',
        key: 'clientId'
      }
    }
  }, {
    sequelize,
    tableName: 'WifiDetail',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "WifiDetail_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

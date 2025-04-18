const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('NoticeDetail', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    noticeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Notices',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'OAuthClient',
        key: 'clientId'
      }
    }
  }, {
    sequelize,
    tableName: 'NoticeDetail',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "NoticeDetail_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

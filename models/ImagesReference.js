const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ImagesReference', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ImageType',
        key: 'image_id'
      }
    }
  }, {
    sequelize,
    tableName: 'ImagesReference',
    schema: 'public',
    timestamps: false
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ImageType', {
    image_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    image_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'ImageType',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ImageType_pkey",
        unique: true,
        fields: [
          { name: "image_id" },
        ]
      },
    ]
  });
};

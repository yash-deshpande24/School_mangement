const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Section', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    section_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Section',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "Section_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

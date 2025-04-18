const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SchoolParentStudent', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SchoolInfo',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SchoolParentStudent',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "SchoolParentStudent_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

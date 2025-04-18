const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('TeacherDepartmentAssociation', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Department',
        key: 'id'
      }
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
    tableName: 'TeacherDepartmentAssociation',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "TeacherDepartmentAssociation_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "fki_TeacherDepartmentAssociation_departmentId_fkey",
        fields: [
          { name: "departmentId" },
        ]
      },
    ]
  });
};

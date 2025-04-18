const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ClassEnrollments', {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Section',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'ClassEnrollments',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ClassEnrollments_pkey",
        unique: true,
        fields: [
          { name: "studentId" },
          { name: "classId" },
        ]
      },
    ]
  });
};

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FacultyAttendance', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    clockIn: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    clockOut: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'UserInfo',
        key: 'id'
      }
    },
    fullName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    shiftType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FacultyAttendance',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "FacultyAttendance_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

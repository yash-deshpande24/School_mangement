const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FacultyLeaveDetails', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    LeaveType: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending"
    },
    declineReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    StartDate: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    endDate: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    TeacherName: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FacultyLeaveDetails',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "FacultyLeaveDetails_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

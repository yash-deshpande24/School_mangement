const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('StudentAttendance', {
    attendance_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attendance_status: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'StudentAttendance',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "StudentAttendance_pkey",
        unique: true,
        fields: [
          { name: "attendance_id" },
        ]
      },
    ]
  });
};

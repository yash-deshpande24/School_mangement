const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ClassSchedules', {
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Classes',
        key: 'id'
      }
    },
    day_of_week: {
      type: DataTypes.ENUM("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"),
      allowNull: false,
      primaryKey: true
    },
    lecture: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ClassSchedules',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "ClassSchedules_pkey",
        unique: true,
        fields: [
          { name: "classId" },
          { name: "day_of_week" },
          { name: "lecture" },
        ]
      },
    ]
  });
};

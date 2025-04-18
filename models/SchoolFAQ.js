const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('SchoolFAQ', {
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
    faqId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    question: {
      type: DataTypes.STRING,
      allowNull: true
    },
    answer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SchoolFAQ',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "SchoolFAQ_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

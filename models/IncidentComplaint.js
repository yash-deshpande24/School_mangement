const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('IncidentComplaint', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    incidentType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    raisedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true
    },
    schoold: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'IncidentComplaint',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "IncidentComplaint_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};

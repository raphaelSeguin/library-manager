'use strict';
module.exports = (sequelize, DataTypes) => {
  var Essai = sequelize.define('Essai', {
    une_colonne: DataTypes.INT
  }, {});
  Essai.associate = function(models) {
    // associations can be defined here
  };
  return Essai;
};
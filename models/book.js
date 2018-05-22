'use strict';

module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    title: {
        type: DataTypes.STRING
    },
    author: {
        type: DataTypes.STRING
    },
    genre: {
        type: DataTypes.STRING
    },
    first_published: {
        type: DataTypes.INTEGER
    }
  }, {
    //freezeTableName: true
  });
  Book.associate = function(models) {
    // associations can be defined here
  };
  return Book;
};
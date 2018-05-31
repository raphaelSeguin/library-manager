'use strict';

module.exports = (sequelize, DataTypes) => {
  var Book = sequelize.define('Book', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
    },
    author: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
    },
    genre: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
    },
    first_published: {
        type: DataTypes.INTEGER
    }
  }, {
    timestamps: false
  });
  Book.associate = function(models) {
    // associations can be defined here
  };
  return Book;
};
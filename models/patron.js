// The patrons table should have the following columns:
// id an integer,
// first_name (string),
// last_name (string),
// address (string),
// email (string),
// library_id (string) and
// zip_code ( integer).
'use strict';

module.exports = (sequelize, DataTypes) => {
    var Patron = sequelize.define('Patron', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        last_name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        address: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true,
                isEmail: true
            }
        },
        library_id: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: true
            }
            
        },
        zip_code: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: true
            }
        }
    }, {
        timestamps: false,
    });
    Patron.associates = function(models) {
        // associations can be defined here
    };
    return Patron;
};

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
            type: DataTypes.STRING
        },
        last_name: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        library_id: {
            type: DataTypes.STRING
        },
        zip_code: {
            type: DataTypes.INTEGER
        }
    }, {});
    Patron.associates = function(models) {
        // associations can be defined here
    };
    return Patron;
};

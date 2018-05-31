// The loans table should have the following columns:
// id (integer),
// book_id (integer),
// patron_id (integer),
// loaned_on (date),
// return_by (date) and
// returned_on (date).

'use strict';

module.exports = (sequelize, DataTypes) => {
    var Loan = sequelize.define('Loan', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        book_id: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: true
            }
        },
        patron_id: {
            type: DataTypes.INTEGER,
            validate: {
                isInt: true
            }
        },
        loaned_on: {
            type: DataTypes.DATEONLY,
            validate: {
                isDate: true
            }
        },
        return_by: {
            type: DataTypes.DATEONLY,
            validate: {
                isDate: true
            }
        },
        returned_on: {
            type: DataTypes.DATEONLY,
            validate: {
                isDate: true
            }
        }
    }, {
        timestamps: false,
    });
    Loan.associates = function(models) {
      // associations can be defined here
    };
    return Loan;
};
  

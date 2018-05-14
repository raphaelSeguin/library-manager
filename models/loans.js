// The loans table should have the following columns:
// id (integer),
// book_id (integer),
// patron_id (integer),
// loaned_on (date),
// return_by (date) and
// returned_on (date).

const Loan = sequelize.define('loan', {
  id: {
    type: Sequelize.INTEGER
  },
  book_id: {
    type: Sequelize.INTEGER
  },
  patron_id: {
    type: Sequelize.INTEGER
  },
  loaned_on: {
    type: Sequelize.DATEONLY
  },
  return_by: {
    type: Sequelize.DATEONLY
  },
  returned_on: {
    type: Sequelize.DATEONLY
  }
});

// // force: true will drop the table if it already exists
// User.sync({force: true}).then(() => {
//   // Table created
//   return User.create({
//     firstName: 'John',
//     lastName: 'Hancock'
//   });
// });

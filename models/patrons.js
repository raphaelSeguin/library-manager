// The patrons table should have the following columns:
// id an integer,
// first_name (string),
// last_name (string),
// address (string),
// email (string),
// library_id (string) and
// zip_code ( integer).

const Patron = sequelize.define('patron', {
    id: {
        type: Sequelize.INTEGER
    },
    first_name: {
        type: Sequelize.STRING
    },
    last_name: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    library_id: {
        type: Sequelize.STRING
    },
    zip_code: {
        type: Sequelize.INTEGER
    },
});

// // force: true will drop the table if it already exists
// User.sync({force: true}).then(() => {
//     // Table created
//     return User.create({firstName: 'John', lastName: 'Hancock'});
// });

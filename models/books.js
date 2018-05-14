// The books table should have the following columns:
//id an integer,
//title a string,
//author a string,
//genre a string and
//first_published an integer.
'use strict';

const Book = ()
sequelize.define('book', {
    id: {
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING
    },
    author: {
        type: Sequelize.STRING
    },
    genre: {
        type: Sequelize.STRING
    },
    first_published: {
        type: Sequelize.INTEGER
    }
});

export default Book;

//
// // force: true will drop the table if it already exists
// User.sync({force: true})
//     .then(() => {
//         // Table created
//         return User.create({
//             firstName: 'John',
//             lastName: 'Hancock'
//         });
//     });

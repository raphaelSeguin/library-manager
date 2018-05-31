'use strict';

// modules
const express    = require('express');
const bodyParser = require('body-parser');
const moment     = require('moment');
const Op         = require('Sequelize').Op;

// models
const Book       = require('../models').Book;
const Loan       = require('../models').Loan;
const Patron     = require('../models').Patron;

// router
const router     = express.Router();

// utilities 
const getDataValues = data => data.map( o => o.dataValues);

// dev utils
const monitor = label => val => {console.log(label + ': ', val); return val}

// querys
const queryBookTitle = book_id => Book.findById(book_id).then( book => book.title);
const queryPatronFullName = patron_id => Patron.findById(patron_id).then( patron => `${patron.first_name} ${patron.last_name}`);
const queryAllLoans = whereClause => {
    const allLoans = {};
    return Loan.findAll(whereClause)
        .then( getDataValues )
        .then( loans => { 
            allLoans.loans = loans; 
            return Promise.all(loans.map( 
                loan => 
                    Promise.all([
                        queryBookTitle(loan.book_id),
                        queryPatronFullName(loan.patron_id)
                    ])
                )
            )
        })
        .then( data =>
            data.forEach( (arr, i) => {
                allLoans.loans[i].book_title = arr[0];
                allLoans.loans[i].patron_fullname = arr[1];
            })
        )
        .then( () => allLoans )
}

// errorMessages
const cantBeEmpty = name => val => val === '' ? name + ' is required' : 'invalid input for ' + name;
const errorMessages = {
    title: cantBeEmpty('title'),
    author: cantBeEmpty('author'),
    genre: cantBeEmpty('genre'),
    first_name: cantBeEmpty('first name'),
    last_name: cantBeEmpty('last name'),
    address: cantBeEmpty('address'),
    email: cantBeEmpty('email'),
    library_id: cantBeEmpty('library id'),
    zip_code: cantBeEmpty('zip code'),
    loaned_on: cantBeEmpty('loan date'),
    return_by: cantBeEmpty('return date')
}

// body-parser
router.use( bodyParser.urlencoded({ extended: true }) );

// ---------------------------------------------------------------------------- HOME
router.get('/', (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    res.render('home.pug');
});

// ---------------------------------------------------------------------------- ALL

router.get('/all_books', (req, res) => {
    Book.findAll()
        .then( getDataValues )
        .then( books => res.render('all_books.pug', { books }) )
});

router.get('/all_patrons', (req, res) => {
    Patron.findAll()
        .then( getDataValues )
        .then( patrons => res.render('all_patrons.pug', { patrons } ) )
});

router.get('/all_loans', (req, res) => {
        queryAllLoans()
        .then( monitor('allLoans') )
        .then( allLoans => res.render('all_loans.pug', allLoans ) )
});

// ---------------------------------------------------------------------------- ALL END

// ---------------------------------------------------------------------------- DETAIL

router.get('/book_detail', (req, res) => {

    let bookDetails = {};
    Promise.all([
        Book.findById( req.query.id )
            .then( book => book.dataValues ),
        Loan.findAll({
             where: { book_id: req.query.id } 
        })
            .then( getDataValues )
    ])
    .then( infos => {
        bookDetails = infos[0];
        bookDetails.loans = infos[1];
        return Promise.all( infos[1].map( loan => queryPatronFullName( loan.patron_id ) ) )
    })
    .then( patrons => 
        bookDetails.loans.forEach( (loan, i) => {
            bookDetails.loans[i].patron_fullname = patrons[i];
            bookDetails.loans[i].book_title = bookDetails.title;
        })
    )
    .then( () => res.render('book_detail.pug', bookDetails ) );
});

router.get('/patron_detail', (req, res) => {

    let patronDetails = {};
    Promise.all([
        Patron.findById( req.query.id )
            .then( patron => patron.dataValues ),
        Loan.findAll({
             where: { patron_id: req.query.id } 
        })
            .then( getDataValues )
    ])
    .then( infos => {
        patronDetails = infos[0];
        patronDetails.loans = infos[1];
        return Promise.all( infos[1].map( loan => queryBookTitle( loan.book_id ) ) )
    })
    .then( books => 
        patronDetails.loans.forEach( (loan, i) => {
            patronDetails.loans[i].book_title = books[i];
            patronDetails.loans[i].patron_fullname = patronDetails.first_name + ' ' + patronDetails.last_name;
        })
    )
    .then( () => res.render('patron_detail.pug', patronDetails ) );
});

// ---------------------------------------------------------------------------- FILTERS

router.get('/overdue_books', (req, res) => {
    Loan.findAll({
        where: {
            [Op.and]: [
                {
                    return_by: {
                        [Op.lt]: new Date()
                    }
                },{
                    returned_on: {
                        [Op.is]: null
                    }
                }
            ]
        }
    })
        .then( getDataValues )
        .then( loans =>  
            Promise.all(
                loans.map( loan => 
                    Book.findById(loan.book_id)
                )
            )
        )
        .then( books => res.render('overdue_books.pug', { books }) )
});

router.get('/checked_books', (req, res) => {
    Loan.findAll({
        where: {
            returned_on: {
                [Op.is]: null
            }
        }
    })
        .then( getDataValues )
        .then( loans =>  
            Promise.all(
                loans.map( loan => 
                    Book.findById(loan.book_id)
                )
            )
        )
        .then( books => res.render('checked_books.pug', { books }) )
});

router.get('/overdue_loans', (req, res) => {
    queryAllLoans({
        where: {
            [Op.and]: [
                {
                    return_by: {
                        [Op.lt]: new Date()
                    }
                },{
                    returned_on: {
                        [Op.is]: null
                    }
                }
            ]
        }
    })
    .then( allLoans => res.render('overdue_loans.pug', allLoans ) )
});

router.get('/checked_loans', (req, res) => {
    queryAllLoans({
        where: {
            returned_on: {
                [Op.is]: null
            }
        }
    })
    .then( allLoans => res.render('checked_loans.pug', allLoans ) )
});

// ---------------------------------------------------------------------------- GET NEW

router.get('/new_book', (req, res) => {
    res.render('new_book.pug');
});

router.get('/new_patron', (req, res) => {
    res.render('new_patron.pug');
});

router.get('/new_loan', (req, res) => {
    Promise.all([
        Book.findAll().then( getDataValues ),
        Patron.findAll().then( getDataValues )
    ])
    .then( array => {
        return {
            books: array[0],
            patrons: array[1],
            loan: {
                loaned_on: moment().format('YYYY-MM-DD'),
                return_by: moment().add(7, 'days').format('YYYY-MM-DD')
            }
        }
    })
    .then( inf => res.render('new_loan.pug', inf) )
});

// ---------------------------------------------------------------------------- POST NEW

router.post('/new_book', (req, res, next) => {
    console.log(req.body)
    Book.create(req.body)
        .then( 
            () => res.redirect('/all_books'),
            err => {
                // for every error path, make a property containing the appropriate error message
                const errors = err.errors.reduce( (obj, error) => {
                    obj['error_' + error.path] = errorMessages[error.path](error.value);
                    return obj;
                }, {});
                // keep the fields from req.body which didn't cause an error
                for (let prop in req.body) {
                    if( !errors[prop]) {
                        errors[prop] = req.body[prop];
                    }
                }
                res.render('new_book.pug', errors );
            });
});

router.post('/new_loan', (req, res) => {
    Loan.create(req.body)
        .then( 
            () => res.redirect('/all_loans'),
            err => {
                // for every error path, make a property containing the appropriate error message
                const errors = err.errors.reduce( (obj, error) => {
                    obj['error_' + error.path] = errorMessages[error.path](error.value);
                    return obj;
                }, {});
                // keep the fields from req.body which didn't cause an error
                for (let prop in req.body) {
                    if( !errors[prop]) {
                        errors[prop] = req.body[prop];
                    }
                }
                Promise.all([
                    Book.findAll().then( getDataValues ),
                    Patron.findAll().then( getDataValues )
                ])
                .then( array => {
                    return {
                        books: array[0],
                        patrons: array[1],
                        loan: {
                            loaned_on: moment().format('YYYY-MM-DD'),
                            return_by: moment().add(7, 'days').format('YYYY-MM-DD')
                        }
                    }
                })
                .then( inf => res.render('new_loan.pug', {...errors, ...inf}) )
            }
        )
});

router.post('/new_patron', (req, res) => {
    Patron.create(req.body)
        .then( 
            () => res.redirect('/all_patrons'),
            err => {
                console.log(err);
                // for every error path, make a property containing the appropriate error message
                const errors = err.errors.reduce( (obj, error) => {
                    obj['error_' + error.path] = errorMessages[error.path](error.value);
                    return obj;
                }, {});
                // keep the fields from req.body which didn't cause an error
                for (let prop in req.body) {
                    if( !errors[prop]) {
                        errors[prop] = req.body[prop];
                    }
                }
                res.render('new_patron.pug', errors );
            }
        )
});

// ---------------------------------------------------------------------------- Return Book

router.get('/return_book', (req,res) => {
    console.log('return book n°' + req.query.id);
    Loan.findById(req.query.id)
        .then( loan => loan.dataValues )
        .then( loan => {
            return Promise.all([
                Promise.resolve(loan),
                queryBookTitle(loan.book_id),
                queryPatronFullName(loan.patron_id),
            ]);
        })
        .then( data => 
            Object.assign({
                ...data[0],
                book_title: data[1],
                patron_fullname: data[2],
                returned_on: moment().format('YYYY-MM-DD')
            })
        )
        .then( loan => res.render('return_book.pug', loan) )
});

router.post('/return_book', (req, res) => {
    console.log(req.body);
    Loan.findById(req.query.id)
        .then( loan =>
            loan.update({
                returned_on: moment().format('YYYY-MM-DD')
            })
        )
        .then( () => res.redirect('/all_loans') );
})

// ---------------------------------------------------------------------------- UPDATE

router.post('/book_detail', (req, res) => {
    Book.findById(req.query.id)
        .then( book => book.update(req.body) )
        .then( 
            () => res.redirect('all_books'),
            err => {
                console.log(err);
                // for every error path, make a property containing the appropriate error message
                const errors = err.errors.reduce( (obj, error) => {
                    obj['error_' + error.path] = errorMessages[error.path](error.value);
                    return obj;
                }, {});
                // keep the fields from req.body which didn't cause an error
                for (let prop in req.body) {
                    if( !errors[prop]) {
                        errors[prop] = req.body[prop];
                    }
                }
                queryAllLoans({
                    where: {
                        book_id: req.query.id
                    }
                }) 
                    .then( allLoans =>
                        res.render('book_detail.pug', {
                            ...errors, 
                            ...allLoans
                        })
                    )
            }
        )
})

router.post('/patron_detail', (req, res) => {
    console.log('patron update');
    Patron.findById(req.query.id)
        .then( patron => patron.update(req.body) )
        .then( 
            () => res.redirect('all_patrons'),
            err => {
                console.log(err);
                // for every error path, make a property containing the appropriate error message
                const errors = err.errors.reduce( (obj, error) => {
                    obj['error_' + error.path] = errorMessages[error.path](error.value);
                    return obj;
                }, {});
                // keep the fields from req.body which didn't cause an error
                for (let prop in req.body) {
                    if( !errors[prop]) {
                        errors[prop] = req.body[prop];
                    }
                }
                queryAllLoans({
                    where: {
                        patron_id: req.query.id
                    }
                }) 
                    .then( allLoans =>
                        res.render('patron_detail.pug', {
                            ...errors, 
                            ...allLoans
                        })
                    )
            });
})

// ---------------------------------------------------------------------------- ERRORS
router.use( (err, req, res, next) => {
    // ??????
    if (err.bug) {
        res.send('bad bad');
    } else {
        console.log('\n\nerror' + err + '\n\n');
        //res.render('error.pug', {title: 'Error', error: err.message});
        res.redirect('/home');
    }
});

module.exports = router;

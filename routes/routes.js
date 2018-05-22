'use strict';

// modules
const express    = require('express');
const bodyParser = require('body-parser');

// models
const Book       = require('../models').Book;
const Loan       = require('../models').Loan;
const Patron     = require('../models').Patron;

// router
const router     = express.Router();

// utilities 
const getDataValues = data => data.map( o => o.dataValues);
const monitor = label => val => {console.log(label + ': ', val); return val}

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

    const queryBookTitle = book_id => {
        return Book.findById(book_id)
            .then( book => book.title)
    }

    const queryPatronFullName = patron_id => {
        return Patron.findById(patron_id)
            .then( patron => `${patron.first_name} ${patron.last_name}`)
    }

    const loansInfos = Loan.findAll()
        // then map this array to an array of promises
        .then( getDataValues )
        .then( loans => 
            Promise.all(
                loans.map( loan =>
                    Promise.all([
                        queryBookTitle(loan.book_id),
                        Promise.resolve(loan.book_id),
                        queryPatronFullName(loan.patron_id),
                        Promise.resolve(loan.patron_id),
                        Promise.resolve(loan.loaned_on),
                        Promise.resolve(loan.return_by),
                        Promise.resolve(loan.returned_on),
                        Promise.resolve(loan.id)
                    ])
                )
            )
        )
        .then( data => 
            data.map( array => {
                return {
                    book_title: array[0],
                    book_id: array[1],
                    patron_name: array[2],
                    patron_id: array[3],
                    loaned_on: array[4],
                    return_by: array[5],
                    returned_on: array[6],
                    loan_id: array[7]
                }
            })
        )
        .then( loans => res.render('all_loans.pug', { loans })  )
});

// ---------------------------------------------------------------------------- ALL END

// ---------------------------------------------------------------------------- DETAIL

router.get('/book_detail', (req, res) => {
    Promise.all([
        Book.findById( req.query.id )
            .then( book => book.dataValues ),
        Loan.findAll({
             where: { book_id: req.query.id } 
        })
            .then( getDataValues )
    ])
    .then( monitor('bookdetail') )
    .then( infos => 
        res.render('book_detail.pug', {
            book: infos[0],
            loans: infos[1]
        })
    )
});

router.get('/patron_detail', (req, res) => {
    Promise.all([
        Patron.findById(req.query.id)
            .then( patron => patron.dataValues ),
        Loan.findAll({
            where: { patron_id: req.query.id } 
        })
           .then( getDataValues )
    ])
        .then( infos => 
            res.render('patron_detail.pug', {
                patron: infos[0],
                loans: infos[1]
            }))
});

router.get('/loan_detail', (req, res) => {
    res.render('loan_detail.pug', {})
});

// ---------------------------------------------------------------------------- FILTER

router.get('/overdue_books', (req, res) => {
    res.render('overdue_books.pug');
});

router.get('/checked_books', (req, res) => {
    res.render('checked_books.pug');
});

router.get('/overdue_loans', (req, res) => {
    res.render('overdue_loans.pug');
});

router.get('/checked_loans', (req, res) => {
    res.render('checked_loans.pug');
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
            patrons: array[1]
        }
    })
    .then( inf => res.render('new_loan.pug', inf) )
});

// ---------------------------------------------------------------------------- POST NEW

router.post('/new_book', (req, res) => {
    Book.create(req.body)
        .then( () => res.redirect('/all_books'))
        .catch(err => console.log(err) )
});

router.post('/new_loan', (req, res) => {
    Loan.create(req.body)
        .then( () => res.redirect('/all_loans'))
        .catch( err => console.log(err) )
});

router.post('/new_patron', (req, res) => {
    Patron.create(req.body)
        .then( () => res.redirect('/all_patrons'))
        .catch( err => console.log(err) )
});

// ---------------------------------------------------------------------------- Return Book

router.get('/return_book', (req, res) => {
    Loan.findById(res.query.id)
        update({
            returned_on // add moment something . . .. 
        })
})

// ---------------------------------------------------------------------------- ERRORS
router.use( (err, req, res, next) => {
    // ??????
    if (err.bug) {
        res.send('bad bad');
    } else {
        res.render('error.pug', {title: 'Error', error: err.message});
    }
});

module.exports = router;

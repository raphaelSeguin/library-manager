'use strict';

// modules
const express    = require('express');
const bodyParser = require('body-parser');
const moment     = require('moment');

// models
const Book       = require('../models').Book;
const Loan       = require('../models').Loan;
const Patron     = require('../models').Patron;

// router
const router     = express.Router();

// utilities 
const getDataValues = data => data.map( o => o.dataValues);
const getDate = () => moment().format('YYYY-MM-DD');
const queryBookTitle = book_id => Book.findById(book_id).then( book => book.title);
const queryPatronFullName = patron_id => Patron.findById(patron_id).then( patron => `${patron.first_name} ${patron.last_name}`);
const monitor = label => val => {console.log(label + ': ', val); return val}

const getAllLoans = whereClause => {
    const allLoans = {};
    return Loan.findAll()
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
        getAllLoans()
        .then( allLoans => res.render('all_loans.pug', allLoans ) )
});

// ---------------------------------------------------------------------------- ALL END

// ---------------------------------------------------------------------------- DETAIL

router.get('/book_detail', (req, res) => {

    const bookDetails = {};
    Promise.all([
        Book.findById( req.query.id )
            .then( book => book.dataValues ),
        Loan.findAll({
             where: { book_id: req.query.id } 
        })
            .then( getDataValues )
    ])
    .then( infos => {
        bookDetails.book = infos[0];
        bookDetails.loans = infos[1];
        return Promise.all( infos[1].map( loan => queryPatronFullName( loan.patron_id ) ) )
    })
    .then( patrons => 
        bookDetails.loans.forEach( (loan, i) => {
            bookDetails.loans[i].patron_fullname = patrons[i];
            bookDetails.loans[i].book_title = bookDetails.book.title;
        })
    )
    .then( () => res.render('book_detail.pug', bookDetails ) );
});

router.get('/patron_detail', (req, res) => {

    const patronDetails = {};
    Promise.all([
        Patron.findById( req.query.id )
            .then( patron => patron.dataValues ),
        Loan.findAll({
             where: { patron_id: req.query.id } 
        })
            .then( getDataValues )
    ])
    .then( infos => {
        patronDetails.patron = infos[0];
        patronDetails.loans = infos[1];
        return Promise.all( infos[1].map( loan => queryBookTitle( loan.book_id ) ) )
    })
    .then( books => 
        patronDetails.loans.forEach( (loan, i) => {
            patronDetails.loans[i].book_title = books[i];
            patronDetails.loans[i].patron_fullname = patronDetails.patron.first_name + ' ' + patronDetails.patron.last_name;
        })
    )
    .then( () => res.render('patron_detail.pug', patronDetails ) );
});

// ---------------------------------------------------------------------------- FILTER

router.get('/overdue_books', (req, res) => {
    Book.findAll({
        where: {
            // return_by: {

            // }
        }
    })
        .then( getDataValues )
        .then( books => res.render('overdue_books.pug', { books }) )
});

router.get('/checked_books', (req, res) => {
    Book.findAll({
        where: {
            // returned_on: {
                
            // }
        }
    })
        .then( getDataValues )
        .then( books => res.render('checked_books.pug', { books }) )
});

router.get('/overdue_loans', (req, res) => {
    getAllLoans({
        where: {

        }
    })
    .then( allLoans => res.render('overdue_loans.pug', allLoans ) )
});

router.get('/checked_loans', (req, res) => {
    getAllLoans({
        where: {

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
            returned_on: getDate()
        })
        .then( res => res.redirect('/all_books.pug') );
})

// ---------------------------------------------------------------------------- UPDATE

router.post('/book_detail', (req, res) => {
    console.log('UPDATE BOOK');
    res.redirect('all_books');
})

router.post('/patron_detail', (req, res) => {
    console.log('UPDATE PATRON');
    res.redirect('all_patrons');
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

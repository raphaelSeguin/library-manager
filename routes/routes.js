const express = require('express');
const router = express.Router();


// root
router.get('/', (req, res) => {
    res.redirect('/home');
});
// home
router.get('/home', (req, res) => {
    res.render('main.pug', { title: 'Home Page'});
});
// -------------------------------------- all
router.get('/all_books', (req, res) => {
    res.render('all_books.pug', { title: 'All Books'});
});
router.get('/all_patrons', (req, res) => {
    res.render('all_patrons.pug', { title: 'Patrons'});
});
router.get('/all_loans', (req, res) => {
    res.render('all_loans.pug', { title: 'Loans'});
});
// -------------------------------------- new
router.get('/new_book', (req, res) => {
    res.render('new_book.pug', { title: 'New Book'});
});
router.get('/new_patron', (req, res) => {
    res.render('new_patron.pug', { title: 'New Patron'});
});
router.get('/new_loan', (req, res) => {
    res.render('new_loan.pug', { title: 'New Loan'});
});

module.exports = router;

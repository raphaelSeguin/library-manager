'use strict';

// libs
const express     = require('express');
const pug         = require('pug');
const Sequelize   = require('sequelize');
// models
const db          = require('./models');
const Book        = require('./models').Book;
const Loan        = require('./models').Loan;
const Patron      = require('./models').Patron;

// test db
const testdb      = require('./testdb.js');

// routes
const routes      = require('./routes/routes.js');
// express app
const app  = express();

// use pug with views folder
app.set('view engine', 'pug');
app.set('views', './views');
// serve static files from public folder
app.use(express.static(__dirname + '/public'));
// use routes for routing
app.use(routes);

// 
db.sequelize.sync()
    .then( () => console.log('\n\nDB LOADED\n\n') )
    .then( () => 
        app.listen(3000,
            () => console.log('listening to port 3000')
        )
    )
    .catch( err => console.log(err) )

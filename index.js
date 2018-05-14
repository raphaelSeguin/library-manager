const express = require('express');
const pug = require('pug');
const routes = require('./routes/routes.js');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static(__dirname + '/public'));

app.use(routes);

app.listen(3000);

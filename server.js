const express = require('express');
const app = express();
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const createPath = require('./create-path');
const methodOverride = require('method-override');

app.listen(3000, (err) => {
    err ? console.log(err) : console.log('Server runned at 3000 PORT');
});

(async function runDB(){
    try{
        await mongoose.connect(process.env.MONGODB_CONNECT);
        console.log('Connected');
    }
    catch(err){
        console.log(err);
    }
})();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(routes);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use((req, res, next) => {
    res.status(400)
        .render(createPath('error', 'views'), {title: "Page not found"})
    next();
})
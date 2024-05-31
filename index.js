const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
const port = 3000;


app.use(express.static('static'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'very_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Note: the `secure` option should be `true` if you're using HTTPS
}));

function checkAuth(req) {
    if (req.session.authenticated) {
        return true;
    } else {
        return false;
    }
}

function checkCredits(req) {
    if (req.session.credits) {
        return req.session.credits;
    } else {
        return null;
    }
}

app.get('/', (req, res) => {
    res.render("index.ejs", {
            titles: ["Pink BD cake", "Nyam-Nyam", "Choclate-Regret", "The Bride cake", "Classic Cream cake"], 
            pictures:["birth_cake1.jpg","birth_cake2.jpg", "birth_cake3.jpg", "birth_cake4.jpg", "birth_cake5.jpg"],
            prices: ["20", "25", "30", "35", "40"],
            authenticated: checkAuth(req),
            credits: checkCredits(req),
            flag2: req.session.flag2,
        });
});

app.get('/logout', (req, res) => {
    req.session.authenticated = false;
    req.session.credits = null;
    res.redirect('/');
});


app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.redirect('/');
    }
    else{
        res.render("login.ejs");
    }
});


const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});



app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Connect to the SQLite database
    const db = new sqlite3.Database('database.db');

    // Query the database for the username and password
    const query = `SELECT * FROM users WHERE username = '`+username+ `'AND password = '`+password + `'`;
    db.get(query, [], (err, row) => {
        if (err) {
            console.error(err);
            res.redirect('/login');
        } else if (row) {
            req.session.authenticated = true;
            req.session.credits = 1;
            res.cookie('status', Buffer.from("idiot").toString('base64'));
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });

    // Close the database connection
    db.close();
});

app.get('/manage', (req, res) => {
    if(req.cookies.status == Buffer.from("admin").toString('base64') && req.session.authenticated){
        res.render("manage.ejs", {admin:true});
    }
    else{
        res.render("manage.ejs", {admin:false});
    }
});

app.post('/buy', (req, res) => {
    if(req.body.cake_number==4){
        req.session.credits -= req.body.price;
        console.log(req.session.credits);
        if(req.session.credits>100)
            req.session.flag2 = "AlICFei7gBjyIAh2wRk+Ch1HDmnTt3i9SAaa7/SzITJur8sxwOYdY6/94GnajYRTAFrb7k+CmJZ+leo2+c7mAbeq4odW2Usw6yjz2XPfmFmlR+YL31/E9YzKa8IQaldI1YLSKn5qfAMGkld3+/EvaVI3Vz8XzzEtYzx1lTUIwUj2a8p1SPTcHDUMwKpgMyImLe4J5QOeBylm7IwdQThZ+zPc7rzyNlmc+VqjBsQiZors6QzXbzQ4YngEEAY1Romq2immtr/GFtOwCq/UMHgQKcVbGU/A1PHwgzjAOEdzF5j97k4a6igXyMiAyxLg3MjEColYodAKz7s3ejPj4/C1eUuZNxrKdtz5pdGizP5L4tWT2Lam9+g9I6VwvCLjfonuCc8Qs+HXfv+d70xeXFT1UkP1nKK4jQNnlhTrNiHpeSLaZLsCNnH1ismcVmGSHRE5pi9/jgh7cEwxiKLh2L+b7Cy8ltb8MPi2rt+U8TLQ1nTwsI3Tn3lr0vwmctpkjnzXvA==";
    }
    else{
        res.redirect("https://youareanidiot.cc/");
    }
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
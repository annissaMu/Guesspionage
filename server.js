// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
// every time you change something in server.js and save, your deployment will automatically reload

// to exit, type 'ctrl + c', then press the enter key in a terminal window
// if you're prompted with 'terminate batch job (y/n)?', type 'y', then press the enter key in the same terminal

// standard modules, loaded from node_modules
const path = require('path');
require("dotenv").config({ path: path.join(process.env.HOME, '.cs304env')});
const express = require('express');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const multer = require('multer');

// our modules loaded from cwd

const { Connection } = require('./connection');
const cs304 = require('./cs304');
const { question } = require('readline-sync');

// Create and configure the app

const app = express();

// Morgan reports the final status code of a request's response
app.use(morgan('tiny'));

app.use(cs304.logStartRequest);

// This handles POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cs304.logRequestData);  // tell the user about any request data
app.use(flash());


app.use(serveStatic('public'));
app.set('view engine', 'ejs');

const mongoUri = cs304.getMongoUri();

app.use(cookieSession({
    name: 'session',
    keys: ['horsebattery'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ================================================================
// custom routes here

const DB = process.env.USER;
const GUESSPIONAGE = 'guesspionage';
const QUESTIONS = 'questions';
const USERS = 'users';
const LOGINS = 'loginCredentials';
bcrypt = require ("bcrypt");
const ROUNDS = 15;

// HOMEPAGE HERE
app.get('/', (req, res) => {
    let uid = req.session.uid || 'unknown';
    let visits = req.session.visits || 0;
    visits++;
    req.session.visits = visits;
    console.log('uid', uid);
    return res.render('home.ejs', {uid, visits});
});

app.get('/', (req, res) => {
    return res.redirect('/base');
})

//why do some have a double escape?
app.get('/base', async (req, res) => {
    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    //we will add a filter on how many submissions each question has
    const questions = await db.collection(QUESTIONS).find().toArray();
    return res.render('baseQs.ejs', {questions});
})

app.post('/game/', async (req, res) => {
  const db = await Connection.open(mongoUri, GUESSPIONAGE);
  const questionsList = await db.collection(QUESTIONS).find().toArray();
  return res.render('game.ejs', {questionsList});
})

/*app.get('/game/', async (req, res) => {
    let answer1 = req.query.answer1;
    let answer2 = req.query.answer2;
    let answer3 = req.query.answer3;
    let answer4 = req.query.answer4;
    let answer5 = req.query.answer5;
    console.log(answer1);
    const db = await Connection.open(mongoUri, 'guesspionage');
    let questions = await db.collection('questions').find().toArray();
    let questionsList = [];
    let questionsCounter = 0;
    let indexList = [];
    while (questionsCounter < 5) {
        // keep track of unique indexes
        while (indexList.length == questionsCounter){
            let index = Math.floor(Math.random() * questions.length);
            if (!indexList.includes(index)){
                indexList.push(index);
            }
        }
    
        // push ready for use questions into questions list
        if (questions[indexList[questionsCounter]].readyForUse == true) {
            questionsList.push(questions[indexList[questionsCounter]]);
            questionsCounter++;
        } else {
            indexList.pop();
        }
    }
    // if there's no submission render game, else render the game results
    if (!answer1) {
        return res.render('game.ejs', {questionsList});  
    } else {
        // do score calculation here!
        return res.render('results.ejs', {questionsList, answer1, answer2, answer3, answer4, answer5})
    }
});

/*app.post('/results/', async (req, res) => {
    // update leaderboard, display spot on leaderboard (ignoring users)
})
    return res.render('index.ejs', {uid, visits});
});*/

// shows how logins might work by setting a value in the session
// This is a conventional, non-Ajax, login, so it redirects to main page 
/*app.post('/set-uid/', (req, res) => {
    console.log('in set-uid');
    req.session.uid = req.body.uid;
    req.session.logged_in = true;
    res.redirect('/');
});

// shows how logins might work via Ajax
app.post('/set-uid-ajax/', (req, res) => {
    console.log(Object.keys(req.body));
    console.log(req.body);
    let uid = req.body.uid;
    if(!uid) {
        res.send({error: 'no uid'}, 400);
        return;
    }
    req.session.uid = req.body.uid;
    req.session.logged_in = true;
    console.log('logged in via ajax as ', req.body.uid);
    res.send({error: false});
});

// conventional non-Ajax logout, so redirects
app.post('/logout/', (req, res) => {
    console.log('in logout');
    req.session.uid = false;
    req.session.logged_in = false;
    res.redirect('/');
});*/

// two kinds of forms (GET and POST), both of which are pre-filled with data
// from previous request, including a SELECT menu. Everything but radio buttons

app.get('/form/', (req, res) => {
    console.log('get form');
    return res.render('form.ejs', {action: '/form/', data: req.query });
});

app.post('/form/', (req, res) => {
    console.log('post form');
    return res.render('form.ejs', {action: '/form/', data: req.body });
});

app.get('/staffList/', async (req, res) => {
    const db = await Connection.open(mongoUri, WMDB);
    let all = await db.collection(STAFF).find({}).sort({name: 1}).toArray();
    console.log('len', all.length, 'first', all[0]);
    return res.render('list.ejs', {listDescription: 'all staff', list: all});
});

// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});

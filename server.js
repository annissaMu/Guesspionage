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
    return res.render('home.ejs', {loggedInUser: null});
});

// register page
app.get('/register/', (req, res) => {
    return res.render('login.ejs');
});

app.post("/register", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const db = await Connection.open(mongoUri, GUESSPIONAGE);
      const existingUser = await db.collection(LOGINS).findOne({username: username});
      if (existingUser) {
        req.flash('error', "Login already exists - please try logging in instead.");
        return res.redirect('/register/')
      }
      const hash = await bcrypt.hash(password, ROUNDS);
      await db.collection(USERS).insertOne({
          username: username,
          hash: hash
      });
      console.log('successfully joined', username, password, hash);
      req.flash('info', 'successfully joined and logged in as ' + username);
      req.session.username = username;
      req.session.logged_in = true;
      return res.redirect('/register/')
    } catch (error) {
      req.flash('error', `Form submission error: ${error}`);
      return res.redirect('/register/')
    }
  });

  app.post("/", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const db = await Connection.open(mongoUri, GUESSPIONAGE);
      const existingUser = await db.collection(USERS).findOne({username: username});
      console.log('user', existingUser);
      if (!existingUser) {
        req.flash('error', "Username does not exist - try again.");
       return res.redirect('/register/')
      }
      const match = await bcrypt.compare(password, existingUser.hash); 
      console.log('match', match);
      if (!match) {
          req.flash('error', "Username or password incorrect - try again.");
          return res.redirect('/register/')
      }
      req.flash('info', 'successfully logged in as ' + username);
      req.session.username = username;
      req.session.logged_in = true;
      console.log('login as', username);
      return res.render('home.ejs', {loggedInUser: username});
    } catch (error) {
      req.flash('error', `Form submission error: ${error}`);
      return res.redirect('/register/')
    }
  });
  
  

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

//why do some have a double escape?
app.get('/baseQs/', async (req, res) => {
    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    //we will add a filter on how many submissions each question has
    const questionsList = await db.collection(QUESTIONS).find().toArray();
    let questions = [];
    let i = 0;
    while (questions.length!=5 && i<questionsList.length) {
        if (questionsList[i].readyForUse == false) {
            questions.push(questionsList[i]);
        }
        i++;
    }
    return res.render('baseQs.ejs', {questions});
})

// add insert questions page here - dechen

app.post('/baseQs/', async (req, res) => {
  let id0 = req.body.id0;
  let id1 = req.body.id1;
  let id2 = req.body.id2;
  let id3 = req.body.id3;
  let id4 = req.body.id4;
  console.log(id4);
  let idList = [id0, id1, id2, id3, id4];
  let answer0 = req.body.yesAndNo0;
  let answer1 = req.body.yesAndNo1;
  let answer2 = req.body.yesAndNo2;
  let answer3 = req.body.yesAndNo3;
  let answer4 = req.body.yesAndNo4;
  let answerList = [answer0, answer1, answer2, answer3, answer4];
  console.log(id1);
  console.log(answer1);
  const db = await Connection.open(mongoUri, GUESSPIONAGE);
  // update yes no counters here
  let question;
  let yes;
  let no;
  let newPercent;
  answerList.forEach(async (answer, index) => {
    if (idList[index]) {
        if (answer == "Yes") {
            db.collection(QUESTIONS).updateOne({id: parseInt(idList[index])}, {$inc: {yes: 1}})
        }
        else if (answer == "No"){
            db.collection(QUESTIONS).updateOne({id: parseInt(idList[index])}, {$inc: {no: 1}})
        } 
        // update percentage here
        question = await db.collection(QUESTIONS).find({id: parseInt(idList[index])}, {yes: 1, no: 1}).toArray();
        yes = question[0].yes;
        console.log("at second", yes);
        no = question[0].no;
        newPercent = Math.floor(yes/(yes+no) * 100);
        console.log(newPercent);
        db.collection(QUESTIONS).updateOne({id: parseInt(idList[index])}, {$set:{percent: newPercent}});
        // update submission count and ready for Use - annissa
    }
  })
  console.log('posted');
  res.redirect('/game/');
})

app.get('/game/', async (req, res) => {
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
    // update usersplayed -- annissa

    // if there's no submission render game, else render the game results
        console.log(questionsList);
        return res.render('game.ejs', {questionsList});  
});

app.post('/results/', async (req, res) => {
    // let { answer0, answer1, answer2, answer3, answer4 } = req.body;
    let answer0 = req.query.answer0;
    let answer1 = req.query.answer1;
    let answer2 = req.query.answer2;
    let answer3 = req.query.answer3;
    let answer4 = req.query.answer4;
    let answers = [answer0, answer1, answer2, answer3, answer4];

    // get same questions list somehow here - annissa

    // calculate score
    let score = 500;
    let difference;
    questionsList.forEach((question, index) => {
        difference = Math.abs(question.percentage - answers[index]);
        score -= difference;
    })
    score = Math.floor((score/500) * 100);
    console.log(questionsList);

    // update leaderboard, update high score for user - dechen


    // Render the results page with questions and answers
    return res.render('results.ejs', { questionsList, answer0, answer1, answer2, answer3, answer4 });
});


/*app.post('/results/', async (req, res) => {
    // update leaderboard, display spot on leaderboard (ignoring users)
})
    return res.render('index.ejs', {uid, visits});
});*/




// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});

// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
/* every time you change something in server.js and save, 
your deployment will automatically reload */

// to exit, type 'ctrl + c', then press the enter key in a terminal window
/* if you're prompted with 'terminate batch job (y/n)?', 
type 'y', then press the enter key in the same terminal */

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
//const LOGINS = 'loginCredentials';
bcrypt = require ("bcrypt");
const ROUNDS = 15;

// HOMEPAGE HERE
//lands the user to the home page
app.get('/', (req, res) => {
    return res.render('home.ejs', {loggedInUser: null});
});

// register page
app.get('/register/', (req, res) => {
    return res.render('login.ejs');
});


function requiresLogin(req, res, next) {
    if (!req.session.loggedIn) {
      req.flash('error', 'This page requires you to be logged in - please do so.');
      return res.redirect("/");
    } else {
        next();
    }
  }

/* Retrieves the values input by a user when they create a new account
and checks against the database, adding them if no such username exists.
If successful, they are asked to log in to play the game */
app.post("/register/",async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const db = await Connection.open(mongoUri, GUESSPIONAGE);
      const existingUser = await db.collection(USERS).findOne({username: username});
      if (existingUser) {
        req.flash('error', "Login already exists - try logging in instead.");
        return res.render('login.ejs');
      }
      const hash = await bcrypt.hash(password, ROUNDS);
      await db.collection(USERS).insertOne({
          username: username,
          topscore: 0,
          hash: hash
      });
      console.log('successfully joined', username, password, hash);
      req.flash('info', 'Successfully registered!');
      req.session.username = username;
      req.session.logged_in = true;
      console.log('login as', username);
      return res.render('home.ejs', {loggedInUser: username});
    } catch (error) {
      req.flash('error', `Form submission error: ${error}`);
      return res.redirect('/register/')
    }
  });

/* Retrieves the values input by a user when they login to their account
and checks against the databse. If no such username exists, they are prompted 
to register.If successful, they redirected to the home page to play the game */
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
      req.flash('info', 'Successfully logged in as ' + username);
      req.session.username = username;
      req.session.logged_in = true;
      console.log('login as', username);
      return res.render('home.ejs', {loggedInUser: username});
    } catch (error) {
      req.flash('error', `Form submission error: ${error}`);
      return res.redirect('/register/')
    }
  });

  /* renders insert questions page */
app.get('/insert/', async(req, res) => {
    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    const questions = await db.collection(QUESTIONS).find({ question }).toArray();
    res.render('insertQs.ejs', { questions });
})

async function incrCounter(db, key) {
    // this will update the document and return the document after the update
    let result = await db.collection('counter').findOneAndUpdate({collection: key},
                                                 {$inc: {counter: 1}}, 
                                                 {returnDocument: "after"});
    return result.counter;
}

  /* updates database with inserted question */
app.post('/insert/', async (req, res) => {
    let { question, answer } = req.body;
    console.log(question);

    // check if the question already exists
    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    const existingQuestion = await db.collection(QUESTIONS).findOne({ question });
    console.log(existingQuestion);
    if (existingQuestion) {
        req.flash('error', 'Question already exists');
        return;
    }

    let readyForUse = answer !== "" ? true : false;
    console.log(readyForUse);
    // let getId = await db.collection(QUESTIONS).find({}, 
    //     {sort: {id: 1}}).toArray()
    let newId = await incrCounter(db, 'questions');
    const obj = {
            id: newId,
            question: question,
            percentage: parseInt(answer),
            submissions: 0,
            yes: 0,
            no: 0,
            userAnswered: [],
            usersPlayed: [],
            readyForUse: readyForUse,
    }
    console.log(obj);
    await db.collection(QUESTIONS).insertOne(obj);
    res.redirect('/')
  })

/* renders base questions page */
app.get('/baseQs/', async (req, res) => {
    console.log("opening database...");
    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    //getting the questions
    console.log("database opened...");
    const notReadyForUse = await db.collection(QUESTIONS).find({readyForUse: false})
    .toArray();
    
    const readyForUse = await db.collection(QUESTIONS).find({readyForUse: true})
    .toArray();

    let user = req.session.username;
    let questionsList = [];
    let i = 0;

    // select the questions
    console.log("selecting questions");
    let selected = notReadyForUse.length > 0 ? notReadyForUse : readyForUse;

    // filter questions that the user hasn't answered
    questionsList = userUnanswered(selected, user);

    // redirect to game page if there aren't any questions
    if (questionsList.length == 0 ){
        console.log("no questions");
        res.redirect('/game/');
    } else {
        console.log("some questions");
        // otherwise, render the questions
        return res.render('baseQs.ejs', {username: req.session.username, 
            questionsList});
    }   
}

)

/* helper to filter out questions the user has not answered */
// parameters: all questions, user logged in
function userUnanswered(questions, user) {
    return questions.filter(question => !question.userAnswered.includes(user));


}

/* updates database with new percentages and submissions count and use status */
app.post('/baseQs/', async (req, res) => {
    // Extract IDs and answers from the request body
    const idList = [];
    const answerList = [];
    for (let i = 0; i < 5; i++) {
        idList.push(req.body[`id${i}`]);
        answerList.push(req.body[`yesAndNo${i}`]);
    }
    let user = req.session.username;

    const db = await Connection.open(mongoUri, GUESSPIONAGE);
    try {
        // Update yes/no counters and percentages
        for (let i = 0; i < idList.length; i++) {
            const id = parseInt(idList[i]);
            const answer = answerList[i];

            if (id && (answer === "Yes" || answer === "No")) {
                await updatePercentage(db, id, answer, user);
            }
        }
    } catch (error) {
        console.error("Error updating questions:", error);
        return res.status(500).send("Internal Server Error");
    }
    res.redirect('/game/');
});

// Function to update yes/no counters and percentage
//parameters: database, question id, user answer
async function updatePercentage(db, id, answer, user) {
    console.log("incrementing", id);
    const updateField = answer === "Yes" ? "yes" : "no";
    await db.collection(QUESTIONS).updateOne({id}, {$inc: {[updateField]:1}});

    const question = await db.collection(QUESTIONS).findOne({ id }, 
        { yes: 1, no: 1, submissions: 1 });
    const yes = question.yes;
    const no = question.no;
    const newPercent = Math.floor(yes / (yes + no) * 100);

    await db.collection(QUESTIONS).updateOne({ id }, 
        { $set: { percent: newPercent }, 
        $push: {userAnswered: user}, $inc: {submissions: 1}});
    await updateReadyForUse(db, id);
}

/* updates ready for use state for question */
async function updateReadyForUse(db, id) {
    const question = await db.collection(QUESTIONS).findOne({ id }, 
        { submissions: 1 });
    if (question.submissions == 5) {
        await db.collection(QUESTIONS).updateOne({ id }, 
            { $set: { readyForUse: true }});
    }
}

/* renders game page with 5 random questions */
app.get('/game/', async (req, res) => {
    const db = await Connection.open(mongoUri, 'guesspionage');
    let questions = await db.collection(QUESTIONS).find().toArray();
    let questionsList = [];
    let questionsCounter = 0;
    let indexList = [];
    let user = req.session.username;
    
    //throw error if there is not enough questions available to user

    while (questionsCounter < 5) {
        // keep track of unique indexes
        while (indexList.length == questionsCounter){
            let index = Math.floor(Math.random() * questions.length);
            if (!indexList.includes(index)){
                indexList.push(index);
            }
        }

        // push ready for use questions into questions list
        if (questions[indexList[questionsCounter]].readyForUse == true 
            && !questions[indexList[questionsCounter]].usersPlayed
            .includes(user)) {
            questionsList.push(questions[indexList[questionsCounter]]);
            questionsCounter++;
        } else {
            indexList.pop();
        }
    }
    console.log("finishing game get");
    return res.render('game.ejs', {username: req.session.username, 
        questionsList});  
});

/* renders game results and leaderboard page and 
updates database with user's high score */
app.post('/results/', async (req, res) => {
    console.log("calculate results");
    let {answer0, answer1, answer2, answer3, answer4, 
        id0, id1, id2, id3, id4} = req.body;
    let answers = [answer0, answer1, answer2, answer3, answer4];
    let ids = [id0, id1, id2, id3, id4];
    let user = req.session.username;
    let questionsList = [];
    
    // get original questionsList again
    const db = await Connection.open(mongoUri, 'guesspionage');
    let questions = await db.collection(QUESTIONS).find().toArray();
    ids.forEach((id, index) => {
        let i=0;
        while(questionsList.length == index) {
            if (questions[i].id == id) {
                questionsList.push(questions[i]);
            }
            i++;
        }
        i++;
    })

    // update usersPlayed
    ids.forEach( async (id) => {
        await db.collection(QUESTIONS).updateOne({id: parseInt(id)}, 
        { $push: { usersPlayed: user }});
    })
   
    // calculate score
    let score = 500;
    let difference;
    await questionsList.forEach(async (question, index) => {
        difference = Math.abs(question.percentage - answers[index]);
        score -= difference;
    })
    score = Math.floor((score/500) * 100);

    // update leaderboard, update high score for user - dechen
    let userCollection = await db.collection('users');
    let currentUser = await userCollection.findOne({ username: user });

    if (!currentUser.topscore || score > currentUser.topscore) {
        await userCollection.updateOne({ username: user }, 
            { $set: { topscore: score }});
    }
    let leaderboardData = await userCollection.find()
                            .sort({ topscore: -1 })
                            .limit(5).toArray();
    
    // Render the results page with questions and answers
    return res.render('results.ejs', {username: req.session.username, 
        questionsList, answer0, 
        answer1, answer2, answer3, answer4, score, 
        leaderboard: leaderboardData });
});


  

  
  
/* logs out username */
app.get('/logout', (req,res) => {
    if (req.session.username) {
      req.session.username = null;
      req.session.loggedIn = false;
      req.flash('info', 'You are logged out');
      return res.redirect('/');
    } else {
      req.flash('error', 'You are not logged in - please do so.');
      return res.redirect('/');
    }
  });

// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});
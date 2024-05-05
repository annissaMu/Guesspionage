# Guesspionage
CS304 Final Project
Team Members: Annissa, Dechen, Fridah, and Jelimo

## Table of Contents
1. [About](#about)
2. [Features](#features) 
3. [Getting Started](#getting-started)
4. [Acknoledgements](#acknoledgements)
5. [Contributing](#contributing)
6. [License](#license)

## About
Our final project is an attempt to recreate the populat Jackbox game 'Guesspionage', but tailored towards Wellesley College students. This project was built with Node.js, Express, and MongoDB. The game allows users to register, log in, and play a game based on guessing percentages. It includes features for user registration, login, session management, question handling, score calculation, and a leaderboard.


## Features
Our project allows the user to:
- Log-in and log-out (thus essentially creating an account)
- Answer a couple of preliminary questions prior to playing the game
- Play the actual guessing game, and then see how far off they were from the correct answers
- See their final score and the current leaderboard
- Insert their own questions to the questions database

## Getting Started
### Installation
1. Clone this repository to your local machine:
   ```bash
   git clone <YOUR_REPO_URL>
   cd <YOUR_REPO_FOLDER>
2. Install the required dependencies:

    `npm install`

3. Set up your environment variables. The app uses `dotenv` for environment variables. Create a `.env` file in the root directory or ensure the path to your environment file is set correctly
### Running the application
1. Start the development starter:

    `npm run dev`
2. Open a web browser and navigate to http://localhost:8080 (replace 8080 with whichever port you prefer, or your default port) to view the app

3. To stop the server, press `Ctrl + C` in the terminal window. If prompted with `Terminate batch job (y/n)?`, type `y` and press Enter

### Dependencies
This application uses the following dependencies:
- Node.js and npm
- Express
- Morgan (for logging HTTP requests)
- Body-parser (for handling HTTP request data)
- Cookie-session (for session management)
- Express-flash (for displaying flash messages)
- Multer (for file uploads)
- Bcrypt (for password hashing)
- MongoDB

### Playing the Game
- Registration: Navigate to /register/ to create a new account
- Login: Log in from the home page or /register/
- Game: After logging in, navigate to /game/ to play
- Logout: Click the logout button or navigate to /logout/ to log out

## Acknoledgements
We would like to give credit for the idea of Guesspionage to the respective owner, Jackbox Games.

## Contributing
Please contribute to this project! To contribute:

1. Fork this repository
2. Create a new branch for your changes
3. Submit a pull request with a description of your changes

## License
We don't have a license (or well, not any that we are aware of). We are just here to live love laugh (also we thought that we should have this section because every README.md seems to have one...)

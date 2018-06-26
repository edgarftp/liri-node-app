//Read any env variables
require("dotenv").config();

//require all npm packages
var keys = require("./keys.js");
var request = require("request");
var Spotify = require('node-spotify-api');
var Twitter = require("twitter");
var inquirer = require("inquirer");
var fs = require("fs");

//keys variables
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//Get User Choice
inquirer
    .prompt([
        {
            type: "list",
            message: "What do you want to do?",
            choices: ["My tweets", "Song Info", "Movie Info", "Do what it says"],
            name: "toDo"
        }
    ]).then(function (response) {
        switch (response.toDo) {
            case "My tweets":
                tweets();
                break;

            case "Song Info":
                more_info("song");
                break;

            case "Movie Info":
                more_info("movie");
                break;

            case "Do what it says":
                what_it_says();
                break;
        }
    });

//Function to get the tweets from the key given and display the text of each Tweet
var tweets = function () {
    client.get("statuses/user_timeline", function (error, tweets, response) {
        if (error) throw error;
        for (i = 0; i < tweets.length; i++) {
            console.log(tweets[i].text);
        }
    });
}

//Songs and Movies need additional info that the user gives us here
var more_info = function (type) {
    if (type === "song") {      //If song, get the the name of the song
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What's the name of the song?",
                    name: "song"
                }
            ]).then(function (response) {
                song(response.song);
            });
    } else {                    //If not a song, then has to be a movie, get that info
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What's the name of the movie?",
                    name: "movie"
                }
            ]).then(function (response) {
                movie(response.movie);
            });
    }
}
//Search a song in spotify function, receives parameter with the name of the Song
var song = function (songName) {
    if (songName === "") {
        songName = "The Sign ace of base";      //if name was left blank, it fills it up with The Sign from Ace of base
    }

    spotify.search({ type: 'track', query: songName, limit: 5 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err); //catch error function
        }
        var mainInfo = data.tracks.items;   //Create this variable to shorten the path we're looking for
        for (i = 0; i < mainInfo.length; i++) {     //loop for each song retrieved
            var artistArray = [];
            for (j = 0; j < mainInfo[i].artists.length; j++) {      //loop to get all artists into an array
                artistArray.push(mainInfo[i].artists[j].name);
            }
            console.log("\n-----------------------------------------------------------------");
            console.log("\n Artist(s): " + artistArray.join(", "));
            console.log("\n Track name: " + mainInfo[i].name);
            console.log("\n Preview: " + mainInfo[i].preview_url);
            console.log("\n Album: " + mainInfo[i].album.name);
            console.log("\n-----------------------------------------------------------------");
        }
        console.log("\n");

    });
}

//Search a movie in OMDB, receives the name of the movie
var movie = function (movieName) {
    if (movieName == "") {          //Add a default value if movieName is blank
        movieName = "Mr.Nobody"
    } else {
        movieName = movieName.split(" ").join("+");     //separate the string with '+' sign instead of blankspace
    }
    request("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy", function (error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            var bodyObj = JSON.parse(body);
            console.log("\n-----------------------------------------------------------------");
            console.log("\nTitle: " + bodyObj.Title);
            console.log("\nYear: " + bodyObj.Year);
            console.log("\nIMDB Rating: " + bodyObj.Ratings[0].Value);
            console.log("\nRotten Tomatoes Rating: " + bodyObj.Ratings[1].Value);
            console.log("\nCreated in: " + bodyObj.Country);
            console.log("\nLanguage: " + bodyObj.Language);
            console.log("\nPlot: " + bodyObj.Plot);
            console.log("\nPlot: " + bodyObj.Actors);
            console.log("\n-----------------------------------------------------------------\n");


        }
    });
}

//function when the user selects "what it says"
var what_it_says = function() {
    fs.readFile('random.txt', 'utf8', (err, data) => {      //read random.txt
        if (err) {                                          //console any possible error
            console.log(err);
        } else {
            var randomArray = data.split(",");                //split the string at the ","
            var condition = randomArray[0];             //assign first part for condition
            var name = randomArray[1];                    //assign the second part of the string to songName
            switch(condition){
                case "tweets":                          //executes tweets function
                tweets();
                break;

                case "song":                            //executes song function
                song(name); 
                break;
                
                case "movie":                           //executes movie function
                movie(name);
                break;
            }
                                            
        }

    });
}
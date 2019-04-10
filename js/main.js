let socket;
let currentScreen;
let username, room;

//server-assigned properties
let winner;
let player1, player2;
let prompt;
let percentage;
let time;


window.onload = e => {
    socket = io("https://hackbox-backend.herokuapp.com/");

    //once the socket has connected, set up all server message handling
    socket.on('connect', prepareMessageHandlers);

    //load up the join screen
    changeScreen("join");
};

/*
 * Called upon successful socket.io connection. 
 * Prepares the client to handle all messages from the server via callbacks.
 */
function prepareMessageHandlers()
{
    //enter this player into the game upon a valid join request
    socket.on("join room", payload => {
        payloadObj = JSON.parse(payload);

        if(currentScreen == "join")
        {
            if(payloadObj.joined == true)
                changeScreen("wait");
            else
                alert("Error: " + payloadObj.failReason);
        }
    });

    //start the game upon a valid request
    socket.on("start game", payload => {
        payloadObj = JSON.parse(payload);

        if(currentScreen == "wait" || currentScreen == "end")
        {
            prompt = payloadObj.category;
            player1 = payloadObj.player1Name;
            player2 = payloadObj.player2Name;

            if(username == player1 || username == player2)
                changeScreen("compete");
            else
                changeScreen("vote");
        }
    });

    //update the client's understanding of which player is winning on vote
    socket.on("vote", payload => percentage = JSON.parse(payload).percentage);

    //update the client's view of how much time is left
    socket.on("time changed", payload => time = JSON.parse(payload).time);

    //determine the winner and switch to the end screen on game end
    socket.on("timeout", () => {
        if(currentScreen == "compete" || currentScreen == "vote")
        {
            winner = (percentage < 0.5) ? player1 : player2;
            changeScreen("end");
        }
    });
}

/*
 * Asynchronously loads and sets up each of the main game screens.
 * Updating a single webpage maintains the websocket connection created on load.
 */
function changeScreen(screen)
{
    let request = new XMLHttpRequest();

    let address = getAddress(screen);

    request.onreadystatechange = function(){
        if (this.readyState == 4 && this.status == 200) 
        {
           // Pull the body data and set this page's to it
           document.querySelector("body").innerHTML = request.responseText;

           prepareScreen(screen);

           currentScreen = screen;
        }
    };
    request.open("GET", address, true);
    request.send();   
}

//given a screen name, return the associated address
function getAddress(screen)
{
    let address;

    switch(screen)
    {
        case "join":
            address = "join.html";
        break;
        case "vote":
            address = "vote.html";
        break;
        case "wait":
            address = "waiting-gameend.html";
        break;
        case "end":
            address = "waiting-gameend.html";
        break;
        case "compete":
            address = "compete.html";
        break;

        default:
            address = "error.html";
        break;
    }

    return address;
}

//given a screen name, set up all of the required page functions
function prepareScreen(screen)
{
    switch(screen)
    {
        case "join":
            document.querySelector("#in3").onclick = function(){
                username = document.querySelector("#in2").value;
                room = document.querySelector("#in1").value;

                //send a message to the server requesting a room join
                if(username.length > 0 && room.length == 4)
                {
                    //create the join request payload
                    let joinRequest = {roomcode: room};
                    //next, emit the join request under the name 'join'
                    socket.emit("join room", joinRequest);
                }
            };
        break;

        case "wait":
            document.querySelector("h1").innerHTML = username;
            document.querySelector(".startGame").onclick = function(){

                //create the start request payload
                let startRequest = {roomcode: room};
                //next, emit the join request under the name 'start'
                socket.emit("start game", startRequest);
            };
        break;

        case "vote":
            document.querySelector("h1").innerHTML = username;
            document.querySelector("#option1").innerHTML = "<p>" + player1 + "</p>";
            document.querySelector("#option2").innerHTML = "<p>" + player2 + "</p>";

            //a vote for player 1
            document.querySelector("#option1").onclick = function(){
                //create the vote payload (a vote for player 1)
                let vote = {roomcode: room, player: 0}; 
                //next, emit the vote under the name 'vote'
                socket.emit("vote", vote);
            };
            //a vote for player 1
            document.querySelector("#option2").onclick = function(){
                //create the vote payload (a vote for player 2)
                let vote = {roomcode: room, player: 1}; 
                //next, emit the vote under the name 'vote'
                socket.emit("vote", vote);
            };
        break;
        
        case "end":
            document.querySelector("h1").innerHTML = username;
            document.querySelector(".startGame").onclick = function(){
                //create the start request payload
                let startRequest = {roomcode: room};
                //next, emit the join request under the name 'start'
                socket.emit("start game", startRequest);
            };

            document.querySelector("p").innerHTML = winner + " has won!";
            document.querySelector(".startGame").value = "Start New Game";
        break;

        case "compete":
            document.querySelector("h1").innerHTML = username;
            document.querySelector("#prompt").innerHTML = prompt;
            document.querySelector("#submitResponse").onclick = function(){

                let response = document.querySelector("input").value;
                
                //send a request to the server to start the game
                if(response.length > 0)
                {
                    //create the submission payload
                    let submission = {roomcode: room, player: (Number)(username == player2), submission: response};
                    //next, emit the submission under the name 'submission'
                    socket.emit("enter submission", submission);
                }
            };

        break;
    }
}
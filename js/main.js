window.onload = init;

function init()
{
    let socket = io("https://hackbox-backend.herokuapp.com/");
    socket.on("connect", () => {
        const FAKE_ROOM = "AAAA";
        // Testing commands
        // request room command. Would be called from unity, but just testing here
        socket.emit("request room");
        socket.on("request room", (roomcode) => {
            console.log(`Received room code ${roomcode}`);
        });
        // Join command.
        socket.emit("join", FAKE_ROOM); 
        socket.on("join", (success) => {
            if (success) {
                console.log("JOINED")
            } 
            else {
                console.log(`UNABLE TO JOIN ROOM ${FAKE_ROOM}`);
            }
        });

    });
}


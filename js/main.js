let socket;
window.onload = e => {
    socket = io("https://hackbox-backend.herokuapp.com/");
    socket.on("connect", onConnected);
};

/**
 * Invoked when the socket has connected to the server
 */
function onConnected()
{
    let codeInput = document.querySelector("#roomcode");
    let joinButton = document.querySelector("#join");
    let status = document.querySelector("#status");
    joinButton.onclick = e => {
        socket.emit("join", codeInput.value);
    };
    socket.on("join", success => {
        if (success === true) {
            status.textContent = `Joined room ${codeInput.value}`;
            status.className = "success";
        } 
        else {
            status.textContent = `Failed to join room ${codeInput.value}`;
            status.className = "error";
        }
    });
}




/*   Testing code     
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
*/
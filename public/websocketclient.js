
let inp = document.querySelector("#messaging");
let btn = document.querySelector(".sndbtn");

let cont = document.querySelector(".contain");
console.log(inp.value);

function creation(message){
    let cf = document.createElement('div');
    cf.setAttribute("class", "chat sender");
    cf.innerText = message;
    cf.style.alignSelf = "flex-start"
    cont.appendChild(cf);
}
//o see the query parameters of a URL in a JavaScript client, you can use the URLSearchParams API. This API allows you to access and manipulate the query string parameters of a URL.
//The URLSearchParams constructor is used to create a new URLSearchParams object from the query string, which provides various methods for accessing and manipulating the query parameters.

// Parse the query parameter from the URL
const queobj = new URLSearchParams(window.location.search);
let query = queobj.get('q')
console.log(query)

// Create a WebSocket connection to the server
let websocketclient = new WebSocket("ws://localhost:3000");

// Event listener for incoming messages from the WebSocket server
websocketclient.addEventListener("message", (data) => {
    let c = JSON.parse(data.data)
    console.log(c)
    // Check if the message is intended for the current client (based on the query parameter)
    if (query == c.ss) {
        // Create a new div element to display the message
        creation(c.message)
        cont.scrollTop = cont.scrollHeight
    }
})

// Event listener for when the WebSocket connection is established
websocketclient.addEventListener("open", (data) => {
    console.log(data)
})

// Event listener for when the WebSocket connection is closed
websocketclient.addEventListener("close", () => {
    console.log("Messaging done...")
})

// Event listener for the send button click
btn.addEventListener("click", (data) => {
 
    if (inp.value) {
        // Send the message to the server
        websocketclient.send(inp.value)
      
        inp.value = ""
        btn.disabled = false; // Enable the send button
    } else {
        // Disable the send button when there is no input
        btn.disabled = true;
    }
})

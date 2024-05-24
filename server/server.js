import express from "express";
import path from "path";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import { WebSocketServer, WebSocket } from "ws";
import { con, message } from "./model/schema.js";
import { router } from "./routes/userloginportal.js";
import { registerRouter } from "./routes/userRegisterportal.js";
import { updateMessageData } from "./routes/Messageupdate.js";
import 'dotenv/config'
const app = express();
const port = process.env.PORT || 8000;


// Serve static files from the 'public' directory
app.use(express.static(path.resolve('public')));
//if you are using router then use router  fir parsing the form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// o prevent unauthenticated users from accessing the private route, take the token from the cookie, verify the token, and redirect users based on role.
app.set('view engine', 'ejs');
app.use(cookieParser())

//for checking url //any unusal query is set or not
app.use(async (req, res, next) => {
    let query = req.query
    console.log(query)
    let ar = Object.keys(query)
    console.log(query)
    let checkq = ar.filter(x => x === 'q')
    if (ar.length != 0 && checkq.length === 0) {
        res.statusCode = 404
        res.send("error df");
    }
    else {
        next()
    }
})
app.use("/home/login", router);
app.use("/home/signup", registerRouter);


app.get("/", (req, res) => {
    console.log(req.query, "ds")
    res.render('home', { render: "login" })
})
app.get("/home", (req, res) => {
    console.log(req.query, "ds")
    res.render('home', { render: "login" })
})
app.get("/home/mess", (req, res) => {
    res.redirect("/home/login")
})


app.post("/home/logout", (req, res) => {
    res.clearCookie("jwt");
    res.render('home', { render: "login" });
});




const checking = (req, res, next) => {

    // Retrieve JWT token from cookie
    let dd = req.cookies.jwt
    try {
        // Verify JWT token
        let decode = jwt.verify(dd, process.env.SECRET_KEY)
        // console.log(decode)
        // Check if username in token matches request parameter
        if (decode.name === req.params.username) {
            next();
        }
        else {
            res.status(404).json({ error: "invalirequest" })
        }
    }
    catch (error) {
        res.status(404).json({ error: error.message })
    }
}


app.get("/:username/home", checking, (req, res) => {
    console.log(req.cookies)
    res.render('home', { render: req.params.username })
})

app.post("/:username/home/messagebox/search", async (req, res) => {
    if (req.body.search === req.params.username) {
        // return res.render('xx', { array: Object.keys(s.messageData), arr: s.messageData["default"], receiver: "default" })
        return res.redirect(`/${req.params.username}/home/messagebox`)
    }
    // console.log(req.query)
    let searchuser = req.body.search
    try {

        let pp = await message.findOne({ username: req.params.username,messageData:"suresh" })
        console.clear();
         console.log(pp,"sd");
        let s = await message.findOne({ username: req.params.username })
        let r = await con.findOne({ username: searchuser })
        if (r) {
            let u = Object.keys(s.messageData)
            console.log(u)
            let result = u.includes(searchuser)
            console.log(result)
            if (!result) {
                let ob = s.messageData
                ob[searchuser] = []
                await message.updateOne({ username: req.params.username }, { $set: { messageData: ob } })
                // s = await message.findOne({ username: req.params.username })
                // console.clear();
                // console.log(s);
            }

            res.redirect(`/${req.params.username}/home/messagebox?q=${searchuser}`)
        }
        else {
            res.status(400).send("user not found")
        }
    }
    catch (error) {
        res.status(404).json("try again later");
    }
    // res.send("ok")
})




let senderrr;
let receiverrr;
app.get("/:username/home/messagebox", checking, async (req, res) => {
    console.log(req.query, "jh")
    //     receiverrr = req.query.q ?? "default" you can use this also
    receiverrr = req.query.q ?? "default"
    senderrr = req.params.username
    try {

        let a = await message.findOne({ username: senderrr })
        let m = a.messageData[receiverrr]
        //console.log(a)
        if (!m) {
            res.statusCode = 404
            res.send("error");
        } else {
            res.render('xx', { array: Object.keys(a.messageData), arr: m, receiver: receiverrr })
        }
    } catch (error) {
        res.sendStatus(404);
    }


});
const server = app.listen(port, () => {
    console.log("server started........");
});

let messageArray = []

//Map provides a more robust way to manage key-value pairs compared to plain objects, especially when keys are not simple strings or symbols.
let clients = new Map();
const ws = new WebSocketServer({ server });

// Event listener for a new WebSocket connection
ws.on("connection", async (stream) => {
    // Assuming senderrr is a unique identifier for the client
    let clientid = senderrr;
    // Map the client identifier to the WebSocket stream
    clients.set(clientid, stream);
    // Event listener for incoming messages from the client
    stream.on("message", async (mess) => {
        let c = mess.toLocaleString();
        // Push the received message to the messageArray
        messageArray.push(c);

        // Update the message data in the database
        await updateMessageData(messageArray);

        // Get the WebSocket stream of the receiver client
        let clientr = clients.get(receiverrr);
        // Check if the receiver's WebSocket stream is open
        let cond1 = (clientr != undefined) && clientr.readyState === WebSocket.OPEN;
        if (cond1) {
            console.log("Sending message to client with ID:", clientr);
            // Create a message object to send to the receiver
            let obj = {
                message: c,
                ss: senderrr
            };
            // Send the message object to the receiver
            clientr.send(JSON.stringify(obj));
        }

        // Get the WebSocket stream of the sender client
        let client = clients.get(senderrr);
        // Check if the sender's WebSocket stream is open
        if (client && client.readyState === WebSocket.OPEN) {
            console.log("Sending message to client with ID:", clientid);
            // Create a message object to send to the sender (for updating the UI)
            let obj = {
                message: c,
                ss: receiverrr
            };
            // Send the message object to the sender
            client.send(JSON.stringify(obj));
        }
    });

    // Event listener for when the client closes the WebSocket connection
    stream.on("close", () => {
        // Remove the client from the clients map
        clients.delete(clientid);
    });
});


//to broadcast to all clients
//     ws.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send('isdone');
//         }
//     });
//     stream.send(c);

// })
export {senderrr,receiverrr}
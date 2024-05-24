import { con } from "../model/schema.js";
import mongoose from "mongoose";
import express from "express";
const router = express.Router()
import bcrypt from "bcryptjs"
import 'dotenv/config'
// import crypto from "crypto" //used to  for encyrption ,cryrpography
// import crypto from "crypto" //used to  for encyrption ,cryrpography
// let jwsSecretToken=crypto.randomBytes(40).toString("hex") //henerating a token
// console.log(jwsSecretToken)
import jwt from "jsonwebtoken"


//db connection
async function main() {
    await mongoose.connect("mongodb://localhost:27017/userdatabase")
}
main().catch(error => console.log(error))
main().then(console.log("connected......"))

//loginpage
router.get("/", (req, res) => {
    res.statusCode = 200
    res.render(`login`, { render: " " })
});

//login request
//generating cookie
router.post("/", async (req, res) => {
    try {

        //checking username exist or not
        const userAuthentication = await con.findOne({ username: req.body.uname });
        // console.log(a);
        if (!userAuthentication) {
            res.statusCode = 400
            res.render('login', { render: "INVALID username or password" })
        }
        else {
            //checking password is correct or not
            let result = await bcrypt.compare(req.body.psw, userAuthentication.password)
            if (result) {
                //payload
                const payload = {
                    id: userAuthentication._id,
                    name: userAuthentication.username
                }
                const jwsSecretToken = process.env.SECRET_KEY
                const secretKey = jwsSecretToken

                const expireAge = 30 * 60 * 60 * 1000//30hr in sec

                // generate a JSON Web Token (JWT) by signing a payload,key and expiresIn
                let token = jwt.sign(payload, secretKey, { expiresIn: expireAge });


                //senting cookie to user
                res.cookie("jwt", token, {
                    maxAge: expireAge, 
                    httpOnly: true, //only acccessible to websocket
                    // secure:true // this isused for security means htt
                    path:"/"
                })
                res.status(200).redirect(`/${req.body.uname}/home`)
            }
            else {
                res.statusCode = 400
                res.render('login', { render: "INVALID username or password" })
            }

        }
    }
    catch (error) {
        res.status(404).json({
            message: "AN error occured",
            err: error.message
        })
    }
})

export { router }
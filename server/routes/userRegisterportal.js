import { con, message } from "../model/schema.js";
import express from "express";
import bcrypt from "bcryptjs"
const registerRouter = express.Router()
import 'dotenv/config'


//signuppage page
registerRouter.get("/", (req, res) => {
    res.statusCode = 200

    res.render(`signuppage`, { render: "" })
});

registerRouter.post("/", async (req, res) => {
    try {
        //checking username exist or not in db
        let existingUser = await con.findOne({ username: req.body.uname });

        //if exist then simply send res
        if (existingUser) {
            res.statusCode = 400;
            res.render('signuppage', { render: "username exist" });
        } else {
            ///creating hash password
            let hahsPassword = await bcrypt.hash(req.body.psw, 10).catch((error) => res.status(404).json({
                message: "User not successful created try again later",
                error: error.message,
            }))
            //creation of db of user
            let co = new con({
                naams: req.body.names,
                password: hahsPassword,
                username: req.body.uname
            });
            await co.save()

            //creation of messagebox of that user
            const ss = new message({
                username: req.body.uname,
            });
            await ss.save();


            res.statusCode = 200;
            res.redirect("/home/login");
        }
    } catch (ValidationError) {
        console.log(ValidationError)
        res.statusCode = 400
        res.render('signuppage', { render: "value is less than 8" })
    }
})

export { registerRouter }
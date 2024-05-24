import { mongoose } from "mongoose";
const f = new Date()
let d = new String();
console.log(typeof (d))
const constraint = new mongoose.Schema({
    naams: String,
    username: { type: String, required: true },
    password: { type: String, required: true, minlength: [8, "value is less than 8"] },
    creationTime: { type: Date, required: false, default: f.toDateString() },

});
const messageData = new mongoose.Schema({
    username: String,
    messageData: { type: Object, default: { default: [12] } }

});

export const con = new mongoose.model("userdatabase", constraint)
export const message = new mongoose.model("messagedatabase", messageData)
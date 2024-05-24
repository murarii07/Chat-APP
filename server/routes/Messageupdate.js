import { senderrr,receiverrr } from "../server.js"
import { message } from "../model/schema.js";
// //function to update message data
const updateMessageData = async (messageArray) => {
    const sender = senderrr
    const receiver = receiverrr
    // Find the sender's message data in the database
    let checkname = await message.findOne({ username: sender })
    // console.log(check)
    let array = messageArray;


    // If the sender has previous messages with the receiver, add them to the array
    if (checkname.messageData[receiver]) {
        let previousMessages = checkname.messageData[receiver]
        //console.log(previousMessages)
        for (const message of previousMessages) {
            array.push(message);
        }

    }
    // Update the sender's message data in the database
    // console.log(checkname)
    let obj = checkname.messageData
    obj[receiver] = array;
    // console.log(obj)
    await message.updateOne({ username: sender }, { $set: { messageData: obj } }).catch(error => console.log(error.message))

    // Find the receiver's message data in the database
    if (receiver != 'default') {

        checkname = await message.findOne({ username: receiver })
        let obj2 = checkname.messageData
        obj2[sender] = array;
        // console.log(checkname, obj2)

        // Update the receiver's message data in the database
        await message.updateOne({ username: receiver }, { $set: { messageData: obj2 } }).catch(error => console.log(error.message))
        //console.log(checkname.messageData[receiver])
    }

    // Clear the messages array for the next request
    messageArray.splice(0, messageArray.length)


}
export {updateMessageData}
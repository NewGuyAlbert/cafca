const axios = require('axios').default
const FormData = require('form-data')

const credentials = require("./config/fatsmsKey.js");

function sendAllSms(phoneList, partition){

    phoneList.forEach( (phoneNumber) => {
        sendSingleSms(phoneNumber, partition)
    })


    return 
}

async function sendSingleSms(phoneNumber, partition){

    let bodyFormData = new FormData()

    bodyFormData.append("to_phone", phoneNumber)
    bodyFormData.append("message", 'New message added in the ' + partition + " queue")
    bodyFormData.append("api_key", credentials.fatsmsKey)

    try {
        const response = await axios({
            method: "post",
            url: "https://fatsms.com/send-sms",
            data: bodyFormData,
            headers: bodyFormData.getHeaders(),
        })
        //handle success
        console.log(response)
    } catch (err) {
        //handle error
        console.log(err)
    }
}

module.exports = {sendAllSms, sendSingleSms}
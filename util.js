const parseXml = require('xml2js').parseString;
const parseCsv = require("csvtojson");
const { tsv2json, json2tsv } = require('tsv-json')
const fs = require('fs');

function verifyContentType(contentType, data){

    if(contentType==="application/json"){
        return "json"
    }
    else if(contentType==="application/xml"){
        return "xml"
    }
    else if(contentType.includes("multipart/form-data")){
        if(data.includes("text/csv")){
            return "csv"
        }
        else if(data.includes("tab-separated-values")){
            return "tsv"
        }
        else return "fail"
    }
}

function parseDataByType(type, data){
    switch(type) {
        case 'json':
            return parseToJson(data)
        case 'xml':
            return xmlToJson(data)
        case 'csv':
            return csvToJson(data)
        case 'tsv':
            return tsvToJson(data)
    }
}

function parseToJson(data){
    return JSON.parse(data)
}
function xmlToJson(data){
    let payload
    result = parseXml(data, function (err, result) {
        payload = result
    })
    return payload
}
function csvToJson(data){
    //We need to cut the begginin and end and leave only the data
    data = data.split('\n')
    data.splice(0,4)
    data.splice(-2)
    
    let processedData = data.join('\n')
    let payload
    parseCsv().fromString(processedData).then((jsonObj) => {
        console.log(jsonObj)
        payload = jsonObj
    })
    return payload
}
function tsvToJson(data){
    //We need to cut the begginin and end and leave only the data
    data = data.split('\n')
    data.splice(0,4)
    data.splice(-2)
    
    let processedData = data.join('\n')
    console.log(processedData)
    return tsv2json(processedData)
}

function createPartition(partitionName){

    if(checkIfFolderExists(partitionName)){
        //Folder exists
        return false
    }
    else{
        //Folder doesn't exist so we crate it
        fs.mkdirSync('./queue/' + partitionName, { recursive: true });
        return true
    }
}

function checkIfPartitionExists(partitionName){
    return checkIfFolderExists(partitionName)
}

function checkIfFolderExists(folderName){

    const dir = './queue/' + folderName

    if (fs.existsSync(dir)){
        return true
    }
    else{
        return false
    }
}

function createMessage(partition, data){
    // stringify JSON Object
    const stringData = JSON.stringify(data)

    const timeStamp = new Date().valueOf();
    const fileName = "./queue/" + partition + "/" + timeStamp + ".json"

    console.log(fileName)


    return fs.writeFile(fileName, stringData, 'utf8', function (err) {
        if (err) {
            return false
        }
        else{
            return true
        }
    })
}

module.exports = {
    verifyContentType, 
    parseDataByType, 
    createPartition, 
    checkIfPartitionExists,
    createMessage
}
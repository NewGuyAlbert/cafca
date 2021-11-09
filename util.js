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

async function parseDataByType(type, data){
    switch(type) {
        case 'json':
            return parseToJson(data)
        case 'xml':
            return xmlToJson(data)
        case 'csv':
            return await csvToJson(data)
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
async function csvToJson(data){
    //We need to cut the begginin and end and leave only the data
    data = data.split('\r\n')
    data.splice(0,4)
    data.splice(-2)
    
    let processedData = data.join('\n')
    parseCsv().fromString(processedData).then((jsonObj) => {
        return jsonObj
    }).catch((error) => {
        console.log('error while getting csv to json', error)
        return "error"
    })

    return await parseCsv().fromString(processedData)
}
function tsvToJson(data){
    //We need to cut the begginin and end and leave only the data
    data = data.split('\n');
    data.splice(0,4);
    data.splice(-2);


    const headers = data.shift().split('\t');
    const result = data.map(line => {
      const data = line.split('\t');
      return headers.reduce((obj, nextKey, index) => {
        obj[nextKey] = data[index];
        return obj;
      }, {});
    })
    console.log(result)

    return result
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

async function createMessage(partition, data){
    // stringify JSON Object
    const stringData = JSON.stringify(data);

    const timeStamp = new Date().valueOf();
    const fileName = "./queue/" + partition + "/" + timeStamp + ".json";

    return fs.writeFile(fileName, stringData, {
        encoding: "utf8",
        flag: "w+"
    }, (err) => {
        if(err) throw err;
        console.log('successfully written to a file');
    })
}

module.exports = {
    verifyContentType, 
    parseDataByType, 

    createPartition, 
    checkIfPartitionExists,
    createMessage
}
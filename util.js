const parseXml = require('xml2js').parseString;
const parseCsv = require("csvtojson");
const json2xml = require('js2xmlparser');
const json2csv = require('json2csv');
const fs = require('fs');

// const test_json = require('./queue/netflix/1635711029660.json')
// const jsonObj = {"name":"John", "age":30, "car":null}

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

async function parseJSONByType(type, data){
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
    data = data.split('\r\n');
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
    return result
}

function parseDataByJson(dataType, data){
    switch(dataType){
        case 'json':
            return data
        case 'xml':
            return jsonToXml(data)
        case 'csv':
            return jsonToCsv(data)
        case 'tsv':
            return jsonToTsv(data)
    }
}

function jsonToXml(data){
    let result = ''
    try{
        result = json2xml.parse(data)
    } catch(e) {
        result = "Error parsing into XML form."
    }
    return result
}

function jsonToCsv(data){
    const jsonData = data.data
    let headers = Object.keys(jsonData[0])
    const csvData = json2csv.parse(jsonData, headers)
    return csvData
}

function jsonToTsv(data){
   const jsonArray = data.data
   let tsvResult = ''
   const titles = Object.keys(jsonArray[0])
   titles.forEach( (title, index) => {
    tsvResult += (index !== titles.length-1 ? `${title}\t` : `${title}\r\n`)
   })
   jsonArray.forEach((content, index) => {
       let row = ''
       for(let title in content){
           row += (row === '' ? `${content[title]}` : `\t${content[title]}`)
       }
       tsvResult += (index !== jsonArray.length-1 ? `${row}\r\n` : `${row}`)
   })
   console.log('tsv result', tsvResult)
   return tsvResult
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

function subscribeUser(host, partition){
    const data = fs.readFileSync('subscribers.json');
    let subscribers = JSON.parse(data)

    console.log(subscribers)

    let alreadySubscribed = false
    try{
        subscribers.subscriberList[host].forEach(function(data) {
            if(data === partition){
                alreadySubscribed = true
                return
            }
        })
    }
    catch(err){}

    if(alreadySubscribed){
        return 1
    }
    else if(subscribers.subscriberList[host] === undefined){
        subscribers.subscriberList[host] = [partition]
    }
    else{
       subscribers.subscriberList[host] = [...subscribers.subscriberList[host], partition]
    }

    let stringData = JSON.stringify(subscribers)
    try{
        fs.writeFileSync('subscribers.json', stringData)
        return 2
    }
    catch(err){
        console.log(err)
        return 0
    }
    
}

module.exports = {
    verifyContentType, 
    parseJSONByType, 
    createPartition, 
    checkIfPartitionExists,
    createMessage,
    subscribeUser,
    parseDataByJson
}
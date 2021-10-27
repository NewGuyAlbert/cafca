const parseXml = require('xml2js').parseString;
const parseCsv = require("csvtojson");
const { tsv2json, json2tsv } = require('tsv-json')

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

module.exports = {verifyContentType, parseDataByType}
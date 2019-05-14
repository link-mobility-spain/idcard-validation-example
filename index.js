'use strict';

require('dotenv').config();

const fs = require('fs');
const axios = require('axios');
const xml2js = require('xml2js');

(async () => {

  const options = {
    login: process.env.API_LOGIN,
    password: process.env.API_TOKEN,
    imageA: await readFileBase64('./data/IMG_20190326_174830.jpg'),
    imageAFormat: 'jpg',
    imageB: '', //await readFileBase64('./data/IMG_20190326_174839.jpg');
    imageBFormat: 'jpg',
    tipo: 1,
    //writeResult: 'result.xml'
  };

  const result = await validarDocumentoV3(options);

  console.log(result);

  // You can parse descriptors to object
  // const descriptionObject = result.description.split('|').reduce( (prev, el) => {
  //   const elArr = el.split(':');
  //   prev[elArr[0]] = elArr[1];
  //   return prev;
  // }, {});
  // console.log(descriptionObject);

})().catch(err => { 
  console.log(err);
  fs.writeFileSync('./data/result-error.txt', err);
});

async function validarDocumentoV3(options) {
  const url = 'https://webservice.gms.es/webservice/servidorValidarDocumentosV3.php';
  const body = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
     <validarDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <login xsi:type="xsd:string">${options.login}</login>
        <password xsi:type="xsd:string">${options.password}</password>
        <imageA xsi:type="xsd:base64Binary">${options.imageA}</imageA>
        <imageAFormat xsi:type="xsd:string">${options.imageAFormat}</imageAFormat>
        <imageB xsi:type="xsd:base64Binary">${options.imageB}</imageB>
        <imageBFormat xsi:type="xsd:string">${options.imageBFormat}</imageBFormat>
        <type xsi:type="xsd:string">${options.tipo}</type>
     </validarDocumento>
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await axios.post(url, body, { headers: {'Content-Type': 'text/xml'} });

  if (options.writeResult) {
    fs.writeFileSync(options.writeResult, response.data);
  }

  // parse XML
  const parser = new xml2js.Parser();
  const dataJson = await new Promise((resolve, rej) => {
    parser.parseString(response.data, (err, data) => (err ? rej(err):resolve(data) ) );
  });
  const info = dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse'][0];
  //console.log(dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse']);
  //console.log('description', info.description);
  
  // create description with param values
  const result = {
    description: info.description[0]['_'],
    status: info.result[0]['_'],
    refWeb: info.refWeb[0]['_'],
    issueTime: info.issueTime[0]['_'],
  };
  return result;
}

async function validarDocumento(options) {
  const url = 'https://webservice.gms.es/webservice/servidorValidarDocumentos.php';
  const body = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
     <validarDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <login xsi:type="xsd:string">${options.login}</login>
        <password xsi:type="xsd:string">${options.password}</password>
        <imageA xsi:type="xsd:base64Binary">${options.imageA}</imageA>
        <imageB xsi:type="xsd:base64Binary">${options.imageB}</imageB>
        <type xsi:type="xsd:string">${options.tipo}</type>
     </validarDocumento>
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await axios.post(url, body, { headers: {'Content-Type': 'text/xml'} });

  if (options.writeResult) {
    fs.writeFileSync(options.writeResult, response.data);
  }

  // parse XML
  const parser = new xml2js.Parser();
  const dataJson = await new Promise((resolve, rej) => {
    parser.parseString(response.data, (err, data) => (err ? rej(err):resolve(data) ) );
  });
  const info = dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse'][0];
  console.log(dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse']);
  //console.log('description', info.description);
  
  // create description with param values
  const descriptionObject = Object.keys(info).reduce((result, item) => {
    if (item === '$') return result;
    result[item] = ('_' in info[item][0]) ? info[item][0]._ : null;
    return result;
  }, {});
  const result = {
    description: descriptionObject,
    status: info.result[0]['_'],
    refWeb: info.refWeb[0]['_'],
  };
  return result;
}

async function validarDocumentoV2(options) {
  const url = 'https://webservice.gms.es/webservice/servidorValidarDocumentosV2.php';
  const body = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
     <validarDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
        <login xsi:type="xsd:string">${options.login}</login>
        <password xsi:type="xsd:string">${options.password}</password>
        <imageA xsi:type="xsd:base64Binary">${options.imageA}</imageA>
        <imageB xsi:type="xsd:base64Binary">${options.imageB}</imageB>
        <type xsi:type="xsd:string">${options.tipo}</type>
     </validarDocumento>
  </soapenv:Body>
</soapenv:Envelope>`;

  const response = await axios.post(url, body, { headers: {'Content-Type': 'text/xml'} });

  if (options.writeResult) {
    fs.writeFileSync(options.writeResult, response.data);
  }

  // parse XML
  const parser = new xml2js.Parser();
  const dataJson = await new Promise((resolve, rej) => {
    parser.parseString(response.data, (err, data) => (err ? rej(err):resolve(data) ) );
  });
  const info = dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse'][0];
  //console.log(dataJson['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns1:validarDocumentoResponse']);
  //console.log('description', info.description);
  
  // create description with param values
  const descriptionObject = info.description[0]._.split('|').reduce( (prev, el) => {
    const elArr = el.split(':');
    prev[elArr[0]] = elArr[1];
    return prev;
  }, {});
  const result = {
    description: descriptionObject,
    status: info.result[0]['_'],
    refWeb: info.refWeb[0]['_'],
    issueTime: info.issueTime[0]['_'],
  };
  return result;
}

function readFileBase64(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err,data) => {
      if (err) { return reject(err); }
      return resolve(Buffer.from(data, 'binary').toString('base64'));
    });
  });
}

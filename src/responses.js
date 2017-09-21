const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

const respond = (request, response, content, type, status) => {
  const code = status || 200;
  response.writeHead(code, { 'Content-Type': type });
  response.write(content);
  response.end();
};

const getResponse = (request, response, msg, acceptedTypes, status) => {
  // check if requesting xml
  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${msg.message}</message>`;
    responseXML = `${responseXML} <id>${msg.id}</id>`;
    responseXML = `${responseXML} </response>`;

    return respond(request, response, responseXML, 'text/xml', status);
  }
  // else use json
  const msgString = JSON.stringify(msg);

  // return response passing json and content type
  return respond(request, response, msgString, 'application/json', status);
};

// get index page
const getIndex = (request, response, status) => {
  respond(request, response, index, 'text/html', status);
};
// get css page
const getCSS = (request, response) => {
  //console.log(request.url);
  respond(request, response, style, 'text/css');
};

module.exports = {
  getResponse,
  getIndex,
  getCSS,
};

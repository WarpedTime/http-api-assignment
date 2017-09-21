const http = require('http'); // pull in the http server module
const url = require('url'); // pull in the url module
const responseHandler = require('./responses.js');
const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// check the url query for implemented queries
const handleQuery = (queryObj) => {
  // console.log(`[query] -> ${JSON.stringify(queryObj)}`);

  const urlQuery = {};

  // check if has query 'valid'
  if (queryObj.valid) {
    console.log(`-> VALID query: ${queryObj.valid}`);
    urlQuery.valid = queryObj.valid;
  }

  // check if has query loggedIn
  if (queryObj.loggedIn) {
    console.log(`-> LOGGEDIN query: ${queryObj.loggedIn}`);
    urlQuery.loggedIn = queryObj.loggedIn;
  }

  // check if has query for format (json/xml)
  if (queryObj.format) {
    console.log(`-> FORMAT query: ${queryObj.format}`);

    // set format is xml (default is json)
    if (queryObj.format === 'xml' || queryObj.format === 'text/xml') urlQuery.isXml = 'true';
  }

  return urlQuery;
};

// handle the url request and queries
const handleUrl = (request, response, parsedUrl) => {
  // console.log(request.url+" -> "+ acceptedTypes);
  const msg = {
    id: 'No id',
    message: 'No message here. If you see this then I messed up somewhere...',
  };
  const acceptedTypes = request.headers.accept.split(',');

  let urlQuery = {};

  // if url has a query check those and pass of to queryHandler.
  if (parsedUrl.query) {
    // console.log(`url query: ${JSON.stringify(parsedUrl.query)}`);
    const params = query.parse(parsedUrl.query);

    // check query
    urlQuery = handleQuery(params);
    if (urlQuery.isXml === 'true') acceptedTypes[0] = 'text/xml';
  } // else console.log('no query in url');

  // check url request
  if (parsedUrl.pathname === '/') {
    responseHandler.getIndex(request, response);
  } else if (parsedUrl.pathname === '/style.css') {
    responseHandler.getCSS(request, response);
  } else if (parsedUrl.pathname === '/success') {
    // set msg
    msg.id = 'Success';
    msg.message = 'The request was successful.';

    responseHandler.getResponse(request, response, msg, acceptedTypes, 200);
  } else if (parsedUrl.pathname === '/forbidden') {
    // set msg
    msg.id = 'Forbdden';
    msg.message = 'You cannot access this page.';

    responseHandler.getResponse(request, response, msg, acceptedTypes, 403);
  } else if (parsedUrl.pathname === '/internal') {
    // set msg
    msg.id = 'Internal';
    msg.message = 'There was an internal server error... :(';

    responseHandler.getResponse(request, response, msg, acceptedTypes, 500);
  } else if (parsedUrl.pathname === '/notImplemented') {
    // set msg
    msg.id = 'Not Implemented';
    msg.message = 'This request is not implemented.';

    responseHandler.getResponse(request, response, msg, acceptedTypes, 501);
  } else if (parsedUrl.pathname === '/badRequest') {
    if (urlQuery.valid === 'true') {
      msg.id = 'Bad Request';
      msg.message = 'The request has valid parameters.';

      responseHandler.getResponse(request, response, msg, acceptedTypes, 200);
    } else {
      msg.id = 'Bad Request';
      msg.message = 'The request was invalid.';

      responseHandler.getResponse(request, response, msg, acceptedTypes, 400);
    }
  } else if (parsedUrl.pathname === '/unauthorized') {
    if (urlQuery.loggedIn === 'true') {
      msg.id = 'Unauthorized';
      msg.message = 'The request had valid parameters.';

      responseHandler.getResponse(request, response, msg, acceptedTypes, 200);
    } else {
      msg.id = 'Unauthorized';
      msg.message = 'This can only be accessed if logged in.';

      responseHandler.getResponse(request, response, msg, acceptedTypes, 401);
    }
  } else if (parsedUrl.pathname === '/cats') { // because the internet needs more cats :)
    msg.id = 'Cats';
    // check queries
    if (urlQuery.valid === 'true') {
      msg.message = 'There be valid cats.';
      console.log('there be valid cats');
    }
    if (urlQuery.loggedIn === 'true') {
      console.log('logged in nyoww');
      msg.message = 'Logged in nyoww.';
    }
    if (acceptedTypes[0] === 'text/xml') {
      console.log('the cats send you xml');
      msg.message = 'The cats send you xml.';
    } else {
      console.log('the cats send you json');
      msg.message = 'The cats send you json.';
    }
    responseHandler.getResponse(request, response, msg, acceptedTypes, 200);
  } else { // default to index
    msg.id = 'Not Found';
    msg.message = 'The requested page could not be found.';

    responseHandler.getIndex(request, response, 404);
  }
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  // handle request url
  handleUrl(request, response, parsedUrl);
};

http.createServer(onRequest).listen(port);
console.log(`Listening on 127.0.0.1: ${port}`);

# jasperclient
Jasper Server REST API client for publishing and running reports.

## Usage

```javascript
const jasperclient = require('jasperclient');
const fs = require('fs');

let client = new jasperclient({
    host: 'jasper.example.com',
    path: 'jasperserver',
    username: 'username',
    password: 'password',
});

// Publish a report
let content = fs.readFileSync('./dummy.jrxml');
let publishResponse = client.reports.publish({
    path: '/Reports/Dummy',
    label: 'Dummy Report',
    datasource: '/datasources/Dummy',
    jrxml: Buffer.from(content).toString('base64'),
});

// Fetch a report
let runResponse = client.reports.run({
    path: '/Reports/Dummy.pdf',
    format: 'pdf',
    params: {
        input1: 'value1',
        input2: 'value2',
    },
},{
    responseType: 'stream',
});

let writer = fs.createWriteStream('./dummy.pdf');

runResponse.data.pipe(writer);

writer.on('finish', function () {
    console.log('Successfully wrote file to ./dummy.pdf');
    client.logout();
});

writer.on('error', function (err) {
    console.log('Failed to write file: ',err);
    client.logout();
});
```

## Methods

### login()
```javascript
@function login - Create a cookie-based session with the Jasper server.  If the username and password
                  were provided to the constructor then they can be ommitted here, and it becomes
                  unneccessary to call this method directly; it will be called automatically when
                  the first request is made.
@async
@param {!string} opt.username - Username to use when authenticating with the Jasper server.
@param {!string} opt.password - Password to use with the username.
@returns {Promise<string>} - Resolves JSESSIONID upon success.
                           - Rejects with error string on failure.
```

### logout()
```javascript
@function logout - End the current session with the Jasper server.
@async
@returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
                           - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
```

### request()
```javascript
@function request - Send a request to the jasper server.  If a username and password
                    were provided to the constructor then a login will be performed
                    if needed prior to sending this request.
@async
@param { string} method - HTTP request method to use (i.e. GET or POST).
@param { string} path - Portion of URI after hostname and path suffix.
@param {!Object} params - Optional parameters to pass with the request.
@param {!Object} data - Optional data to pass as the body of the request.
@param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
@returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
                           - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
```

### resources.list()
```javascript
@function list - Fetch resource information from the server.
@param { Object} req - Details about the report you are fetching.
@param { Object} req.data - Parameters to supply with the request (see https://community.jaspersoft.com/documentation/jasperreports-server-web-services-guide/v56/searching-repository ).
@param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
@returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
                           - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
```

### reports.publish()
```javascript
@function publish - Upload a report to the Jasper server.  This is limited to uploading
                    reports composed of a single .jrxml file.
@async
@param { Object} req - Details about the report you are uploading.
@param { String} req.path - Path where the report will later become available.
@param { String} req.label - Label used to identify the report on the server.
@param { String} req.datasource - URI of the datasource to use with the report.
@param { String} req.jrxml - Contents of a .jrxml file encoded as Base64.
@param {!Array<Object>} req.resources - Additional resources to be uploaded with the report. (see https://community.jaspersoft.com/documentation/tibco-jasperreports-server-rest-api-reference/v630/resource-descriptors )
@returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
                           - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
```

### reports.run()
```javascript
@function run - Fetch a report from the Jasper server.
@param { Object} req - Details about the report you are fetching.
@param { String} req.path - Path of the report on the Jasper server.
@param { String} req.format - File extension being requested.
@param {!Object} req.params - Input controls to apply to the report.
@param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
@returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
                           - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
```
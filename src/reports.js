(() => {
    
    /*
    * @class resources - Handler for requests to /rest_v2/reports
    * @param { Object} client - An instance of jasperclient
    */
    function reports (client) {
        this.client = client;
    }
    
    /*
    * @function run - Fetch a report from the Jasper server.
    * @param { Object} req - Details about the report you are fetching.
    * @param { String} req.path - Path of the report on the Jasper server.
    * @param { String} req.format - File extension being requested.
    * @param {!Object} req.params - Input controls to apply to the report.
    * @param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    reports.prototype.run = async function (req,opt) {
        let path = '/rest_v2/reports'+req.path+'.'+req.format;
        try {
            return await this.client.request('get', path, req.params, req.data, opt );
        }
        catch (err) {
            throw(err);
        }
    };
    
    /*
    * @function publish - Upload a report to the Jasper server.  This is limited to uploading
    *                     reports composed of a single .jrxml file.
    * @async
    * @param { Object} req - Details about the report you are uploading.
    * @param { String} req.path - Path where the report will later become available.
    * @param { String} req.label - Label used to identify the report on the server.
    * @param { String} req.datasource - URI of the datasource to use with the report.
    * @param { String} req.jrxml - Contents of a .jrxml file encoded as Base64.
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    
    */
    reports.prototype.publish = async function (req,opt) {
        try {
            return await this.client.request('put','/rest_v2/resources'+req.path, {}, {
                'version': req.currentVersion,
                'overwrite': true,
                'label': req.label,
                'dataSource': {
                    'dataSourceReference': {
                        'uri': req.datasource,
                    },
                },
                'jrxml': {
                    'jrxmlFile': {
                        'type': 'jrxml',
                        'label': 'Main jrxml',
                        'content': req.jrxml,
                    },
                },
            }, Object.assign({},opt,{
                'headers': {
                    'Content-Type': 'application/repository.reportUnit+json',
                },
            }));
        }
        catch (err) {
            throw(err);
        }
    };
    
    module.exports = reports;
    
})();

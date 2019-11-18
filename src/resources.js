(() => {
    
    /*
    * @class resources - Handler for requests to /rest_v2/resources
    * @param { Object} client - An instance of jasperclient
    */
    function resources (client) {
        this.client = client;
    }
    
    /*
    * @function list - Fetch resource information from the server.
    * @async
    * @param { Object} req - Details about the report you are fetching.
    * @param { Object} req.data - Parameters to supply with the request (see https://community.jaspersoft.com/documentation/jasperreports-server-web-services-guide/v56/searching-repository ).
    * @param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    resources.prototype.list = async function (req,opt) {
        try {
            return await this.client.request('get', '/rest_v2/resources'+(typeof req.path == 'string' ? req.path : ''), req.params, req.data, opt );
        }
        catch (err) {
            throw(err);
        }
    };
    
    module.exports = resources;
    
})();

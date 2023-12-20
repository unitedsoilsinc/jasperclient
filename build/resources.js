"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(() => {
    /*
    * @class resources - Handler for requests to /rest_v2/resources
    * @param { Object} client - An instance of jasperclient
    */
    function resources(client) {
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
    resources.prototype.list = function (req, opt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.request('get', '/rest_v2/resources' + (typeof req.path == 'string' ? req.path : ''), req.params, req.data, opt);
            }
            catch (err) {
                throw (err);
            }
        });
    };
    module.exports = resources;
})();

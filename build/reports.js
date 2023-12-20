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
    * @class resources - Handler for requests to /rest_v2/reports
    * @param { Object} client - An instance of jasperclient
    */
    function reports(client) {
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
    reports.prototype.run = function (req, opt) {
        return __awaiter(this, void 0, void 0, function* () {
            let path = '/rest_v2/reports' + req.path + '.' + req.format;
            try {
                return yield this.client.request('get', path, req.params, req.data, opt);
            }
            catch (err) {
                throw (err);
            }
        });
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
    * @param {!Array<Object>} req.resources - Additional resources to be uploaded with the report. (see https://community.jaspersoft.com/documentation/tibco-jasperreports-server-rest-api-reference/v630/resource-descriptors )
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    reports.prototype.publish = function (req, opt) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.client.request('put', '/rest_v2/resources' + req.path, {}, Object.assign({
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
                }, !Array.isArray(req.resources) || req.resources.length == 0 ? null : {
                    'resources': {
                        'resource': req.resources,
                    },
                }), Object.assign({}, opt, {
                    'headers': {
                        'Content-Type': 'application/repository.reportUnit+json',
                    },
                }));
            }
            catch (err) {
                throw (err);
            }
        });
    };
    module.exports = reports;
})();

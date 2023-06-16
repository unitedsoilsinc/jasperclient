(() => {
    
    const axios = require('axios').default;
    const axiosCookieJarSupport = require('axios-cookiejar-support').default;
    const tough = require('tough-cookie');
    const qs = require('qs');
    const Base64 = require('js-base64').Base64;
    
    axiosCookieJarSupport(axios);
    
    /*
    
    */
    const components = {
        'resources': require('./src/resources.js'),
        'reports': require('./src/reports.js'),
    };
    
    /*
    * @class - jasperclient -- Jasper Server REST API client for publishing and running reports.
    * @param { Object}  opt - Required configuration data.
    * @param { string}  opt.proto [http] - Protocol to use; optionally set to https.
    * @param { string}  opt.host - Hostname of the Jasper server.
    * @param {!number}  opt.port - Port number of the server (default is undefined).
    * @param {!string}  opt.path - Path of the server after the hostname (i.e. jasperserver).
    * @param {!string}  opt.username - Username to use when authenticating with the Jasper server.
    * @param {!string}  opt.password - Password to use with the username.
    * @param {!Boolean} opt.userBasicAuth - Send Basic Authorization header instead of using cookies (default is false)
    */
    function jasperclient (opt) {
        
        if ( !opt ) throw new Error('new jasperclient() requires configuration');
        
        this.proto = opt.proto || 'http';
        this.host = opt.host;
        this.port = opt.port;
        this.path = opt.path;
        if ( typeof this.path != 'string' ) this.path = '';
        this.path = this.path.replace(/^\/|\/$/g,''); // remove leading/trailing slashes
        
        this.baseURL = `${this.proto}://${this.host}${this.port?':'+this.port:''}/${this.path != '' ? this.path+'/' : ''}`;
        
        this.username = opt.username;
        this.password = opt.password;
        
        this.useBasicAuth = opt.useBasicAuth ? true : false;
        
        if (
            typeof this.proto != 'string'
            || typeof this.host != 'string'
        ) throw new Error('new jasperclient() requires configuration');
        
        if ( !this.useBasicAuth ) this.cookiejar = new tough.CookieJar();
        
        this.axios = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Accept': 'application/json',
            },
            withCredentials: true,
            jar: this.cookiejar,
        });
        
        this.resources = new components.resources(this);
        this.reports = new components.reports(this);
    }
    
    /*
    * @function _request - perform an HTTP request using Axios
    * @private
    * @async
    * @param { string} method - HTTP verb name (i.e. get, post, etc.)
    * @param { string} path - Portion of URI after hostname and path suffix.
    * @param {!Object} params - Optional parameters to pass with the request.
    * @param {!Object} data - Optional data to pass as the body of the request.
    * @param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    jasperclient.prototype._request = function (method,path,params,data,opt) {
        return new Promise( (resolve,reject) => {
            if ( this.useBasicAuth ) {
                if ( !opt ) opt = {};
                if ( !opt.headers ) opt.headers = {};
                if ( !opt.headers.Authorization ) opt.headers.Authorization = 'Basic '+Base64.encode( this.username+':'+this.password );
            }
            this.axios.request(Object.assign({
                method: method,
                url: path,
                params: params,
                data: data,
            },opt))
            .then( response => {
                resolve(response);
            })
            .catch( err => {
                if ( err.response && err.response.status == 302 ) {
                    resolve(err.response);
                }
                else if ( err.response ) {
                    reject(err);
                }
                else {
                    reject(err);
                }
            });
        });
    };
    
    /*
    * @function matchPath - Perform pattern matching on a path after automatically removing the base path (i.e. /jasperserver).
    * @param {   string} path - Path portion of a URI that may or may not include the base path.
    * @param {...RegExp} pattern - Used to match/capture values from the path.
    * @returns {Array|undefined|null} - Results of String.prototype.match() using the provided RegExp or undefined or null if no matches
    */
    jasperclient.prototype.matchPath = function (path,...patterns) {
        let shortPath = path;
        if ( this.path != '' ) {
            let re = new RegExp('^/'+this.path+'(.*)');
            let shortPathMatches = path.match(re);
            if ( !shortPathMatches ) return;
            shortPath = shortPathMatches[1];
        }
        for ( let pattern of patterns ) {
            let patternMatches = shortPath.match(pattern);
            if ( patternMatches ) return patternMatches;
        }
        return;
    };
    
    /*
    * @function login - Create a cookie-based session with the Jasper server.  If the username and password
    *                   were provided to the constructor then they can be ommitted here, and it becomes
    *                   unneccessary to call this method directly; it will be called automatically when
    *                   the first request is made.
    * @async
    * @param {!string} opt.username - Username to use when authenticating with the Jasper server.
    * @param {!string} opt.password - Password to use with the username.
    * @returns {Promise<string>} - Resolves JSESSIONID upon success.
    *                            - Rejects with error string on failure.
    */
    jasperclient.prototype.login = function (opt) {
        return new Promise( (resolve,reject) => {
            if ( this.useBasicAuth ) {
                reject('login() disabled when useBasicAuth is enabled');
                return;
            }
            this.cookiejar.removeAllCookiesSync();
            this._request('post','/j_spring_security_check', {}, qs.stringify({
                j_username: opt ? opt.username : this.username,
                j_password: opt ? opt.password : this.password,
            }),{
                maxRedirects: 0,
            })
            .then( response => {
                
                if ( response.status == 302 ) {
                    
                    let cookie = this.cookiejar.getCookiesSync(this.baseURL).reduce( (obj,x) => {
                        if ( obj ) return obj;
                        if ( x.key == 'JSESSIONID' ) return x;
                    },null);
                    
                    if (
                        cookie
                        && this.matchPath(response.headers.location,
                            '^\/scripts\/auth\/loginSuccess\.json', // v7.x
                            '^\/scripts\/visualize\/auth\/loginSuccess\.json', // v8.x
                        )
                    ) resolve(cookie.value)
                    else reject('Failed to log in');
                }
                else {
                    reject('Failed to log in');
                }
            })
            .catch(reject);
        });
    };
    
    /*
    * @function logout - End the current session with the Jasper server.
    * @async
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    jasperclient.prototype.logout = async function () {
        return new Promise( (resolve,reject) => {
            if ( this.useBasicAuth ) {
                reject('logout() disabled when useBasicAuth is enabled');
                return;
            }
            this._request('get','/logout.html')
            .then( response => {
                if ( response.status == 200 ) {
                    this.cookiejar.removeAllCookiesSync();
                    resolve(response);
                }
                else {
                    reject(response);
                }
            })
            .catch(reject);
        });
    };
    
    /*
    * @function request - Send a request to the jasper server.  If a username and password
    *                     were provided to the constructor then a login will be performed
    *                     if needed prior to sending this request.
    * @async
    * @param { string} method - HTTP request method to use (i.e. GET or POST).
    * @param { string} path - Portion of URI after hostname and path suffix.
    * @param {!Object} params - Optional parameters to pass with the request.
    * @param {!Object} data - Optional data to pass as the body of the request.
    * @param {!Object} opt - Additional options to apply to the Axios request (see https://github.com/axios/axios#request-config ).
    * @returns {Promise<Object>} - Resolves an Axios response (see https://github.com/axios/axios#response-schema ).
    *                            - Rejects an Axios error (see https://github.com/axios/axios#handling-errors ).
    */
    jasperclient.prototype.request = function (method,path,params,data,opt) {
        return new Promise( async (resolve,reject) => {
            method = method.toLowerCase();
            
            if ( this.useBasicAuth ) {
                try {
                    let response = await this._request(method,path,params,data,opt);
                    resolve(response);
                    return;
                }
                catch (err) {
                    reject(err);
                    return;
                }
            }
            
            if ( this.cookiejar.getCookiesSync(this.baseURL).length > 0 ) {
                // already have cookie; attempt request
                try {
                    let response = await this._request(method,path,params,data,opt);
                    if ( response && response.status != 401 ) {
                        resolve(response);
                        return;
                    }
                }
                catch (err) {
                    reject(err);
                    return;
                }
            }
            
            // request failed; attempt login, then retry original request
            let maxAttempts = 1;
            let attempt = 1
            while ( attempt <= maxAttempts ) {
                try {
                    var jsessionid = await this.login();
                }
                catch (err) {
                    reject(err);
                    return;
                }
                
                if ( jsessionid  ) {
                    try {
                        let response = await this._request(method,path,params,data,opt);
                        resolve(response);
                        return;
                    }
                    catch (err) {
                        reject(err);
                        return;
                    }
                }
                
                attempt ++;
            }
            
            reject({ error: 'Login failed' });
            
        });
    };
    
    module.exports = jasperclient;
    
})();

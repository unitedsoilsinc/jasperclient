(() => {
    const nock = require('nock');
    const qs = require('qs');
    const fs = require('fs');
    
    /*
    * These functions install one-time interceptors for HTTP requests.
    */
    
    module.exports = {
        
        /*
        * login - intercept a login request
        */
        login: function () {
            nock('http://example.com')
                .post('/jasperserver/j_spring_security_check')
                .reply( (uri, requestBody) => {
                    let data = qs.parse(requestBody);
                    if ( data.j_username == 'username' && data.j_password == 'password' ) {
                        return [302,'',{
                            'Location': '/jasperserver/scripts/auth/loginSuccess.json;jsessionid=3CF53E312EE7418CBE64363163B3CAB9',
                            'Set-Cookie': 'JSESSIONID=3CF53E312EE7418CBE64363163B3CAB9',
                        }];
                    }
                    else {
                        return [302,'',{
                            'Location': '/jasperserver/login.html?error=1',
                        }];
                    }
                });
        },
        
        
        /*
        * logout - intercept a logout request
        */
        logout: function () {
            nock('http://example.com')
                .get('/jasperserver/logout.html')
                .reply( (uri, requestBody) => {
                    return [200];
                });
        },
        
        
        /*
        * resourceList - intercept request for report list
        */
        resourceList: function () {
            nock('http://example.com')
                .get('/jasperserver/rest_v2/resources')
                .reply( (uri, requestBody) => {
                    let data = qs.parse(requestBody);
                    return [200,[
                        {
                            version: 20,
                            permissionMask: 2,
                            creationDate: '2019-05-31T16:32:17',
                            updateDate: '2019-07-30T14:46:04',
                            label: 'Dummy',
                            description: 'A simple dummy report',
                            uri: '/Reports/Dummy',
                            resourceType: 'reportUnit',
                        }
                    ],{}];
                });
        },
        
        /*
        * publishReport - intercept request to create or update a report
        */
        publishReport: function () {
            nock('http://example.com')
                .put('/jasperserver/rest_v2/resources/Reports/Dummy')
                .reply( (uri,requestBody) => {
                    return [
                        200,
                        {
                            version: 0,
                            permissionMask: 1,
                            creationDate: '2019-11-18T21:06:19',
                            updateDate: '2019-11-18T21:06:19',
                            label: 'Dummy Report',
                            uri: '/Reports/Dummy',
                            dataSource: { dataSourceReference: { uri: '/datasources/Dummy' } },
                            jrxml: {
                                jrxmlFileReference: { uri: '/Dummy_files/Main_jrxml' }
                            },
                            alwaysPromptControls: false,
                            controlsLayout: 'popupScreen',
                            resources: {
                                "resource": [
                                    {
                                        "name": "img.png",
                                        "file": {
                                            "fileReference": {
                                                "uri": "/Dummy_files/img.png"
                                            }
                                        }
                                    },
                                    {
                                        "name": "sub.jrxml",
                                        "file": {
                                            "fileReference": {
                                                "uri": "/Dummy_files/sub.jrxml"
                                            }
                                        }
                                    },
                                ]
                            }
                        }
                    ];
                });
        },
        
        /*
        * runReport - intercept request for a PDF report
        */
        runReport: function () {
            nock('http://example.com')
                .get('/jasperserver/rest_v2/reports/Reports/Dummy.pdf')
                .reply( (uri, requestBody) => {
                    let reader = fs.createReadStream('./test/dummy.pdf');
                    return [200,reader,{
                        'content-disposition': 'attachment; filename="Dummy.pdf"',
                        'content-type': 'application/pdf',
                        'content-length': '13264',
                    }];
                });
        },
        
        
    };
})();

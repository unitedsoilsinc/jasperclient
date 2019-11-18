const expect = require('chai').expect;
const nock = require('nock');

const responses = require('./responses.js');
const jasperclient = require('../index');

describe('List reports', function () {
    
    let response;
    
    before( async function () {
        responses.login();
        responses.resourceList();
        
        let client = new jasperclient({
            host: 'example.com',
            path: 'jasperserver',
            username: 'username',
            password: 'password',
        });
        response = await client.resources.list({
            data: {
                type: 'reportUnit',
                folderUri: '/Reports',
            },
        });
    });
    
    context('without arguments', function () {
        it('should list reports', async function () {
            expect( response.data ).to.deep.equal([
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
            ]);
        });
    });
});

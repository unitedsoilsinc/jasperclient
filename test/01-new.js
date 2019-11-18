const expect = require('chai').expect;
const nock = require('nock');

const responses = require('./responses.js');
const jasperclient = require('../index');

describe('Create new jasperclient object', function () {
    
    context('without arguments or with invalid arguments', function () {
        it('should throw error', function () {
            expect( function () {
                new jasperclient();
            }).to.throw('new jasperclient() requires configuration');
        });
    });
    
});

describe('Authenticate with Jasper server', function () {
    
    beforeEach( function () {
        responses.login();
    });
    
    context('with valid credentials', function () {
        it('should obtain a session id', async function () {
            let client = new jasperclient({
                host: 'example.com',
                path: 'jasperserver',
                username: 'username',
                password: 'password',
            });
            let jsessionid = await client.login();
            expect(jsessionid).to.equal('3CF53E312EE7418CBE64363163B3CAB9');
        });
    });
    
    context('with invalid credentials', function () {
        it('should receive undefined session id', async function () {
            let client = new jasperclient({
                host: 'example.com',
                path: 'jasperserver',
                username: 'username',
                password: 'wrongpassword',
            });
            try {
                var jsessionid = await client.login();
            }
            catch (err) {
                expect(jsessionid).to.be.undefined;
            }
        });
    });
    
    
});


describe('Logout of Jasper server', function () {
    
    beforeEach( function () {
        responses.login();
        responses.logout();
    });
    
    it('should wipe cookies', async function () {
        let client = new jasperclient({
            host: 'example.com',
            path: 'jasperserver',
            username: 'username',
            password: 'password',
        });
        
        await client.login();
        
        await client.logout();
        
        expect(client.cookiejar.getCookiesSync(client.baseURL).length).to.equal(0);
    });
});

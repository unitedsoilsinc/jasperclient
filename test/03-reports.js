const expect = require('chai').expect;
const nock = require('nock');
const fs = require('fs');

const responses = require('./responses.js');
const jasperclient = require('../index');

describe('Publish a report', function () {
    
    let response;
    
    before( async function () {
        responses.login();
        responses.publishReport();
        
        let client = new jasperclient({
            host: 'example.com',
            path: 'jasperserver',
            username: 'username',
            password: 'password',
        });
        
        try {
            let content = fs.readFileSync('./test/dummy.jrxml');
            b64 = Buffer.from(content).toString('base64');
        }
        catch (err) {
            throw(err);
        }
        
        response = await client.reports.publish({
            path: '/Reports/Dummy',
            label: 'Dummy Report',
            datasource: '/datasources/Dummy',
            jrxml: b64,
        });
    });
    
    context('create a new report', function () {
        it('should receive report with version 0',function () {
            expect(response.data.version).to.equal(0)
        });
    });
    
    
});

describe('Run a report', function () {
    
    let response;
    
    before( async function () {
        responses.login();
        responses.runReport();
        
        let client = new jasperclient({
            host: 'example.com',
            path: 'jasperserver',
            username: 'username',
            password: 'password',
        });
    
        response = await client.reports.run({
            path: '/Reports/Dummy',
            format: 'pdf',
        },{
            responseType: 'stream',
        });
    });
    
    context('without arguments', function () {
        
        it('should have an attachment', function () {
            expect( response.headers['content-disposition'] ).to.equal('attachment; filename="Dummy.pdf"');
        });
        
        it('should have content-type of application/pdf', function () {
            expect( response.headers['content-type'] ).to.equal('application/pdf');
        });
        
        it('should receive data as a stream', function () {
            expect( typeof response.data.pipe ).to.equal('function')
        });
        
    });
    
});

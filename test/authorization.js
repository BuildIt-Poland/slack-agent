'use strict';
const expect = require("chai").expect;
const moxios = require('moxios');
const auth = require("../security/authorization.js");


describe("Authorization module tests", function () {
    describe("Check authorize() function", function () {
        beforeEach(function () {
          // import and pass your custom axios instance to this method
          moxios.install()
        })
    
        afterEach(function () {
          // import and pass your custom axios instance to this method
          moxios.uninstall()
        })

        it("creates post that calls aprioprate url with required params", async function () {
            moxios.wait(function () {
                let request = moxios.requests.mostRecent();
                request.respondWith({
                  status: 200,
                  response: 
                    { url: request.config.url, data: request.config.data},
                })
            });
            let payload = {
                code: "1111",
                client_id: "as",
                client_secret: "as"

            };
            let url = await auth.authorize(payload);
            expect(url.config.url).to.equal("https://slack.com/api/oauth.access");
            expect(url.config.data.indexOf("1111")).not.equal(-1);
            expect(url.config.data.indexOf("code")).not.equal(-1);
            expect(url.config.data.indexOf("client_id")).not.equal(-1);
            expect(url.config.data.indexOf("client_secret")).not.equal(-1);
            
        });
    });
    describe("Check oAuthRedirectUrl() function", function (){
        it("Promise is resolved to expected object", async function () {
            let payload = {
                scope: "test",
                client_id: "123"
            };
            let url = await auth.oAuthRedirectUrl(payload);
            expect(url.statusCode).to.equal(301);
            expect(url.headers.Location.indexOf("https://slack.com/oauth/authorize?")).not.equal(-1);
            expect(url.headers.Location.indexOf("scope")).not.equal(-1);
            expect(url.headers.Location.indexOf("client_id")).not.equal(-1);
            
        });
    });
    describe("Check isVerified() function", function (){
        it("returns false when missing headers properties in request", function () {
            let verified = auth.isVerified({}, {});
            expect(verified).to.equal(false);
        });
        it("returns false when missing X-Slack-Signature and X-Slack-Request-Timestamp properties", function () {
            let verified = auth.isVerified({headers: {}}, {});
            expect(verified).to.equal(false);
        });
        it("returns false if properties are not defined properly is undefined", function () {
            let request = {
                headers: {
                    'X-Slack-Signature': false,
                    'X-Slack-Request-Timestamp':false
                }
            }
            let verified = auth.isVerified(request, "85c51f2e87bf29a6b1976386c542887f");
            expect(verified).to.equal(false);
        });
        it("returns false signingSecret is undefined", function () {
            let request = {
                headers: {
                    'X-Slack-Signature': 'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
                    'X-Slack-Request-Timestamp':'1548754209'
                }
            }
            let verified = auth.isVerified(request, undefined);
            expect(verified).to.equal(false);
        });
        it("returns false signingSecret is not a string", function () {
            let request = {
                headers: {
                    'X-Slack-Signature': 'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
                    'X-Slack-Request-Timestamp':'1548754209'
                }
            }
            let verified = auth.isVerified(request, 1234);
            expect(verified).to.equal(false);
        });
        it("returns false when timestamp is too old", function () {
            let request = {
                headers: {
                    'X-Slack-Signature': 'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
                    'X-Slack-Request-Timestamp':'1548754209'
                }
            }
            let verified = auth.isVerified(request, "85c51f2e87bf29a6b1976386c542887f");
            expect(verified).to.equal(false);
        });
        it("returns false when timestamp is fresh, but signature doesn't match expected value", async function () {
            let time = ~~(Date.now() / 1000) - (60 * 2)
            let request = {
                headers: {
                    'X-Slack-Signature': 'v0=39fda9a061aeb91f8ab8d44476baef9d2a8accab1e03bdc8dc573c8f8eef16ef',
                    'X-Slack-Request-Timestamp': time.toString()
                }
            }
            console.log(request);
            let verified = await auth.isVerified(request, "85c51f2e87bf29a6b1976386c542887f");
            expect(verified).to.equal(false);
        });

        
    });
});
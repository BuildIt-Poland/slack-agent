'use strict';
const expect = require("chai").expect;
const auth = require("../authorization.js");
const moxios = require('moxios')

describe("Authorization module tests", function () {
    describe("Check authorize() method", function () {
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
                code: "1111"
            };
            let url = await auth.authorize(payload);
            expect(url.config.url).to.equal("https://slack.com/api/oauth.access");
            expect(url.config.data.indexOf("1111")).not.equal(-1);
            expect(url.config.data.indexOf("code")).not.equal(-1);
            expect(url.config.data.indexOf("client_id")).not.equal(-1);
            expect(url.config.data.indexOf("client_secret")).not.equal(-1);
            
        });
    });
});
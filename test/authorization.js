'use strict';
var expect = require("chai").expect;
var auth = require("../authorization.js");
var moxios = require('moxios')

describe("Really bad test", function () {
    describe("Check authorize method", function () {
        beforeEach(function () {
          // import and pass your custom axios instance to this method
          moxios.install()
        })
    
        afterEach(function () {
          // import and pass your custom axios instance to this method
          moxios.uninstall()
        })

        it("creates post that calls aprioprate url with required params", async function () {
            let payload = {
                code: "1111"
            };
            
            moxios.wait(function () {
                let request = moxios.requests.mostRecent();
                console.log(request)
                request.respondWith({
                  status: 200,
                  response: 
                    { url: request.config.url, data: request.config.data},
                })
            });
            let url = await auth.authorize(payload);
            expect(url.config.url).to.equal("https://slack.com/api/oauth.access");
            let contains = url.config.data.indexOf("1111");
            expect(contains).not.equal(-1);
            contains = url.config.data.indexOf("code");
            expect(contains).not.equal(-1);
            //TODO: tests for keys
        });
    });
});
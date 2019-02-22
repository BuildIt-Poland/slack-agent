/* global describe beforeEach afterEach it */
const { expect } = require('chai');
const authorization = require('../security/authorization.js');
const { authorize } = require('../handlers/authorize.js');
require('mocha-sinon');

function initAuthorizeStub() {
	const stubAuthorize = this.sinon.stub(authorization, 'authorize');
	stubAuthorize.returns({
		status: 200,
		body: 'Authorized'
	});
}

function restoreAuthorizeStub() {
	this.sinon.restore();
}

describe('authorize handler module tests', () => {
	describe('Check authorize(event) function', () => {
		beforeEach(initAuthorizeStub);
		afterEach(restoreAuthorizeStub);
		it('authorize(event) function returns 200 if code is filled in queryStringParameters', async () => {
			const authorized = await authorize({ queryStringParameters: { code: 234 } });
			expect(authorized.statusCode).to.equal(200);
		});
		it(`authorize(event) function returns 301 if there isn't code in queryStringParameters`, async () => {
			const authorized = await authorize({ queryStringParameters: {} });
			expect(authorized.statusCode).to.equal(301);
		});
	});
});

/* global describe beforeEach afterEach it */
const parkingPlace = require('../../app/dao/parkingPlace.js');
const authorization = require('../../app/services/authService.js');
const { add } = require('../../app/handlers/addParkingPlace.js');

function initParkingPlaceStub() {
  const stubSaveParkingPlace = this.sinon.stub(parkingPlace, 'saveParkingPlace');
  const stubVerified = this.sinon.stub(authorization, 'isVerified');
  stubSaveParkingPlace.returns(true);
  stubVerified.returns(true);
}

function initParkingPlaceStubWithUnauthorized() {
  const stubSaveParkingPlace = this.sinon.stub(parkingPlace, 'saveParkingPlace');
  const stubVerified = this.sinon.stub(authorization, 'isVerified');
  stubSaveParkingPlace.returns(true);
  stubVerified.returns(false);
}

function initParkingPlaceStubWithFailureSave() {
  const stubSaveParkingPlace = this.sinon.stub(parkingPlace, 'saveParkingPlace');
  const stubVerified = this.sinon.stub(authorization, 'isVerified');
  stubSaveParkingPlace.returns(false);
  stubVerified.returns(true);
}

function restoreParkingPlaceStub() {
  this.sinon.restore();
}

describe('addParkingPlace handler module tests', () => {
  describe('Check parkingPlace(event) function', () => {
    beforeEach(initParkingPlaceStub);
    afterEach(restoreParkingPlaceStub);
    it('returns 200 with positive message', async () => {
      const response = await add({ body: 'text=Gdansk+30' });
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal(
        '{"text": "You added a parking place.\n *City:* Gdansk\n *Place:* 30"}'
      );
    });
    it('returns 200 with parser error', async () => {
      const response = await add({ body: 'text=30' });
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('{"text": "Invalid command"}');
    });
  });
  describe('Check parkingPlace(event) function when user is unauthorized', () => {
    beforeEach(initParkingPlaceStubWithUnauthorized);
    afterEach(restoreParkingPlaceStub);
    it('return 401 user unauthorized', async () => {
      const response = await add({ body: 'text=Gdansk+30' });
      expect(response.statusCode).to.equal(401);
    });
  });
  describe(`Check parkingPlace(event) function when database doesn't save parkingPlace`, () => {
    beforeEach(initParkingPlaceStubWithFailureSave);
    afterEach(restoreParkingPlaceStub);
    it('returns 200 with negative message', async () => {
      const response = await add({ body: 'text=Gdansk+30' });
      expect(response.statusCode).to.equal(200);
      expect(response.body).to.equal('{"text": "You can\'t add parking place"}');
    });
  });
});

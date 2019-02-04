'use strict';

/* global describe it  */
const expect = require('chai').expect;

describe('Reservation module tests',  () => {
	describe('Check findReservationByDate(date, tableName)', () => {
		it('returns reservation for specific date', async () => {
		});
		it(`returns undefined when reservations isn't exist in database`, async () => {
		});
	});

});

/*
var updateTableSpy = sinon.spy();
AWS.mock('DynamoDB', 'updateTable', updateTableSpy);
 
// Object under test
myDynamoManager.scaleDownTable();
 
// Assert on your Sinon spy as normal
assert.isTrue(updateTableSpy.calledOnce, 'should update dynamo table via AWS SDK');
var expectedParams = {
  TableName: 'testTableName',
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  }
};
assert.isTrue(updateTableSpy.calledWith(expectedParams), 'should pass correct parameters');

*/
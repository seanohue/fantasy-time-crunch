const _ = require('lodash');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { validate } = require('../lib/validate');
const {
  ERROR_MESSAGE,
  CONFIGURATION_ERROR_MESSAGE,
} = require('./_test-helpers.js');

chai.use(sinonChai);

const testCases = [
  '',
  0,
  null,
  undefined,
  [],
  () => {},
  new Set(),
  new Map(),
  Symbol(),
  {},
];

let validArg = {
  errors: [],
  input: [{ tick: true, id: 2 }],
  system: {},
};

describe('lib/validate.js', () => {
  beforeEach(() => {
    validArg.errors = [];
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('[Function validate]:', () => {
    describe('functionality:', () => {
      it('should return an object with input, errors, and system if there are no errors', () => {
        const validation = validate(validArg);
        expect(validation).to.have.property('input');
        expect(validation).to.have.property('errors');
        expect(validation).to.have.property('system');
        expect(validation.input).to.be.an('array');
        expect(validation.errors).to.be.an('array');
        expect(validation.system).to.be.a('object');
      });

      it('should add the tick input id as tickUnit to systems object', () => {
        expect(validate(validArg).system).to.have.property('tickUnit');
        expect(validate(validArg).system.tickUnit).to.equal(
          validArg.input[0].id
        );
      });
    });

    describe('errors:', () => {
      it('should throw if no args are passed', () => {
        expect(() => validate()).to.throw();
      });

      it('should throw if arg is not an object', () => {
        testCases.forEach((testCase) => {
          expect(() => validate(testCase)).to.throw();
        });
      });

      it('should throw if an empty object is passed', () => {
        expect(() => validate({})).to.throw();
      });

      it('should throw if properties of arguments are invalid', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (!Array.isArray(testCase)) {
            expect(() =>
              validate({
                ...validArg,
                errors: testCase,
              })
            ).to.throw();

            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input: testCase,
              })
            ).to.throw();
          }

          if (
            typeof testCase !== 'object' ||
            testCase instanceof Array ||
            testCase instanceof Set ||
            testCase instanceof Map
          ) {
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                system: testCase,
              })
            ).to.throw();
          }
          expect(stub).to.have.been.called;

          stub.reset();
        });

        stub.restore();
      });

      it('should throw if input tick is not a boolean', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (typeof testCase !== 'boolean') {
            const input = [{ tick: testCase, id: 1 }];
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input,
              })
            ).to.throw(ERROR_MESSAGE);

            expect(stub).to.have.been.calledWith(
              CONFIGURATION_ERROR_MESSAGE,
              `Tick must be a boolean. ${JSON.stringify(input[0])}`
            );

            stub.reset();
          }
        });

        stub.restore();
      });

      it('should throw if input array has more than one tick', () => {
        const stub = sinon.stub(console, 'error');
        const input = [
          { tick: true, id: 1, makes() {} },
          { tick: true, id: 2, makes() {} },
        ];
        const inputFiltered = input
          .filter((value) => 'tick' in value)
          .map((value) => value.id);

        expect(() =>
          validate({
            ...validArg,
            errors: [],
            input,
          })
        ).to.throw(ERROR_MESSAGE);
        expect(stub).to.have.been.calledWith(
          CONFIGURATION_ERROR_MESSAGE,
          `You need one and only one 'tick' defined. Found ${
            inputFiltered.length
          }. Found: ${inputFiltered.join(', ')}`
        );

        stub.restore();
      });

      it('should throw if input id is not defined', () => {
        const stub = sinon.stub(console, 'error');
        expect(() =>
          validate({
            ...validArg,
            errors: [],
            input: [{ tick: true }],
          })
        ).to.throw(ERROR_MESSAGE);
        expect(stub).to.have.been.calledWith(
          CONFIGURATION_ERROR_MESSAGE,
          'Id is not defined. {"tick":true}'
        );
        stub.restore();
      });

      it('should throw if input id is not a string or number', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (
            !(_.isNil(testCase) || _.isNumber(testCase) || _.isString(testCase))
          ) {
            const input = [{ tick: true, id: testCase }];
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input,
              })
            ).to.throw(ERROR_MESSAGE);

            expect(stub).to.have.been.calledWith(
              CONFIGURATION_ERROR_MESSAGE,
              `Id is not a string or number. ${JSON.stringify(input[0])}`
            );
            stub.reset();
          }
        });
        stub.restore();
      });

      it('should throw if input makes is not a plain object or function', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (!(_.isFunction(testCase) || _.isPlainObject(testCase))) {
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input: [{ id: 1, tick: true, makes: testCase }],
              })
            ).to.throw(ERROR_MESSAGE);

            expect(stub).to.have.been.calledWith(
              CONFIGURATION_ERROR_MESSAGE,
              'Makes must be a plain object or a function'
            );

            stub.reset();
          }
        });

        stub.restore();
      });

      it('should throw if inputs without makes is more than one', () => {
        const stub = sinon.stub(console, 'error');

        expect(() =>
          validate({
            ...validArg,
            errors: [],
            input: [
              { id: 1, makes() {} },
              { tick: true, id: 2, makes() {} },
              { id: 3 },
              { id: 4 },
            ],
          })
        ).to.throw(ERROR_MESSAGE);

        expect(stub).to.have.been.calledWith(
          CONFIGURATION_ERROR_MESSAGE,
          'You should have no more than one defined time unit that does not make up a larger time unit. Found: 3, 4'
        );

        stub.restore();
      });

      it('should throw if input system is not a plain object or function', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (!(_.isFunction(testCase) || _.isPlainObject(testCase))) {
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input: [{ id: 1, tick: true, makes: {}, states: testCase }],
              })
            ).to.throw(ERROR_MESSAGE);

            expect(stub).to.have.been.calledWith(
              CONFIGURATION_ERROR_MESSAGE,
              'States must be a plain object or a function'
            );

            stub.reset();
          }
        });

        stub.restore();
      });

      it('should throw if input onIncrement is not a function', () => {
        const stub = sinon.stub(console, 'error');
        testCases.forEach((testCase) => {
          if (!_.isFunction(testCase)) {
            expect(() =>
              validate({
                ...validArg,
                errors: [],
                input: [
                  { id: 1, tick: true, makes: {}, onIncrement: testCase },
                  { id: 5, tick: true, makes: {} },
                ],
              })
            ).to.throw(ERROR_MESSAGE);

            expect(stub).to.have.been.calledWith(
              CONFIGURATION_ERROR_MESSAGE,
              'onIncrement must be a function'
            );

            stub.reset();
          }
        });
        stub.restore();
      });
    });
  });
});

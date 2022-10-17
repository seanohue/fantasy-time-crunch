const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const {
  createIdList,
  handleConfigErrors,
  handleErrors,
  maybeCallWithContext,
} = require('../lib/utils');

const testCases = [
  null,
  undefined,
  1,
  '2',
  {},
  true,
  false,
  [],
  new Set(),
  new Map(),
  Symbol,
];

describe('lib/utils.js', () => {
  describe('[Function createIdList]', () => {
    describe('functionality:', () => {
      it('should return a string', () => {
        expect(createIdList()).to.be.a('string');
      });

      it('should return an empty string if there are invalid args', () => {
        const testCases = [
          ,
          'test',
          {},
          false,
          true,
          function () {},
          1,
          new Set([{ id: '4' }]),
          new Map(),
        ];
        expect(createIdList(testCases)).to.eq('');
      });

      it('should filter non-number ids', () => {
        const output = createIdList([
          { id: {} },
          { id: false },
          { id: true },
          { id() {} },
          { id: '2' },
          { id: 1 },
        ]);
        expect(output).to.equal('1');
      });

      it('should create a string of ids, comma separated', () => {
        const output = createIdList([{ id: 1 }, { id: 2 }]);
        expect(output).to.equal('1, 2');
      });
    });
  });

  describe('[Function handleErrors]', () => {
    describe('functionality:', () => {
      it('should not throw an error when errors array is empty', () => {
        expect(handleErrors('first', 'second', { errors: [] })).to.be.ok;
      });

      it('should throw an error message when errors array has length', () => {
        const stub = sinon.stub(console, 'error');
        const err = 'test';
        expect(() =>
          handleErrors('first', 'second', { errors: [err] })
        ).to.throw('Invalid TimeSystem Configuration, see logs');
        expect(stub).to.have.calledWith('Configuration Error: ', err);
        stub.restore();
      });

      it('should return an object of input, system, and errors when there are no errors', () => {
        expect(handleErrors('first', 'second', { errors: [] })).to.eql({
          input: undefined,
          errors: [],
          system: undefined,
        });
      });
    });

    describe('errors:', () => {
      it('should throw an error with no args', () => {
        expect(() => handleErrors()).to.throw();
      });
      it('should throw an error with one arg', () => {
        testCases.forEach((testCase) => {
          expect(() => handleErrors(testCase)).to.throw();
        });
      });
      it('should throw an error with two args', () => {
        testCases.forEach((testCase) => {
          expect(() => handleErrors(testCase, testCase)).to.throw();
        });
      });
      it('should throw an error with three invalid args', () => {
        testCases.forEach((testCase) => {
          expect(() => handleErrors(testCase, testCase, testCase)).to.throw();
        });
      });
      it('should throw an error when the first arg is not a string', () => {
        testCases
          .filter((testCase) => typeof testCase !== 'string')
          .forEach((testCase) => {
            expect(() =>
              handleErrors(testCase, 'test', { errors: [] })
            ).to.throw(
              `First arg is of type "${typeof testCase}" and not a string`
            );
          });
      });
      it('should throw an error when the second arg is not a string', () => {
        testCases
          .filter((testCase) => typeof testCase !== 'string')
          .forEach((testCase) => {
            expect(() =>
              handleErrors('test', testCase, { errors: [] })
            ).to.throw(
              `Second arg is of type "${typeof testCase}" and not a string`
            );
          });
      });
    });
  });

  describe('[Function handleConfigErrors]', () => {
    describe('functionality:', () => {
      it('should not throw an error when errors array is empty', () => {
        expect(handleConfigErrors({ errors: [] })).to.be.ok;
      });

      it('should throw an error message when errors array has length', () => {
        const stub = sinon.stub(console, 'error');
        const err = 'test';

        expect(() => handleConfigErrors({ errors: [err] })).to.throw(
          'Invalid TimeSystem Configuration, see logs'
        );
        expect(stub).to.have.calledWith('Configuration Error: ', err);

        stub.restore();
      });

      it('should return an object of input, system, and errors when there are no errors', () => {
        expect(handleConfigErrors({ errors: [] })).to.eql({
          input: undefined,
          errors: [],
          system: undefined,
        });
      });
    });

    describe('errors:', () => {
      it('should throw an error with no args', () => {
        expect(() => handleConfigErrors()).to.throw();
      });
      it('should throw an error with invalid args', () => {
        testCases.forEach((testCase) => {
          expect(() => handleConfigErrors(testCase)).to.throw();
        });
      });
      it('should throw an error when object.errors is invalid', () => {
        const _testCases = testCases.map((testCase) => ({ error: testCase }));
        _testCases.forEach((testCase) => {
          expect(() => handleConfigErrors(testCase)).to.throw();
        });
      });
    });
  });

  describe('[Function maybeCallWithContext]', () => {
    describe('functionality:', () => {
      it("should return the same second argument if it's not a function", () => {
        testCases
          .filter((testCase) => typeof testCase != 'function')
          .forEach((testCase) => {
            expect(maybeCallWithContext({}, testCase)).to.equal(testCase);
          });
      });
      it('should invoke the maybeFn with a context', () => {
        const ctx = {};
        const fake = sinon.fake(() => {});
        expect(fake).to.not.have.been.called;
        maybeCallWithContext(ctx, fake);
        expect(fake).to.have.been.calledOnce;
      });
    });

    describe('errors:', () => {
      it('should throw an error when no arg is passed', () => {
        expect(() => maybeCallWithContext()).to.throw(
          'ctx is not a Constructor'
        );
      });

      it('should throw an error if first arg is not an object', () => {
        testCases
          .filter(
            (testCase) =>
              typeof testCase !== 'function' && typeof testCase !== 'object'
          )
          .forEach((testCase) => {
            expect(() => maybeCallWithContext(testCase, () => {})).to.throw(
              'ctx is not an object'
            );
          });
      });
    });
  });
});

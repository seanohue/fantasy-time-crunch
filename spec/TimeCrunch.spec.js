const TimeCrunch = require('../lib/TimeCrunch');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const {
  getExampleTime,
  CONFIGURATION_ERROR_MESSAGE,
  ERROR_MESSAGE,
} = require('./_test-helpers');

chai.use(sinonChai);

let timeCrunch = new TimeCrunch(getExampleTime());

describe('TimeCrunch Class', () => {
  beforeEach(() => {
    timeCrunch = new TimeCrunch(getExampleTime());
  });

  describe('[Constructor]', () => {
    describe('functionality:', () => {
      it('should be constructable with valid object', () => {
        expect(timeCrunch).to.be.instanceOf(TimeCrunch);
        expect(timeCrunch.system).to.be.a('object');
        expect(timeCrunch.system.tickUnit).to.eql('second');
        expect(timeCrunch.system.units).to.be.a('object');
        expect(timeCrunch.system.units).to.haveOwnProperty('second');
        expect(timeCrunch.system.units).to.haveOwnProperty('minute');
        expect(timeCrunch.system.units).to.haveOwnProperty('hour');
        expect(timeCrunch.system.units).to.haveOwnProperty('day');
        expect(timeCrunch.system.units).to.haveOwnProperty('month');

        expect(timeCrunch.time).to.be.a('object');
        expect(timeCrunch.time).to.haveOwnProperty('second');
        expect(timeCrunch.time).to.haveOwnProperty('minute');
        expect(timeCrunch.time).to.haveOwnProperty('hour');
        expect(timeCrunch.time).to.haveOwnProperty('day');
        expect(timeCrunch.time).to.haveOwnProperty('month');

        expect(timeCrunch.errors).to.be.a('array');
      });
    });

    describe('errors:', () => {
      it('should error on missing config', () => {
        expect(() => new TimeCrunch()).to.throw('No config provided.');
        expect(() => new TimeCrunch({})).to.throw('No config provided.');
      });
    });
  });

  describe('[Method tick]', () => {
    describe('functionality:', () => {
      it('should increment tickUnit w/o args', () => {
        expect(timeCrunch.tick).to.be.a('function');

        timeCrunch.tick();
        expect(timeCrunch.time.second).to.equal(1);
        timeCrunch.tick();
        expect(timeCrunch.time.second).to.equal(2);
      });

      it('should increment a unit if specified', () => {
        timeCrunch.tick('minute');
        expect(timeCrunch.time.minute).to.equal(1);
        timeCrunch.tick('minute');
        expect(timeCrunch.time.minute).to.equal(2);
      });

      it('should increment a unit by a specific amount if specified', () => {
        timeCrunch.tick('day', 7);
        expect(timeCrunch.time.day).to.equal(7);
      });

      it('should call onIncrement if defined', () => {
        const config = getExampleTime();
        sinon.spy(config.hour, 'onIncrement');
        const timecrunch = new TimeCrunch(config);

        timecrunch.tick('hour');
        expect(config.hour.onIncrement).to.have.been.called;
      });

      it('should call optimizedIncrement when tick.id is not defined', () => {
        const stub = sinon.spy(timeCrunch, 'optimizedIncrement');
        timeCrunch.tick(null);
        expect(stub).to.have.been.called;
        stub.restore();
      });

      it('should call getUnit', () => {
        const stub = sinon.spy(timeCrunch, 'getUnit');
        timeCrunch.tick();
        expect(stub).to.have.been.called;
        stub.restore();
      });
    });

    describe('errors:', () => {
      it('should throw if there is not one tick', () => {
        const stub = sinon.stub(console, 'error');
        expect(
          () =>
            new TimeCrunch(
              getExampleTime({
                second: {
                  makes: { minute: 60 },
                },
              })
            )
        ).to.throw(ERROR_MESSAGE);

        expect(stub).to.be.calledWith(
          CONFIGURATION_ERROR_MESSAGE,
          "You need one and only one 'tick' defined. Found 0."
        );
        stub.restore();
      });

      it('should throw if tick.id and system.tickUnit is not defined', () => {
        timeCrunch.system.tickUnit = null;
        expect(() => timeCrunch.tick(null)).to.throw('No tickUnit found!');
      });

      it('should throw when getUnit returns an unknown unit', () => {
        const stub = sinon.stub(timeCrunch, 'getUnit').returns(null);

        expect(() => timeCrunch.tick()).to.throw(
          'No such unit in system: null. Units include: second, minute, hour, day, month'
        );

        expect(() => timeCrunch.tick('second')).to.throw(
          'No such unit in system: second. Units include: second, minute, hour, day, month'
        );

        expect(stub).to.have.been.called;
        stub.restore();
      });
    });
  });

  describe('[Method increment]', () => {
    describe('functionality', () => {
      it('should take three valid args', () => {
        expect(timeCrunch.increment(1, {}, 1)).to.be.ok;
      });

      it('should call tick with the next unit when time is at max value', () => {
        const stub = sinon.stub(timeCrunch, 'tick');
        expect(
          timeCrunch.increment(
            'minute',
            { makes: { hour: 60 }, id: 'minute', next: 'hour', max: 60 },
            61
          )
        );
        expect(stub).to.have.been.calledWith('hour');
        stub.restore();
      });

      it('should return the same instance of TimeCrunch', () => {
        expect(timeCrunch.increment(1, {}, 1)).to.eql(timeCrunch);
      });
    });

    describe('errors:', () => {
      it('should throw if unit parameter is not valid', () => {
        expect(() => timeCrunch.increment(1, 2)).to.throw(
          'Invalid argument: 2 - unit must be an object'
        );
      });

      it('should throw if amount parameter is not valid', () => {
        expect(() => timeCrunch.increment(1, {}, null)).to.throw(
          'Invalid argument: null - amount must be a number'
        );
      });
    });
  });

  describe('[Method optimizedIncrement]', () => {
    describe('functionality', () => {
      it('should take two valid args', () => {
        expect(timeCrunch.optimizedIncrement(null, {})).to.be.ok;
      });

      it('should call tick with the next unit when time is at max value', () => {
        const stub = sinon.stub(timeCrunch, 'tick');
        expect(
          timeCrunch.optimizedIncrement('minute', {
            makes: { hour: 60 },
            id: 'minute',
            next: 'hour',
            max: 0,
          })
        );
        expect(stub).to.have.been.calledWith('hour');
        stub.restore();
      });

      it('should return the same instance of TimeCrunch', () => {
        expect(timeCrunch.optimizedIncrement(1, {})).to.eql(timeCrunch);
      });
    });

    describe('errors:', () => {
      it('should throw if unit parameter is not valid', () => {
        expect(() => timeCrunch.optimizedIncrement(1, 2)).to.throw(
          'Invalid argument: 2 - unit must be an object'
        );
        expect(() => timeCrunch.optimizedIncrement(1, null)).to.throw(
          'Invalid argument: null - unit must be an object'
        );
      });
    });
  });
});

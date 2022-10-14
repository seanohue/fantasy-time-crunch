const TimeCrunch = require('../lib/TimeCrunch');
const chai = require('chai');
const { expect } = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const getExampleTime = require('./_test-helpers');

chai.use(sinonChai);

describe('TimeCrunch', () => {
  it('should be constructable', () => {
    const timecrunch = new TimeCrunch(getExampleTime());
    expect(timecrunch).to.be.an('object');
  });

  describe('validation', () => {
    it('should error on missing config', () => {
      expect(() => new TimeCrunch()).to.throw('No config provided.');
    });
  });

  describe('#tick', () => {
    it('should increment tickUnit w/o args', () => {
      const timecrunch = new TimeCrunch(getExampleTime());
      expect(timecrunch.tick).to.be.a('function');

      timecrunch.tick();
      expect(timecrunch.time.second).to.equal(1);
      timecrunch.tick();
      expect(timecrunch.time.second).to.equal(2);
    });

    it('should increment a unit if specified', () => {
      const timecrunch = new TimeCrunch(getExampleTime());

      timecrunch.tick('minute');
      expect(timecrunch.time.minute).to.equal(1);
      timecrunch.tick('minute');
      expect(timecrunch.time.minute).to.equal(2);
    });

    it('should increment a unit by a specific amount if specified', () => {
      const timecrunch = new TimeCrunch(getExampleTime());

      timecrunch.tick('day', 7);
      expect(timecrunch.time.day).to.equal(7);
    });

    it('should call onIncrement if defined', () => {
      const config = getExampleTime();
      sinon.spy(config.hour, 'onIncrement');
      const timecrunch = new TimeCrunch(config);

      timecrunch.tick('hour');
      expect(config.hour.onIncrement).to.have.been.called;
    });
  });
});

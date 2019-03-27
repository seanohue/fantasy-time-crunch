const TimeCrunch = require('../lib/TimeCrunch');
const chai = require('chai')
const {expect} = chai;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

describe('TimeCrunch', () => {
  it('should be constructable', () => {
    const timecrunch = new TimeCrunch(getExampleTime());
    expect(timecrunch).to.be.an('object');
  });

  describe('validation', () => {
    it('should error on missing config', () => {
      expect(() => new TimeCrunch()).to.throw;
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

const getExampleTime = () => ({
  // One and only one unit is the smallest measured subdivision of time, defined as a 'tick'
  second: {
    tick: true,
    makes: {minute: 60},
  },

  // Larger units are defined by how many of a smaller unit they are subdivided into
  minute: {
    makes: {hour: 60},
  },

  // Optionally one can define a function to be called when
  // a unit increments (having a bell toll, etc.)
  hour: {
    makes: {day: 24},
    onIncrement() {
      console.log('BING!');
      console.log('Hour: ', this.time.hour);
    },
    // Units can be divided into multiple state changes. For example, a day has two or more states defined
    // by how many hours have passed.
    // 'states' can be an object or a function.
    // In this case, dawn and dusk are different depending
    // on the season
    states() {
      if (this.states.is('winter')) {
        return {
          day: 9, // 0900 -- by default this number represents hours. however, each property returned can also be a function that has access to any time unit.
          night: 20, // 2000
        };
      }
      return {
        day: 6, // 0900
        night: 23, // 2200
      };
    }
  },


  day: {
    makes() {
      const days = this.time.month % 2 ? 31 : 30;
      return {month: days};
    },
    onIncrement() {
      const names = 'MTWHFSU';
      console.log('Day:', names[this.time.day]);
    },
  },
  month: {
    // The 'of' property can also be a function called
    // In this case, even months have 30 days and odd have 31.
    makes: { year: 12},

    // For simpler state changes, an object marking the
    // transitional thresholds is fine.
    states: {
      winter: 11,
      spring: 3,
      summer: 5,
      fall: 9
    }
  }
});
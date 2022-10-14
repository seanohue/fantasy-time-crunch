const getExampleTime = () => ({
  // One and only one unit is the smallest measured subdivision of time, defined as a 'tick'
  second: {
    tick: true,
    makes: { minute: 60 },
  },

  // Larger units are defined by how many of a smaller unit they are subdivided into
  minute: {
    makes: { hour: 60 },
  },

  // Optionally one can define a function to be called when
  // a unit increments (having a bell toll, etc.)
  hour: {
    makes: { day: 24 },
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
    },
  },

  day: {
    makes() {
      const days = this.time.month % 2 ? 31 : 30;
      return { month: days };
    },
    onIncrement() {
      const names = 'MTWHFSU';
      console.log('Day:', names[this.time.day]);
    },
  },
  month: {
    // The 'of' property can also be a function called
    // In this case, even months have 30 days and odd have 31.
    makes: { year: 12 },

    // For simpler state changes, an object marking the
    // transitional thresholds is fine.
    states: {
      winter: 11,
      spring: 3,
      summer: 5,
      fall: 9,
    },
  },
});

module.exports = getExampleTime;

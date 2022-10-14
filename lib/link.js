const _ = require('lodash');
const { maybeCallWithContext } = require('./utils');

// Linking time units
const link = _.flow(buildTime, buildSystemUnits, linkToNext);

function buildTime({ input, system, errors }) {
  const time = _.reduce(
    input,
    (time, unit) => {
      const id = unit.id;
      time[id] = 0;
      return time;
    },
    {}
  );
  return { input, system, errors, time };
}

function buildSystemUnits({ input, system, errors, time }) {
  system.units = _.reduce(
    input,
    (units, unit) => {
      const id = unit.id;
      units[id] = Object.assign({}, unit);
      return units;
    },
    {}
  );

  return { input, system, errors, time };
}

function linkToNext({ input, system, errors, time }) {
  system.units = _.mapValues(system.units, (unit) => {
    const makes = maybeCallWithContext({ system, time }, unit.makes);
    const makeUnits = unit.makes && _.keys(unit.makes);

    const next = _.first(makeUnits);
    const max = maybeCallWithContext({ system, time }, unit.makes[next]);

    return _.assign(unit, { next, max });
  });

  return { input, system, errors, time };
}

module.exports = {
  link,
};

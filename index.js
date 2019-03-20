const _ = require('lodash');

// Utils
const createIdList = _.flow(
  _.partialRight(_.map, 'id'),
  _.partialRight(_.join, ', ')
);

// Config Validation
const handleConfigErrors = _.partial(
  handleErrors,
  'Configuration Error',
  'Invalid TimeSystem Configuration'
);

const validate = _.flow(
  validateTick,
  validateMakes,
  validateHooks,
  handleConfigErrors
);

function validateTick({errors, system, input}) {
  const ticks = _.filter(input, 'tick');
  if (ticks.length !== 1) {
    let message = `You need one and only one 'tick' defined. Found ${ticks.length}.`;
    if (ticks.length) {
      message += ` Found: ${createIdList(ticks)}`;
    }
    errors.push(message);
  }

  const tick = _.first(ticks);
  if (tick) system.tickUnit = tick.id;

  return {errors, system, input};
}

function validateMakes({errors, system, input}) {
  const noMakes = _.reject(input, 'makes');
  if (noMakes.length > 1) {
    let message = `You should have no more than one defined time unit that does not make up a larger time unit. Found: ${createIdList(noMakes)}`;
    errors.push(message);
  }
  return {errors, system, input};
}

function validateHooks({errors, system, input}) {
  const hasNonFnHook = _.reject(input, (time) => _.isNil(time.onIncrement) || _.isFunction(time.onIncrement));

  if (hasNonFnHook.length) {
    console.log(hasNonFnHook);

    let message = `Expected a function for all uses of 'onIncrement'. Exceptions include ${createIdList(hasNonFnHook)}.`;
    errors.push(message);
  }

  return {errors, system, input};
}

// Linking time units
const link = _.flow(
  buildTime,
  buildSystemUnits,
  linkToNext
);

function buildTime({input, system, errors}) {
  const time = _.reduce(input, (time, unit) => {
    const id = unit.id;
    time[id] = 0;
    return time;
  }, {});
  return {input, system, errors, time}
}

function buildSystemUnits({input, system, errors, time}) {
  system.units = _.reduce(input, (units, unit) => {
    const id = unit.id;
    units[id] = Object.assign({}, unit);
    return units;
  }, {});
  return {input, system, errors, time};
}

function linkToNext({input, system, errors, time}) {
  system.units = _.mapValues(system.units, (unit) => {
    const makes = maybeCallWithContext({system, time}, unit.makes)
    const makeUnits = unit.makes && _.keys(unit.makes);

    const next = _.first(makeUnits);
    const max  = maybeCallWithContext({system, time}, unit.makes[next]);

    return _.assign(unit, {next, max});
  });

  return {input, system, errors, time};
}

function maybeCallWithContext(ctx, maybeFn) {
  return _.isFunction(maybeFn)
    ? maybeFn.call(_.assign({}, ctx))
    : maybeFn;
}

module.exports = class TimeCrunch {
  constructor(def) {
    const timeSystem = _.map(def, (val, id) => _.assign({}, val, {id}));

    const seed = {errors: [], system: {}, input: timeSystem};
    const {errors, system, time} = link(validate(seed));
    this.system = system;
    this.time = time;
  }

  tick(id, amount = 1) {
    if (_.isNil(id)) {
      return this.tick(this.system.tickUnit);
    }
    const unit = this.system.units[id];
    if (!unit) throw new Error(`No such unit in system: ${id}, units include: ${createIdList(this.system.units)}`);

    this.time[id] ++;
    const max  = maybeCallWithContext(this, unit.max);
    const next = maybeCallWithContext(this, unit.next);
    if (this.time[id] >= max) {
      this.time[id] = 0;
      this.tick(next);
    }

    if (unit.onIncrement) {
      unit.onIncrement.call(this);
    }
    return this;
  }

  static define(def) {
    return new TimeCrunch(def);
  }
}

// Generic Error handling...
function handleErrors(label, message, {system, input, errors}) {
  if (errors.length) {
    _.each(errors, err => console.error('Configuration Error: ', err));
    throw new Error('Invalid TimeSystem Configuration, see logs.');
  }
  return {system, input, errors};
}

const t = TimeCrunch.define(time);
setInterval(() => {
  t.tick();
  const {time} = t;
  if (time.day > 0) return;
  console.log(time);
}, 10);
const _ = require('lodash');
const { link } = require('./link');
const { validate } = require('./validate');
const { maybeCallWithContext, createIdList } = require('./utils');

module.exports = class TimeCrunch {
  constructor(def) {
    if (_.isNil(def) || _.isEmpty(def)) {
      throw Error('No config provided.');
    }

    const timeSystem = _.map(def, (val, id) => _.assign({}, val, { id }));

    const seed = { errors: [], system: {}, input: timeSystem };
    const { errors, system, time } = link(validate(seed));
    this.system = system;
    this.time = time;
    this.errors = errors;
  }

  tick(id, amount = 1) {
    if (_.isNil(id)) {
      const tickUnit = this.system.tickUnit;
      if (!tickUnit) throw Error('No tickUnit found!');
      const unit = this.getUnit(tickUnit);
      if (!unit)
        throw new Error(
          `No such unit in system: ${unit}. Units include: ${createIdList(
            this.system.units
          )}`
        );
      return this.optimizedIncrement(tickUnit, unit);
    }

    const unit = this.getUnit(id);
    if (!unit)
      throw new Error(
        `No such unit in system: ${id}. Units include: ${createIdList(
          this.system.units
        )}`
      );
    return this.increment(id, unit, amount);
  }

  increment(id, unit, amount) {
    if (_.isNil(unit) || !_.isPlainObject(unit)) {
      throw Error(`Invalid argument: ${unit} - unit must be an object`);
    }

    if (!_.isInteger(amount)) {
      throw Error(`Invalid argument: ${amount} - amount must be a number`);
    }

    this.time[id] += amount;

    const max = maybeCallWithContext(this, unit.max);

    if (this.time[id] >= max) {
      const next = maybeCallWithContext(this, unit.next);
      this.time[id] = 0;
      this.tick(next);
    }
    if (unit.onIncrement) {
      unit.onIncrement.call(this);
    }
    return this;
  }

  optimizedIncrement(id, unit) {
    if (_.isNil(unit) || !_.isPlainObject(unit)) {
      throw Error(`Invalid argument: ${unit} - unit must be an object`);
    }

    this.time[id]++;

    const max = unit.max;
    if (this.time[id] >= max) {
      const next = unit.next;
      this.time[id] = 0;
      this.tick(next);
    }

    return this;
  }

  getUnit(id) {
    return this.system.units[id];
  }

  static define(def) {
    return new TimeCrunch(def);
  }
};

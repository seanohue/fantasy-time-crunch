const _ = require('lodash');
const { link } = require('./link');
const { validate } = require('./validate');
const { maybeCallWithContext, createIdList } = require('./utils');

module.exports = class TimeCrunch {
  constructor(def) {
    if (_.isNil(def) || _.isEmpty(def)) {
      throw Error("No config provided.");
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
      const id = this.system.tickUnit;
      if (!id) throw Error("No tickUnit found!");
      return this.optimizedIncrement(id, this.getUnit(id));
    }

    const unit = this.getUnit(id);
    if (!unit)
      throw new Error(
        `No such unit in system: ${id}, units include: ${createIdList(
          this.system.units
        )}`
      );
    return this.increment(id, unit, amount);
  }

  increment(id, unit, amount) {
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

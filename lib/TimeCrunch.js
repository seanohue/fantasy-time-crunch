const _ = require('lodash');
const {link} = require('./link');
const {validate} = require('./validate');
const {maybeCallWithContext} = require('./utils');

module.exports = class TimeCrunch {
  constructor(def) {
    const timeSystem = _.map(def, (val, id) => _.assign({}, val, {id}));

    const seed = {errors: [], system: {}, input: timeSystem};
    const {errors, system, time} = link(validate(seed));
    this.system = system;
    this.time = time;
    this.errors = errors;
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

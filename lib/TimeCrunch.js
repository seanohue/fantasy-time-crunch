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

  getState(id) {
    const states = this.system.units[id].states;
    if (!states) {
      throw new Error(`Invalid Time unit of '${id}'`);
    }
    const currentTime = this.time[id] ?? 0;
    const sortedStates = Object.entries(states)
      .map(([stateName, stateValue]) => [
        stateName,
        maybeCallWithContext(this, stateValue),
      ])
      .sort(([, a], [, b]) => a - b);

    if (sortedStates.length === 1) {
      return sortedStates[0][0];
    }

    if (currentTime < sortedStates[0][1]) {
      return sortedStates[sortedStates.length - 1][0];
    }

    for (let i = 0; i < sortedStates.length; i++) {
      const [stateName, stateValue] = sortedStates[i];
      const nextState = sortedStates[i + 1];
      if (!nextState) {
        return stateName;
      }
      if (currentTime >= stateValue && currentTime < nextState[1]) {
        return stateName;
      }
    }

    throw new Error(`Invalid Time unit of '${id}'`);
  }

  synchronizeTime(timeToSync) {
    for (const [k, v] of Object.entries(timeToSync)) {
      this.time[k] = v;
    }
  }

  createUpdateObject() {
    const obj = {};
    for (const timeId of Object.keys(this.time)) {
      const time = timeId;
      obj[time] = this.getState(time) ?? null;
    }

    return {
      ...obj,
      time: this.getHumanTime(),
    };
  }

  getHumanTime() {
    const humanTime = {};
    for (const [timeId, timeValue] of Object.entries(this.time)) {
      humanTime[timeId] = (timeValue ?? 0) + 1;
    }
    return humanTime;
  }

  static define(def) {
    return new TimeCrunch(def);
  }
};

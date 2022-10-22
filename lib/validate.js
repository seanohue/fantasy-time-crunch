const _ = require('lodash');

const { handleConfigErrors, createIdList } = require('./utils');

const validate = _.flow(
  validateParameters,
  validateTick,
  validateMakes,
  validateHooks,
  handleConfigErrors
);

function validateParameters({ errors, system, input }) {
  if (!_.isArray(errors)) {
    throw Error(
      `Invalid errors property. Must be an array but got a ${typeof errors}`
    );
  }
  // validate shape of input to make sure values are correct
  if (!_.isArray(input)) {
    const message = `Invalid input property. Must be an array but got a ${typeof input}`;
    errors.push(message);
  } else if (input.length) {
    input.forEach((value) => {
      const jsonValue = JSON.stringify(value);
      // validate id is string or number
      if (_.isNil(value.id)) {
        const message = `Id is not defined. ${jsonValue}`;
        errors.push(message);
      } else if (!(_.isNumber(value.id) || _.isString(value.id))) {
        const message = `Id is not a string or number. ${jsonValue}`;
        errors.push(message);
      }

      // validate tick is a boolean
      if (_.has(value, 'tick') && !_.isBoolean(value.tick)) {
        const message = `Tick must be a boolean. ${jsonValue}`;
        errors.push(message);
      }

      // validate makes is an object or a function
      if (
        _.has(value, 'makes') &&
        !(_.isFunction(value.makes) || _.isPlainObject(value.makes))
      ) {
        const message = 'Makes must be a plain object or a function';
        errors.push(message);
      }
      // validate states is an object or function
      if (
        _.has(value, 'states') &&
        !(_.isFunction(value.states) || _.isPlainObject(value.states))
      ) {
        const message = 'States must be a plain object or a function';
        errors.push(message);
      }

      // validate onIncrement is a function
      if (_.has(value, 'onIncrement') && !_.isFunction(value.onIncrement)) {
        const message = 'onIncrement must be a function';
        errors.push(message);
      }
    });
  }

  if (
    typeof system !== 'object' ||
    system instanceof Array ||
    system instanceof Set ||
    system instanceof Map
  ) {
    const message = `Invalid system property. Must be an object but got a "${String(
      system
    )}"`;
    errors.push(message);
  }
  return { errors, system, input };
}

function validateTick({ errors, system, input }) {
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

  return { errors, system, input };
}

function validateMakes({ errors, system, input }) {
  const noMakes = _.reject(input, 'makes');
  if (noMakes.length > 1) {
    let message = `You should have no more than one defined time unit that does not make up a larger time unit. Found: ${createIdList(
      noMakes
    )}`;
    errors.push(message);
  }
  return { errors, system, input };
}

function validateHooks({ errors, system, input }) {
  const hasNonFnHook = _.reject(
    input,
    (time) => _.isNil(time.onIncrement) || _.isFunction(time.onIncrement)
  );

  if (hasNonFnHook.length) {
    let message = `Expected a function for all uses of 'onIncrement'. Exceptions include ${createIdList(
      hasNonFnHook
    )}.`;
    errors.push(message);
  }

  return { errors, system, input };
}

module.exports = {
  validate,
};

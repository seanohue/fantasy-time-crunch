const _ = require('lodash');

const {handleConfigErrors, createIdList} = require('./utils');

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

module.exports = {
  validate,
}
const _ = require('lodash');

const createIdList = _.flow(
  _.partialRight(_.map, 'id'),
  _.partialRight(_.join, ', ')
);

function maybeCallWithContext(ctx, maybeFn) {
  return _.isFunction(maybeFn)
    ? maybeFn.call(_.assign({}, ctx))
    : maybeFn;
}

// Config Validation
const handleConfigErrors = _.partial(
  handleErrors,
  'Configuration Error',
  'Invalid TimeSystem Configuration'
);

// Generic Error handling...
function handleErrors(label, message, {system, input, errors}) {
  if (errors.length) {
    _.each(errors, err => console.error('Configuration Error: ', err));
    throw new Error('Invalid TimeSystem Configuration, see logs.');
  }
  return {system, input, errors};
}

module.exports = {
  createIdList, 
  handleConfigErrors,
  handleErrors,
  maybeCallWithContext
}
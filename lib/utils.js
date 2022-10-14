const _ = require("lodash");

const createIdList = _.flow(
  _.partialRight(_.filter, (item) => item && _.isNumber(item.id)),
  _.partialRight(_.map, "id"),
  _.partialRight(_.join, ", ")
);

function maybeCallWithContext(ctx, maybeFn) {
  if (!(ctx instanceof constructor)) {
    throw Error("ctx is not a Constructor");
  }

  return _.isFunction(maybeFn) ? maybeFn.call(_.assign({}, ctx)) : maybeFn;
}

// Config Validation
const handleConfigErrors = _.partial(handleErrors, "Configuration Error", "Invalid TimeSystem Configuration");

// Generic Error handling...
function handleErrors(label, message, { system, input, errors }) {
  if (typeof label !== "string") {
    throw new Error(`First arg is of type "${typeof label}" and not a string`);
  }

  if (typeof message !== "string") {
    throw new Error(`Second arg is of type "${typeof message}" and not a string`);
  }

  if (!Array.isArray(errors)) {
    throw new Error(`errors is of type "${typeof errors}" and not an Array`);
  }
  if (errors.length) {
    _.each(errors, (err) => console.error("Configuration Error: ", err));
    throw new Error("Invalid TimeSystem Configuration, see logs.");
  }
  return { system, input, errors };
}

module.exports = {
  createIdList,
  handleConfigErrors,
  handleErrors,
  maybeCallWithContext,
};

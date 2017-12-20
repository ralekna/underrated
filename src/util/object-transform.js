module.exports = {
  underscoreToCamelCaseKeys,
  underscorizeKeys,
  traverseArray,
  trim,
  renameKey
};

function underscoreToCamelCaseKeys(object) {

  if (Array.isArray(object)) {
    return traverseArray(object, underscoreToCamelCaseKeys);
  }
  let keys = Object.keys(object);
  let transformedObject = {};

  keys.map(key => {
    let value = object[key];
    if (value !== null && typeof(value) === 'object') {
      if (Array.isArray(value)) {
        value = traverseArray(value, underscoreToCamelCaseKeys);
      } else {
        value = underscoreToCamelCaseKeys(value);
      }
    }
    transformedObject[camelCase(key)] = value;
  });

  return transformedObject;
}

function underscorizeKeys(object) {
  if (Array.isArray(object)) {
    return traverseArray(object, underscorizeKeys);
  }
  let keys = Object.keys(object);
  let transformedObject = {};

  keys.map(key => {
    let value = object[key];
    if (value !== null && typeof(value) === 'object') {
      if (Array.isArray(value)) {
        value = traverseArray(value, underscorizeKeys);
      } else {
        value = underscorizeKeys(value);
      }
    }
    transformedObject[underscore(key)] = value;
  });

  return transformedObject;
}

function renameKey(object, oldKey, newKey) {
  const value = object[oldKey];
  if (!value) {
    return object;
  }
  object[newKey] = value;
  delete object[oldKey];
  return object;
}

function traverseArray(array, transformationFunction) {
  return array.map(value => {
    if (value !== null && typeof(value) === 'object') {
      if (Array.isArray(value)) {
        return traverseArray(value, transformationFunction);
      } else {
        return transformationFunction(value);
      }
    } else {
      return value;
    }
  });
}

function camelCase(input) {
  return input.toLowerCase().replace(/_(.)/g, (match, group) => group.toUpperCase());
}

function underscore(input) {
  return input.replace(/([A-Z])/g, (x, y) => '_' + y.toLowerCase()).replace(/^_/, '');
}

function trim(object, ...fields) {
  return fields.reduce((copy, field) => {
    copy[field] = object[field];
    return copy;
  }, {});
}

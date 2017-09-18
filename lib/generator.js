'use strict';
const pathToRegex = require('path-to-regexp');

const j2s = require('joi-to-swagger');
const each = require('lodash/each');
const pick = require('lodash/pick');
const get = require('lodash/get');
const some = require('lodash/some');
const mapValues = require('lodash/mapValues');
const cloneDeep = require('lodash/cloneDeep');

const captureRegex = /(:\w+)/g;

const JSON_SCHEMA_FIELDS = [
  'type', 'required',

  'maximum', 'exclusiveMaximum', 'minimum', 'exclusiveMinimum',
  'maxLength', 'minLength', /*'pattern',*/ 'maxItems', 'minItems',
  'uniqueItems', 'enum', 'multipleOf'
];

const JSON_SCHEMA_NESTED_FIELDS = [
  'items', 'allOf', 'properties', 'additionalProperties'
];

function isRouter(router) {
  return router.routes && router.use;
}

exports.mergeSwaggerPaths = function mergeSwaggerPaths(paths, newPaths, options) {
  const warn = options && options.warnFunc;

  each(newPaths, function(newPathItemObj, path) {
    let pathItemObj = paths[path] = paths[path] || {};

    // Merge operations into path
    each(newPathItemObj, function(operationObj, method) {
      if (pathItemObj[method]) {
        // already exists!
        if(warn) warn(`${path}[${method}] exists in multiple routes`);
        return;
      }

      pathItemObj[method] = operationObj;
    });
  });

  return paths;
};

exports.routesToSwaggerPaths = function routesToSwaggerPaths(routes, options) {
  let paths = {};

  routes.forEach(function(route) {
    let routePaths = exports.routeToSwaggerPaths(route, options);

    exports.mergeSwaggerPaths(paths, routePaths, options);
  });

  return paths;
};

/**
 * For a given joi-router route, return an array of Swagger paths.
 * @param {object} route
 * @returns {object[]} paths
 */
exports.routeToSwaggerPaths = function routeToSwaggerPaths(route, options) {
  options = options || {};

  let paths = {};
  let routeDesc = {
    responses: cloneDeep(options.defaultResponses) || {}
  };

  if (route.validate) {
    let type = route.validate.type;

    if (!type) {
      // do nothing
    } else if (type === 'json') {
      routeDesc.consumes = ['application/json'];
    } else if (type === 'form') {
      routeDesc.consumes = ['application/x-www-form-urlencoded'];
    } else if (type === 'multipart') {
      routeDesc.consumes = ['multipart/form-data'];
    }

    routeDesc.parameters = exports.validateToSwaggerParameters(route.validate);

    // add responses from output schema
    let output = route.output || route.validate.output;
    if (output) {
      Object.keys(output).forEach(x => {
        x = x.toString();
        // 200,206,300
        let respCodes = x.split(',');
        respCodes.forEach(code => {
          // 200-299
          if (code.includes('-')) {
            code = code.split('-')[0];
          }
          code = code.trim();
          routeDesc.responses[code] = outputToSwagger(output[x]);
        });
      });
    }
  }

  if (route.meta && route.meta.swagger) {
    Object.assign(routeDesc, route.meta.swagger);
  }

  // This sets default 'path' parameters so swagger-ui doesn't complain.
  let noPathParamsExist = !some(routeDesc.parameters, ['in', 'path']);
  let noPathValidatorExists = get(route, 'validate.path') === undefined;
  if(noPathParamsExist && noPathValidatorExists){
    routeDesc.parameters = routeDesc.parameters || [];
    let pathCaptures = route.path.match(captureRegex);
    if (pathCaptures) {
      each(pathCaptures, function(pathParameter){
        routeDesc.parameters.push({
          name: pathParameter.replace(':',''),
          in: 'path',
          type: 'string',
          required: true
        });
      });
    }
  }

  let path = exports.swaggerizePath(route.path);

  if (options.prefix) {
    if (options.prefix.endsWith('/') || path.startsWith('/')) {
      path = `${options.prefix}${path}`;
    } else {
      path = `${options.prefix}/${path}`;
    }
  }

  let pathItemObj = paths[path] = {};

  let methods = Array.isArray(route.method) ? route.method : [route.method];

  methods.forEach(function (method) {
    let operationObj = routeDesc;
    pathItemObj[method.toLowerCase()] = operationObj;
  });

  return paths;
};

function addSchemaParameters(parameters, location, schema) {
  let swaggerObject = j2s(schema).swagger;
  if (swaggerObject.type === 'object' && swaggerObject.properties) {
    each(swaggerObject.properties, function(value, name) {
      if (value.type === 'string' && value.format === 'binary') {
        value.type = 'file';
        delete value.format;
      }
      let parameter = value;
      parameter.name = name;
      parameter.in = location;
      parameters.push(parameter);
    });
  }
}

function outputToSwagger (respJson) {
  let obj = {};
  if (respJson && respJson.body) {
    obj.schema = j2s(respJson.body).swagger;
    obj.description = respJson.schema || obj.schema.description || 'Success';
  }
  return obj;
}

/**
 * Convert a JSON schema object to the subset used by Swagger
 */
exports.jsonSchemaToSwagger = function(jsonSchema) {
  if (Array.isArray(jsonSchema)) {
    return jsonSchema.map(exports.jsonSchemaToSwagger);
  }

  let schema = pick(jsonSchema, JSON_SCHEMA_FIELDS);

  if (jsonSchema.items) {
    // FIXME HACK
    if (Array.isArray(jsonSchema.items)) {
      jsonSchema.items = jsonSchema.items[0];
    }

    schema.items = exports.jsonSchemaToSwagger(jsonSchema.items);
  }

  if (jsonSchema.properties) {
    schema.properties = mapValues(jsonSchema.properties, function(value) {
      return exports.jsonSchemaToSwagger(value);
    });
  }

  return schema;
};

/**
 * Convert joi-router validate object to swagger
 */
exports.validateToSwaggerParameters = function(validate) {
  let parameters = [];

  if (validate.header) {
    addSchemaParameters(parameters, 'header', validate.header);
  }

  if (validate.query) {
    addSchemaParameters(parameters, 'query', validate.query);
  }

  if (validate.path) {
    // TODO: Write about in README.md
    addSchemaParameters(parameters, 'path', validate.path);
  }

  if (validate.formData) {
    addSchemaParameters(parameters, 'formData', validate.formData);
  }

  if (validate.body) {
    let swaggerSchema = j2s(validate.body).swagger;
    parameters.push({
      name: 'body',
      in: 'body',
      schema: swaggerSchema
    });
  }
  return parameters;
};

/* Convert a joi-router path into a Swagger parameterized path,
 * e.g. /users/:userId becomes /users/{userId}
 *
 * FIXME: incomplete handling, escaping, etc
 * FIXME: throw error if a complex regex is used
 */
exports.swaggerizePath = function swaggerizePath(path, options) {
  let pathTokens = pathToRegex.parse(path);

  let segments = pathTokens.map(function (token) {
    let segment = token;

    if (token.name) {
      segment = `{${token.name}}`; //this means this is a complex regex group. for more info, read up on path-to-regexp, koa-joi-router uses it, it's great.
    } else {
      segment = token.replace('/',''); //remove leading slash, to handle things like complex routes: /users/:userId/friends/:friendId
    }

    return segment;
  });

  return '/'+segments.join('/'); //path is normalized, just add that leading slash back to handle prefixes properly again.
};

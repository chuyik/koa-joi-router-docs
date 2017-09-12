'use strict';
const assert = require('power-assert');
const Router = require('koa-joi-router')
const Joi = Router.Joi

const { SwaggerAPI } = require('../');

describe('API', function () {
  it('should success with valid data', function () {
    const generator = new SwaggerAPI();

    const router = Router()

    router.get('/signup', {
      meta: {
        swagger: {
          summary: 'User Signup'
        }
      },
      validate: {
        type: 'json',
        body: {
          username: Joi.string().alphanum().min(3).max(30).required()
        },
        output: {
          200: {
            body: {
              userId: Joi.string().description('Newly created user id')
            }
          }
        }
      },
      handler: async() => {}
    })

    generator.addJoiRouter(router);

    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/api'
    })
    assert(['info', 'basePath', 'swagger', 'paths', 'tags'].every(v => v in spec))
  });
});

describe('API', function () {
  it('should success with empty defaultResponses', function () {
    const generator = new SwaggerAPI();

    const router = Router()

    router.get('/no_200', {
      meta: {
        swagger: {
          summary: 'no 200 doc'
        }
      },
      validate: {
        type: 'json',
        body: {
          hello: Joi.string().valid('world')
        },
        output: {
          204: {
            body: {
              id: Joi.number().integer()
            }
          }
        }
      },
      handler: async() => {}
    })

    generator.addJoiRouter(router);

    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/api'
    },{defaultResponses: {}})
    assert(!('200' in spec.paths['/no_200'].get.responses))
  });
});

describe('API', function () {
  it('should success with custom output', function () {
    const generator = new SwaggerAPI();

    const router = Router()

    router.get('/custom_output', {
      niconiconi: {
        204: {
          body: {
            id: Joi.number().integer()
          }
        }
      },
      meta: {
        swagger: {
          summary: 'custom output doc'
        }
      },
      validate: {
        type: 'json',
        body: {
          hello: Joi.string().valid('world')
        }
      },
      handler: async() => {}
    })

    generator.addJoiRouter(router);

    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/api'
    },{outputFunc: route => route.niconiconi})
    assert('204' in spec.paths['/custom_output'].get.responses)
  });
});
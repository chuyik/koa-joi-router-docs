const assert = require('power-assert');
const Router = require('@niche-and-services/koa-joi-router');
const Joi = Router.Joi;

const { SwaggerAPI } = require('../');

describe('API', function () {
  it('should success with valid data', function () {
    const generator = new SwaggerAPI();
    const router = Router();

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
      handler: () => {
      }
    });

    generator.addJoiRouter(router);
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/'
    });
    assert(['info', 'basePath', 'swagger', 'paths', 'tags'].every(v => v in spec));
  });

  it('should success with empty default response', function () {
    const generator = new SwaggerAPI();
    const router = Router();

    router.get('/empty-default-response', {
      validate: {
        output: {
          201: {
            body: {
              ok: Joi.bool()
            }
          }
        }
      },
      handler: () => {
      }
    });

    generator.addJoiRouter(router);
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/'
    }, { defaultResponses: null });
    assert(!('200' in spec.paths['/empty-default-response'].get.responses));
  });

  it('should success with output placed outside of validate', function () {
    const generator = new SwaggerAPI();
    const router = Router();

    router.get('/output-outside-validate', {
      validate: {
        output: {
          201: {
            body: {
              ok: Joi.bool()
            }
          }
        }
      },
      handler: () => {
      }
    });

    generator.addJoiRouter(router);
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/'
    });
    assert(
      ['200', '201'].every(v => v in spec.paths['/output-outside-validate'].get.responses)
    );
  });

  it('should consider the router prefix', function () {
    const generator = new SwaggerAPI();
    const router = Router();
    router.prefix('/api');

    router.get('/signup', {
      meta: {
        swagger: {
          summary: 'User Signup'
        }
      },
      validate: {},
      handler: () => {
      }
    });

    generator.addJoiRouter(router);
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/'
    });
    assert(['/api/signup'].every(r => r in spec.paths));
  });

  it('should consider the prefix option over JoiRouter', function () {
    const generator = new SwaggerAPI();
    const router = Router();
    router.prefix('/api');

    router.get('/signup', {
      meta: {
        swagger: {
          summary: 'User Signup'
        }
      },
      validate: {},
      handler: () => {
      }
    });

    generator.addJoiRouter(router, { prefix: '/other-api' });
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/'
    });
    assert(['/other-api/signup'].every(r => r in spec.paths));
  });

  it('should return $ref with references', function () {
    const generator = new SwaggerAPI();
    const router = Router();

    const ProfileJoi = Joi.object({
      profileName: Joi.string(),
    });

    router.get('/signup', {
      validate: {
        type: 'json',
        body: ProfileJoi,
        ref: '#/definitions/Profile',
        output: {
          200: {
            body: ProfileJoi,
            ref: '#/definitions/Profile',
          }
        }
      },
      handler: () => {
      }
    });

    generator.addJoiRouter(router);
    const spec = generator.generateSpec({
      info: {
        title: 'Example API',
        version: '1.1'
      },
      basePath: '/',
      definitions: {
        Profile: ProfileJoi
      },
    });
    assert(spec.paths['/signup'].get.parameters[0].schema.$ref === '#/definitions/Profile');
    assert(spec.paths['/signup'].get.responses[200].schema.$ref === '#/definitions/Profile');
  });
});

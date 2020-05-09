# koa-joi-router-ng-docs

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/koa-joi-router-ng-docs.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-joi-router-ng-docs
[travis-image]: https://img.shields.io/travis/yadickson/koa-joi-router-docs.svg?style=flat-square
[travis-url]: https://travis-ci.org/yadickson/koa-joi-router-docs
[download-image]: https://img.shields.io/npm/dm/koa-joi-router-ng-docs.svg?style=flat-square
[download-url]: https://npmjs.org/package/koa-joi-router-ng-docs

This project is based on [chuyik/koa-joi-router-docs](https://github.com/chuyik/koa-joi-router-docs).

This fork use Joi@17 version

A node module for generating [Swagger 2.0](http://swagger.io/) JSON
definitions from existing [koa-joi-router](https://github.com/yadickson/joi-router)
routes.

Aiming to be a replacement for
[koa-resourcer-docs](https://github.com/koajs/resourcer-docs) which can
take advantage of various Swagger 2.0 tools for generating client libraries,
test suites, AWS Lambda/serverless, etc.

## Preview
<img width="860" alt="code_to_docs" src="http://storage.360buyimg.com/mtd/home/intro-2x_m1495439865552.png">

## Install
```bash
# use npm
npm install koa-joi-router-docs --save
# use yarn
yarn add koa-joi-router-docs
```

## Example
Visit [example/](./example) folder to see the full example.

## API

### new SwaggerAPI()

Creates a new SwaggerAPI instance.

### swaggerAPI.addJoiRouter(router, options)

Add a joi-router instance to the API. The router should already have all its
routes set up before calling this method (which pulls the route definitions
from the router's `.routes` property).

Options:
- prefix: Prefix to add to Swagger path (use prefix from JoiRouter if not set)

### swaggerAPI.generateSpec(baseSpec, options)

Create a Swagger specification for this API. A base specification should be
provided with an `info` object (containing at least the `title` and `version`
strings) and any other global descriptions.

Options:
- defaultResponses: Custom default responses
  ```js
  {
    200: {
      description: 'Success'
    }
  }
  ```

---

## Acknowledgements
We are grateful to the authors of existing related projects for their ideas and collaboration:

- [@paul42](https://github.com/paul42/joi-router-swagger-docs)
- [@pebble](https://github.com/pebble/joi-router-swagger-docs)
- [@chuyik](https://github.com/chuyik/koa-joi-router-docs)


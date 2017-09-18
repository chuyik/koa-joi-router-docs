# Koa-Joi-Router Docs Generator

This project is based on [paul42/joi-router-swagger-docs](https://github.com/paul42/joi-router-swagger-docs).

A node module for generating [Swagger 2.0](http://swagger.io/) JSON
definitions from existing [koa-joi-router](https://github.com/koajs/joi-router)
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
- prefix: Prefix to add to Swagger path

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

# Donation

If you find this project useful, you can buy us a cup of coffee:    

<a href="https://www.paypal.me/chuyik" target="blank">
<img width="200" src="https://storage.360buyimg.com/mtd/home/donate_paypal_min1495016435786.png" alt="">
</a><br>     

<img width="650" src="https://storage.360buyimg.com/mtd/home/donate_cn1495017701926.png" alt="">

## Acknowledgements
We are grateful to the authors of existing related projects for their ideas and collaboration:

- [@paul42](https://github.com/paul42/joi-router-swagger-docs)
- [@pebble](https://github.com/pebble/joi-router-swagger-docs)

## Contributors
[![chuyik](https://avatars2.githubusercontent.com/u/6262943?v=3&s=120)](https://github.com/chuyik) |
:---:|
[chuyik](https://github.com/chuyik) |
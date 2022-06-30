---
title: "Quick Start"
---
# Quick Start Guide

This guide will walk you through a process of creating simple app within the existing vyoo-sports-backend structure.

Note: all files created below are supposed to be put under `packages/quickstart.app` directory to follow established monorepo approach.


## Creating new app

```typescript
// quickstart.app.ts

// import app factory helper
import createApp from '$/sports.lib/createApp'

// create new app builder
const app = createApp()

// export as default for simplicity
export default app
```


## Making changes to `tsconfig.json`

We want root contents of our new app to be resolvable by using `~/*` alias.
This is done by adding one line to our root `tsconfig.json` file:

```javascript
// <repo root>/tsconfig.json

{
  "compilerOptions": {
    ...
    "paths": [
      "~/*": [
        "packages/quickstart.app/*",
        ...
      ],
      ...
    ],
    ...
  }
}
```


## Making it Serverless

```typescript
// quickstart.sls.ts

// import our app builder instance
import app from './quickstart.app'

// configureServerless() will create a valid Serverless configuration object for our app that we can safely export
// IMPORTANT: don't use `export default` here as Serverless CLI doesn't recognize ES modules in configuration files
module.exports = app.configureServerless({
  // here we define our serverless service name
  // let's follow our convention and prefix it with `vyoo-sports-backend-`
  service: 'vyoo-sports-backend-quickstart',
})
```

We're using `serverless-compose` to manage and deploy multi-service serverless application.
This process is controlled by `serverless-compose.ts` file in the repository root.
Let's add our app to composition:

```typescript
// <repo root>/serverless-compose.ts

...

module.exports = {
  services: services({
    ...
    // adding new default entry for our quickstart app
    quickstart: {},
    ...
  }),
}
```

Now we can run `sls quickstart:print` shell command in repo root directory to see the default Vyoo serverless configuration,
and running `sls deploy` should deploy all services we have including our new quickstart app.


## Adding simple HTTP action

The `functions` section of the Serverless configuration above is empty since we haven't added anything useful in it yet.
Let's add simple HTTP "Hello, World!" endpoint.

```typescript
// actions/hello.get.ts

// by convention HTTP actions should be placed under `actions` directory next to our app file
// file name should follow specific pattern:
// 1. one or more literals or path parameter names, each one represents a URL path part: `part1.part2.{param1}.part3`
// 2. HTTP method names, separated by comma: `get,post`
// 3. `.ts` extension
// so the name of our file `hello.get.ts` is translated into `GET ${BASE_URL}/${STAGE_NAME}/hello` HTTP endpoint

import app from '~/quickstart.app'

// we need to use `Action` decorator of our configured app builder to convert implementation class into a valid action object
@app.Action()
// by convention HTTP action should be the default export of the file
export default class {
  // the only required part of an action class is parameterless `exec()` method that returns the result of this action
  exec(): string {
    return 'Hello, World!'
  }
}
```

We're almost there, now we just need to tell our app builder where to look for our actions.
To do that, we'll change our `quickstart.app.ts` a bit:

```typescript
// quickstart.app.ts
import createApp from '$/sports.lib/createApp'

// we're adding `.discover()` call passing the root directory of this app
// now our app builder will scan that directory for files matching the convention and will register all actions it will find
const app = createApp().discover(__dirname)

export default app

// we can also export `Action` helper of the builder directly to avoid prefixing our decorator with `app.`
export const { Action } = app
```


## Making it safe - schemas

We can define schemas for various parts of our action - this will net us both TypeScript type definitions and run-time validation for those parts, and also can be used to generate API documentation later.
Let's start with describing the result of our action by using the `Action.exec()` helper:

```typescript
// actions/hello.get.ts

// let's use our directly exported `Action` helper
import { Action } from '~/quickstart.app'

@Action()
export default class {
  // `exec()` helpers accepts lambda describing a result schema as first parameter and expects function passed as a second parameter to return the type described by that schema
  exec = Action.exec(
    // `x` is an `HttpActionResultSchemaBuilder` object that will provide a fluent syntax for building the action result schema
    // our schema is simple - we just want to return strings
    x => x.string(),

    // trying to return anything but string from this function will yield a compile-time TypeScript error
    // if result validation is enabled, than result of this action is also being validated at run-time in case type system was circumvented
    () => 'Hello, World!'
  )
}
```


## Using query parameters

Let's make our greeting more personalized by reading the user name from query string:

```typescript
// actions/hello.get.ts

import { Action } from '~/quickstart.app'

@Action()
export default class {
  constructor(
    // `Action.query()` helper can inject query string values into our action
    readonly name = Action.query(
      // we expect `?name=something` in the URL, and we're interested in that `name` parameter in our action
      'name',
      // here we describe the schema of our parameter
      x => x
        // we accept just a simple string
        .string()
        // let's make it optional so that the users can omit it if they want
        .optional()
    )
    // note: we could also use `Action.query(x => x.object({ name: x.string() }))` to inject query parameters as an object
  ) {}

  exec = Action.exec(
    x => x.string(),
    // now we can use the injected query parameter
    // note that because we specified it as optional, it has a type of `undefined | string` - and so we can handle the default case easily
    () => `Hello, ${this.name || 'World'}!`
  )
}
```

Just like with the result, the `Action.query()` gives us type-safety based on the schema we provide and will inject the values we ask for into our constructor.
Similarly, `Action.headers()` helper can be used to reference header values of the HTTP request we're currently handling.


## Path parameters

We can specify path parameters of our action by altering the file name and using `Action.params()` helper.
Let's create a new file to see that in action:

```typescript
// actions/hello.{name}.get.ts

// parts before methods separated by a dot are converted into URL path segments, and the curly braces denote a path parameter
// so our final URL pattern will look like that: `GET ${BASE_URL}/${STAGE_NAME}/hello/{name}`

import { Action } from '~/quickstart.app'

@Action()
export default class {
  constructor(
    // the `Action.params()` signature is very similar to `Action.query()` and `Action.headers()`
    // normally, you want to specify a schema for all path parameters you defined in the file name
    readonly name = Action.params('name', x => x.string())
  ) {}

  exec = Action.exec(
    x => x.string(),
    () => `Hello, ${this.name}!`
  )
}
```


## POST actions - working with the request body

Unsurprisingly, there's another helper that can provide us with a HTTP request body object.
Let's see it in action:

```typescript
// actions/hello.{name}.get,post.ts

// first, we have to add "post" to out file name's methods part to allow POST requests to this action

import { Action } from '~/quickstart.app'

@Action()
export default class {
  constructor(
    readonly name = Action.params('name', x => x.string()),
    // here we're going to inject request body object into our class
    readonly body = Action.body(
      // Unlike headers and params helpers, `Action.body()` has only one form where you have to describe the whole schema
      x => x
        // we'll accept object
        .object({
          // with one boolean field
          logMyVisit: x.boolean()
        })
        // we have to make our body optional in case of a GET request, since our class handles both HTTP methods
        .optional()
    )
  ) {}

  exec = Action.exec(
    x => x.string(),
    () => {
      // let's check the body
      if (this.body?.logMyVisit) {
        console.log(`${name} visited us`)
      }

      return `Hello, ${name}!`
    }
  )
}
```

And we're done. Nice job!


## Doing something in-between - Middleware

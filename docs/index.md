---
title: "Vyoo Sports"
---
# Quickstart


## Creating new app

```typescript
// app.ts

// import app factory helper
import createApp from '$/sports.lib/createApp'

// create new app builder
const app = createApp()

// export as default for simplicity
export default app
```


## Making it Serverless

```typescript
// serverless.ts

// import our app builder instance
import app from './app'

// configureServerless() will create a valid Serverless configuration object for our app that we can safely export
// IMPORTANT: don't use `export default` here as Serverless CLI doesn't recognize ES modules in configuration files
module.exports = app.configureServerless()
```

Now we can run `sls print` shell command in our app directory to see the default Vyoo serverless configuration.


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

// make sure you have path entry in your `tsconfig.json` that points `~/*` imports to the app root directory
import app from '~/app'

// we need to use `Action` decorator of our configured app builder to convert implementation class into a valid action object
@app.Action()
// by convention HTTP action should be a default export of the file
export default class {
  // the only required part of an action class is parameterless `exec()` method that returns the result of this action which
  exec(): string {
    return 'Hello, World!'
  }
}
```

We're almost there, now we just need to tell our app builder where to look for our actions.
To do that, we'll change our `app.ts` a bit:

```typescript
// app.ts
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
import { Action } from '~/app'

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

import { Action } from '~/app'

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

import { Action } from '~/app'

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


## POST actions - working with the body

We have one `Action` helper left to try out - `Action.body()`

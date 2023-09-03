![Tests](https://github.com/monade/json-api-parser/actions/workflows/test.yml/badge.svg)
[![npm version](https://badge.fury.io/js/@monade%2Fjson-api-parser.svg)](https://badge.fury.io/js/@monade%2Fjson-api-parser)

# @monade/json-api-parser

This library provides a parser for the [JSON:API](https://jsonapi.org/) format, enabling seamless mapping of JSON data to TypeScript/JavaScript models using decorators.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
    - [Model Declaration](#model-declaration)
    - [The Parser](#the-parser)
- [Full Example](#full-example)
- [Zod Interoperability (Experimental)](#zod-interoperability-experimental)
- [TODO](#todo)


## Installation

Install the package via npm:

```bash
  npm install @monade/json-api-parser
```

## Quick Start
To get started, simply declare your models using the `@JSONAPI` and `@Attr` decorators and use the `Parser` class to parse JSON:API data.

```typescript
import { JSONAPI, Attr, Parser } from "@monade/json-api-parser";

@JSONAPI("posts")
class Post {
  @Attr() title: string;
}

const jsonData = /* fetch your JSON:API data here */;
const parsedData = new Parser(jsonData).run<Post[]>();
```

## Features
### Models declaration
**`@JSONAPI(type: string)`**

This decorator acts as the entry point for declaring a JSON:API model. It maps a JSON:API object type to the decorated class.

```typescript
@JSONAPI("posts")
class Post extends Model {}
```

**`@Attr([name?: string, options?: { parser?: Function, default?: any }])`**

This decorator is used for declaring attributes on a JSON:API model. You can optionally specify a different name for the attribute, a default value and a parser function to transform the data.

```typescript
@JSONAPI("posts")
class Post extends Model {
  @Attr() title: string;
}
```

**`@Rel([name?: string, options?: { parser?: Function, default?: any }])`**

Use this decorator to declare relationships between JSON:API models. You can optionally specify a different name for the relationship, a default value and a parser function to transform the data.

```typescript
@JSONAPI("posts")
class Post extends Model {
  @Rel() author: User;
}
```

### The Parser
The Parser class is responsible for transforming JSON:API objects into instances of the declared models. To use it, create a new instance of `Parser` and call its `run<T>` method.

Example:
Usage:
```typescript
const jsonData = await fetch('https://some-api.com/posts').then(e => e.json());
const parsedData = new Parser(jsonData).run<Post[]>();
```

## Full Example

```typescript
import { Attr, JSONAPI, Model, Rel } from "@monade/json-api-parser";

export const DateParser = (data: any) => new Date(data);

@JSONAPI("posts")
export class Post extends Model {
  @Attr() name!: string;
  @Attr("description") content!: string;
  @Attr("created_at", { parser: DateParser }) createdAt!: Date;
  @Attr("active", { default: true }) enabled!: boolean;
  @Attr() missing!: boolean;

  @Rel("user") author!: User;
  @Rel() reviewer!: User | null;
}

@JSONAPI("users")
class User extends Model {
  @Attr() firstName!: string;
  @Attr() lastName!: string;
  @Attr("created_at", { parser: DateParser }) createdAt!: Date;

  @Rel() favouritePost!: Post;
}
```

## Zod Interoperability [EXPERIMENTAL]
This library also offers experimental support for [Zod](https://zod.dev/), allowing for runtime type-checking of your JSON:API models.

```typescript
import { declareModel, InferModel, modelOfType } from "@monade/json-api-parser/zod";

const UserSchema = declareModel(
  "users",
  {
    attributes: z.object({
      firstName: z.string(),
      lastName: z.string(),
      created_at: z.string().transform((v) => new Date(v)),
    }),

    relationships: z.object({
      // Circular references must be addressed like this
      favouritePost: modelOfType('posts'),
    }),
  }
);

const PostSchema = declareModel(
  "posts",
  {
    attributes: z.object({
      name: z.string(),
      description: z.string(),
      created_at: z.string().transform((v) => new Date(v)),
      active: z.boolean().default(true),
    }),
    relationships: z.object({ user: UserSchema, reviewer: UserSchema })
  }
);

type User = InferModel<typeof UserSchema>;
type Post = InferModel<typeof PostSchema>;
```

## TODO
* Improve Documentation
* Edge case tests
* Improve interoperability with zod


About Monade
----------------

![monade](https://monade.io/wp-content/uploads/2023/02/logo-monade.svg)

json-api-parser is maintained by [mònade srl](https://monade.io/en/home-en/).

We <3 open source software. [Contact us](https://monade.io/en/contact-us/) for your next project!

![Tests](https://github.com/monade/json-api-parser/actions/workflows/test.yml/badge.svg)

# @monade/json-api-parser

A parser for [JSON:API](https://jsonapi.org/) format that maps data to models using decorators, inspired by retrofit.

## Installation

```bash
  npm install https://github.com/monade/json-api-parser.git
```

## Example usage

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

## TODO
* Documentation
* Edge case tests
* Release on NPM

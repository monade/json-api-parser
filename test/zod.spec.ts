import { Parser, debug } from "../src";
import { InferModel, declareModel, modelOfType } from "../src/zod";
import z from 'zod';

const UserSchema = declareModel(
  "users",
  {
    attributes: z.object({
      firstName: z.string(),
      lastName: z.string(),
      created_at: z.string().transform((v) => new Date(v)),
    }),

    relationships: z.object({
      favouritePost: modelOfType('posts'),
    }),
  }
);

type User = InferModel<typeof UserSchema>;

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

type Post = InferModel<typeof PostSchema>;

const parsable = `{
  "data": [
    {
      "id": "2", "type": "posts",
      "attributes": { "name": "My post", "ciao": null, "description": "ciao", "created_at": "2020-10-10T10:32:00Z" },
      "relationships": {
        "user": { "data": { "id": "3", "type": "users" } },
        "reviewer": { "data": null }
      }
    }
  ],
  "included": [
    {
      "id": "3", "type": "users",
      "attributes": { "firstName": "Gino", "lastName": "Pino", "created_at": "2020-10-15T10:32:00Z" },
      "relationships": { "favouritePost": { "data": { "id": "2", "type": "posts" } } }
    }
  ]
}`;

let logs: string[] = [];

debug.adapter = (...args: any[]) => logs.push(args[0]);

const jsonObject = JSON.parse(parsable);

let parsed!: Post[];

beforeEach(() => {
  parsed = new Parser(
    jsonObject.data,
    jsonObject.included
  ).run<Post>() as Post[];
});

test("returns an array of one object", () => {
  expect(parsed.length).toBe(1);
});

test("parses matches the correct class", () => {
  const model: Post = parsed[0];
  expect(model._type).toEqual("posts");
});

test("parses all attributes", () => {
  const model: Post = parsed[0];

  expect(typeof model.id === "string").toBeTruthy();
  expect(model.id).toBe(jsonObject.data[0].id);

  expect(typeof model.name === "string").toBeTruthy();
  expect(model.name).toBe(jsonObject.data[0].attributes.name);

  expect(typeof model.description === "string").toBeTruthy();
  expect(model.description).toBe(jsonObject.data[0].attributes.description);

  expect((model as any).ciao).toBe(null);

  expect(model.created_at instanceof Date).toBeTruthy();
  expect(model.created_at.getFullYear()).toBe(2020);

  expect(typeof model.active === "boolean").toBeTruthy();
  expect(model.active).toBe(true);
});

test("parses all relationships", () => {
  const model: Post = parsed[0];
  const user = model.user;

  expect(typeof user.firstName === "string").toBeTruthy();
  expect(user.firstName).toBe(jsonObject.included[0].attributes.firstName);

  expect(typeof user.lastName === "string").toBeTruthy();
  expect(user.lastName).toBe(jsonObject.included[0].attributes.lastName);

  expect(user.created_at instanceof Date).toBeTruthy();

  expect(model.reviewer).toBe(null);
});

test("parses circular references", () => {
  const post = parsed[0];
  const favouritePost = parsed[0].user.favouritePost;
  expect(post).toBe(favouritePost);
});

test("logs missing attributes", () => {
  expect(logs.find((e) => e.indexOf(`Missing attribute "missing" in "posts"`)));
});

test("logs undeclared attributes", () => {
  expect(logs.find((e) => e.indexOf(`Undeclared key "ciao" in "posts`)));
});

test("models with zod are Model instances", () => {
  const post = parsed[0];
  const json = post.toJSON(1);

  expect(json).toEqual({
    id: "2",
    name: "My post",
    description: "ciao",
    active: true,
    ciao: null,
    reviewer: null,
    created_at: new Date("2020-10-10T10:32:00.000Z"),
    user: {
      id: "3",
      firstName: "Gino",
      created_at: new Date("2020-10-15T10:32:00.000Z"),
      lastName: "Pino",
    },
  })
});

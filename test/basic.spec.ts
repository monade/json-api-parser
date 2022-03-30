import { Parser, debug } from "../src";
import { Post } from "./models";

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
  expect(model instanceof Post).toBeTruthy();
});

test("parses all attributes", () => {
  const model: Post = parsed[0];

  expect(typeof model.id === "string").toBeTruthy();
  expect(model.id).toBe(jsonObject.data[0].id);

  expect(typeof model.name === "string").toBeTruthy();
  expect(model.name).toBe(jsonObject.data[0].attributes.name);

  expect(typeof model.content === "string").toBeTruthy();
  expect(model.content).toBe(jsonObject.data[0].attributes.description);

  expect((model as any).ciao).toBe(null);

  expect(model.createdAt instanceof Date).toBeTruthy();
  expect(model.createdAt.getFullYear()).toBe(2020);

  expect(typeof model.enabled === "boolean").toBeTruthy();
  expect(model.enabled).toBe(true);

  expect(model.missing).toBe(undefined);
});

test("parses all relationships", () => {
  const model: Post = parsed[0];
  const user = model.author;

  expect(typeof user.firstName === "string").toBeTruthy();
  expect(user.firstName).toBe(jsonObject.included[0].attributes.firstName);

  expect(typeof user.lastName === "string").toBeTruthy();
  expect(user.lastName).toBe(jsonObject.included[0].attributes.lastName);

  expect(user.createdAt instanceof Date).toBeTruthy();

  expect(model.reviewer).toBe(null);
});

test("parses circular references", () => {
  const post = parsed[0];
  const favouritePost = parsed[0].author.favouritePost;
  expect(post).toBe(favouritePost);
});

test("logs missing attributes", () => {
  expect(logs.find((e) => e.indexOf(`Missing attribute "missing" in "posts"`)));
});

test("logs undeclared attributes", () => {
  expect(logs.find((e) => e.indexOf(`Undeclared key "ciao" in "posts`)));
});

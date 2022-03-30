import { Parser, debug, Model } from "../src";

const parsable = `{
  "data": [
    {
      "id": "2", "type": "posts",
      "attributes": { "name": "My post", "ciao": null, "description": "ciao", "created_at": "2020-10-10T10:32:00Z" },
      "relationships": {
        "user": { "data": { "id": "3", "type": "users" } }
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

let lastLog: any;

debug.adapter = (...args: any[]) => (lastLog = args);

const jsonObject = JSON.parse(parsable);

let parsed!: any[];

beforeEach(() => {
  parsed = new Parser(jsonObject.data, jsonObject.included).run();
});

test("returns an array of one object", () => {
  expect(parsed.length).toBe(1);
});

test('uses the class "model"', () => {
  const model = parsed[0];
  expect(model instanceof Model).toBeTruthy();
});

test("parses all attributes fallbacking to model", () => {
  const model = parsed[0];

  expect(typeof model.id === "string").toBeTruthy();
  expect(model.id).toBe(jsonObject.data[0].id);

  expect(typeof model.name === "string").toBeTruthy();
  expect(model.name).toBe(jsonObject.data[0].attributes.name);

  expect(typeof model.description === "string").toBeTruthy();
  expect(model.description).toBe(jsonObject.data[0].attributes.description);

  expect(typeof model.created_at === "string").toBeTruthy();
  expect(model.created_at).toBe(jsonObject.data[0].attributes.created_at);

  expect(model.ciao).toBe(null);

  expect(model.enabled).toBe(undefined);
  expect(model.missing).toBe(undefined);
});

test("parses all relationships fallbacking to Model", () => {
  const model = parsed[0];
  const user = model.user;

  expect(user).not.toBe(undefined);

  expect(typeof user.firstName === "string").toBeTruthy();
  expect(user.firstName).toBe(jsonObject.included[0].attributes.firstName);

  expect(typeof user.lastName === "string").toBeTruthy();
  expect(user.lastName).toBe(jsonObject.included[0].attributes.lastName);

  expect(typeof model.created_at === "string").toBeTruthy();
  expect(model.created_at).toBe(jsonObject.data[0].attributes.created_at);
});

test("parses circular references", () => {
  const post = parsed[0];
  const favouritePost = parsed[0].user.favouritePost;
  expect(post).toBe(favouritePost);
});

import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";

import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let connection2: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.query(`CREATE DATABASE create_user;`);

    await connection.close();

    connection2 = await createConnection("create_user");

    await connection2.runMigrations();
  });

  afterAll(async () => {
    await connection2.dropDatabase();
  });

  afterAll(async () => {
    await connection2
      .close()
      .then(() => {
        console.log("Banco finalizado");
      })
      .catch((err) => console.log(err));
  });

  afterAll(async () => {
    connection = await createConnection();
    await connection.query("DROP DATABASE IF EXISTS create_user");
    await connection
      .close()
      .then(() => {
        console.log("Banco finalizado");
      })
      .catch((err) => console.log(err));
  });

  it("should be possible to add a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .send({
        name: "test",
        email: "test@gmail.com",
        password: "12345"
      });

    expect(response.status).toBe(201);

  });
});

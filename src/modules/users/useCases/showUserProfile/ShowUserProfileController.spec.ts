import request from "supertest";
import { Connection, getConnectionOptions } from "typeorm";
import { hash } from "bcryptjs";

import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let connection2: Connection;

describe("Show User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.query(`CREATE DATABASE show_user;`);

    await connection.close();

    connection2 = await createConnection("show_user");

    await connection2.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection2.query(`INSERT INTO public.users (id,"name",email,"password")
    VALUES('${id}'::uuid, 'admin', 'admin@test.com.br', '${password}')`);
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
    await connection.query("DROP DATABASE IF EXISTS show_user");
    await connection
      .close()
      .then(() => {
        console.log("Banco finalizado");
      })
      .catch((err) => console.log(err));
  });

  it("should be possible to bring the data of the logged in user", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

      console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });
});

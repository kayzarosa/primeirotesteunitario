import request from "supertest";
import { Connection } from "typeorm";
import { hash } from "bcryptjs";

import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";

import createConnection from "../../../../database";

let connection: Connection;
let connection2: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.query(`CREATE DATABASE get_balance;`);

    await connection.close();

    connection2 = await createConnection("get_balance");

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
    await connection.query("DROP DATABASE IF EXISTS get_balance");
    await connection
      .close()
      .then(() => {
        console.log("Banco finalizado");
      })
      .catch((err) => console.log(err));
  });

  it("should be possible to list the balances", async () => {
    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@test.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 45.09,
        description: "Deposito",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");

    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 4.08,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseWithdraw.status).toBe(201);
    expect(responseWithdraw.body).toHaveProperty("id");

    const responseBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseBalance.body).toHaveProperty("balance");
    expect(responseBalance.body.balance).toBe(41.010000000000005);
  });
});

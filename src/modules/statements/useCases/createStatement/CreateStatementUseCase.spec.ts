import { CreateStatementError } from "./CreateStatementError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType } from "@modules/statements/entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
import { ICreateStatementDTO } from "@modules/statements/dtos/ICreateStatementDTO";

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create statement", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    const statement: ICreateStatementDTO = {
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 10.09,
      description: "test",
    };

    const newStatement = await createStatementUseCase.execute(statement);

    expect(newStatement).toHaveProperty("id");
  });

  it("should not be able to create claim if user does not exist", async () => {
    const statement: ICreateStatementDTO = {
      user_id: "tests24",
      type: "deposit" as OperationType,
      amount: 10.09,
      description: "test",
    };

    expect(async () => {
      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to create a statement with withdraw", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 10,
      description: "description",
      type: "deposit" as OperationType,
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: String(user.id),
      amount: 5,
      description: "description",
      type: "withdraw" as OperationType,
    });

    expect(withdraw).toHaveProperty("id");
  });

  it("Should not be possible to make a withdraw without balance", async () => {
    const userCreated = await inMemoryUsersRepository.create({
      name: "John",
      email: "user@example.com",
      password: "password",
    });

    await expect(
      createStatementUseCase.execute({
        user_id: String(userCreated.id),
        amount: 5,
        description: "description",
        type: "withdraw" as OperationType,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});

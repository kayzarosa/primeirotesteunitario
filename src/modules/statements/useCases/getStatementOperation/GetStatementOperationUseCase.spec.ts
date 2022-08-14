import { GetStatementOperationError } from "./GetStatementOperationError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { OperationType } from "@modules/statements/entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 10.09,
      description: "test",
    });

    const getBalance = await getStatementOperationUseCase.execute({
      user_id: String(user.id),
      statement_id: String(statement.id),
    });

    expect(getBalance).toHaveProperty("id");
  });

  it("should not be able to find a user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "id_user",
        statement_id: "id_statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be possible to find an operation", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: String(user.id),
        statement_id: "id_statement",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});

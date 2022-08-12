import { GetBalanceError } from "./GetBalanceError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { ICreateStatementDTO } from "@modules/statements/dtos/ICreateStatementDTO";
import { OperationType } from "@modules/statements/entities/Statement";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("must be able to bring registered balance", async () => {
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

    await inMemoryStatementsRepository.create(statement);

    const getBalance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    expect(getBalance.statement.length).toBe(1);
  });

  it("should not be able to create claim if user does not exist", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "3"});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});

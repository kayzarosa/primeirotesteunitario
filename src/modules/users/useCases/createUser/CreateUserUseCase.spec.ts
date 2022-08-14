import { CreateUserError } from "./CreateUserError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to register an existing user", async () => {
    await createUserUseCase.execute({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    expect(async () => {
      await createUserUseCase.execute({
        email: "test@gmail.com",
        name: "Erroooo",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});

import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("must be able to authenticate user", async () => {
    const user = {
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authenticate).toHaveProperty("token");
  });

  it("should not be possible to authenticate the user with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@gmail.com",
        name: "Test",
        password: "123456",
      });

      await authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: "324e43d",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be possible to authenticate with the wrong email", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: "23434fdg",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});

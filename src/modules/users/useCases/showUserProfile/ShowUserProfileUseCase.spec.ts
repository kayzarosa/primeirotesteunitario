import { ShowUserProfileError } from "./ShowUserProfileError";

import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to create a new user", async () => {
    const user = await inMemoryUsersRepository.create({
      email: "test@gmail.com",
      name: "Test",
      password: "123456",
    });

    const showUser = await showUserProfileUseCase.execute(String(user.id));

    expect(showUser).toHaveProperty("name");
  });

  it("should not find a user by the given id", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("test");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});

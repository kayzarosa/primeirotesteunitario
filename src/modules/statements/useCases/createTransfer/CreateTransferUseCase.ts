import { inject, injectable } from "tsyringe";

import { ICreateStatementDTO } from "@modules/statements/dtos/ICreateStatementDTO";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { OperationType } from "@modules/statements/entities/Statement";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    user_id,
    sender_id,
    type,
    amount,
    description,
  }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateTransferError.UserNotFound();
    }

    if (!sender_id) {
      throw new CreateTransferError.UserNotFound();
    }

    const userSend = await this.usersRepository.findById(sender_id);

    if (!userSend) {
      throw new CreateTransferError.UserNotFound();
    }

    if (type === "withdraw" || type === "transfer") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id: sender_id,
      });

      if (balance < amount) {
        throw new CreateTransferError.InsufficientFunds();
      }
    }

    const statementWithdrawOperation = await this.statementsRepository.create({
      user_id: sender_id,
      type: OperationType.WITHDRAW,
      amount,
      description,
    });

    await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    return statementWithdrawOperation;
  }
}

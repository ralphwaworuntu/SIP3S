import { BhabinRepository } from "@/repositories/bhabin-repository";
import type { BhabinAccount, BhabinAccountPayload } from "@/types/bhabin";

export class BhabinAccountService {
  constructor(private readonly repository = new BhabinRepository()) {}

  listAccounts(): Promise<BhabinAccount[]> {
    return this.repository.list();
  }

  createAccount(payload: BhabinAccountPayload): Promise<BhabinAccount> {
    return this.repository.create(payload);
  }

  updateAccount(id: string, payload: BhabinAccountPayload): Promise<BhabinAccount> {
    return this.repository.update(id, payload);
  }

  deleteAccount(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}

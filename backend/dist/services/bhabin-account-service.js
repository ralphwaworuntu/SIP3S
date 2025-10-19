import { BhabinRepository } from "@/repositories/bhabin-repository";
export class BhabinAccountService {
    constructor(repository = new BhabinRepository()) {
        this.repository = repository;
    }
    listAccounts() {
        return this.repository.list();
    }
    createAccount(payload) {
        return this.repository.create(payload);
    }
    updateAccount(id, payload) {
        return this.repository.update(id, payload);
    }
    deleteAccount(id) {
        return this.repository.remove(id);
    }
}

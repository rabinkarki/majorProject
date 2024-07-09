import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

export class AuthService{
  client = new Client();
  account;

  constructor() {
    console.log('Appwrite URL:', conf.appwriteUrl);
    console.log('Appwrite Project ID:', conf.appwriteProjectId);
    console.log('Appwrite Project ID:', conf.appwriteDatabaseId);

    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }
  //This makes it easier to change the values without modifying the code, especially useful for different environments (development, staging, production).

  async createAccount({ email, password, name }) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      if (userAccount) {
        // call another method
        return this.login({ email, password });
      } else {
        return userAccount;
      }
    } catch (error) {
      throw error;
    }
  }
  async login({ email, password }) {
    try {
      return await this.account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  }
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      /*Because the error is re-thrown, the code execution is immediately terminated within the catch block
                so it never reach to return null*/
      // throw error;
      console.log("Appwrite serive :: getCurrentUser :: error", error);
    }
    return null;
  }
  async logout() {

    try {
        await this.account.deleteSessions();
    } catch (error) {
        console.log("Appwrite serive :: logout :: error", error);
    }
}
}

const authService = new AuthService();

export default authService

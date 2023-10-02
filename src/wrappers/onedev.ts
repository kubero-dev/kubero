export class OneDevApi {
  private baseURL: string;
  private username: string;
  private token: string;

  constructor(baseURL: string, username: string, token: string) {
    this.baseURL = baseURL;
    this.username = username;
    this.token = token;
  }


  public async repoGet() {

  }

}
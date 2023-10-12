import axios, { Axios, AxiosResponse } from 'axios';
import { OneDevProjectINfo } from './types.onedev';

export class OneDevWrapper {
  public baseURL: string;
  public username: string;
  protected password: string;

  constructor(baseURL: string, username: string, token: string) {
    this.baseURL = baseURL;
    this.username = username;
    this.password = token;
  }


  public async getProjectsFromName(projectName: string, parentId: number | null | undefined = undefined): Promise<ReadonlyArray<OneDevProjectINfo>> {
    let projectInfo: AxiosResponse;

    try {
      projectInfo = await axios.get(`${this.baseURL}/~api/projects`, {
        params: {
          query: `"Name" is ${projectName}`,
          offset: 0,
          count: 100
        },
        auth: {
          username: this.username,
          password: this.password
        }
      });
    } catch (err) {
      console.error(`Error fetching project id from proect name via API call: ${err}`);
      throw new Error(`Failed to get project id for project ${projectName}`);
    }

    if (projectInfo.status !== 200) {
      throw new Error(`Failed to get project info for project ${projectName} with status code ${projectInfo.status}}`);
    }

    return projectInfo.data.filter((project: OneDevProjectINfo) => (parentId !== undefined) ? (project.parentId === parentId) : true);
  }

  public async getProjectBranches(projectId: number): Promise<string[]> {
    let branches: AxiosResponse;
    try {
      branches = await axios.get(`${this.baseURL}/~api/repositories/${projectId}/branches`);
    } catch (err) {
      console.error('Error while fetching branches: ', err);
      throw new Error(`Failed to get branches for project ${projectId}`)
    }

    if (branches.status !== 200) throw new Error(`Failed to get branches for project ${projectId}`);
    return branches.data as string[];
  }

  public async getProjectInfoByProjectId(projectId: number): Promise<OneDevProjectINfo> {
    let repo: AxiosResponse;
    try {
      repo = await axios.get(`${this.baseURL}/~api/projects/${projectId}`);
    } catch (err) {
      console.error('Error while fetching repository: ', err);
      throw new Error(`Failed to get repository for project ${projectId}`)
    }

    if (repo.status !== 200) throw new Error(`Failed to get repository for project ${projectId}`);
    return repo.data as OneDevProjectINfo;
  }

  public async getRepositoryDefaultBranch(projectId: number): Promise<string> {
    let defaultBranchResp: AxiosResponse;
    try {
      defaultBranchResp = await axios.get(`${this.baseURL}/~api/repositories/${projectId}/default-branch`);
    } catch (err) {
      console.error('Error fetching default branch for project: ', err);
      throw new Error('Error fetching default branch for project with id ' + projectId);
    }

    if (defaultBranchResp.status !== 200) throw new Error('Error fetching default branch for project with id ' + projectId);
    return defaultBranchResp.data as string;
  }

  public async addSHHKeys(projectId: number) {

  }



}

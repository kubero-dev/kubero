import * as dotenv from 'dotenv';
export const ENV = dotenv.config().parsed;

export function extractScope(scope: string | undefined): string[] {
  if (!scope) {
    return [];
  }
  return scope.split(' ');
}

export function extractEnvVar(key: string): string {
  if (!ENV) {
    throw new Error('Environment variables are not loaded');
  }
  const value = ENV[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
}

export function extractEnvVarOptional(key: string): string | undefined {
  if (!ENV) {
    throw new Error('Environment variables are not loaded');
  }
  return ENV[key];
}

export function checkOauth2Enabled(): boolean {
  let enabled = false;
  (
    ENV?.OAUTO2_CLIENT_AUTH_URL == undefined ||
    ENV?.OAUTO2_CLIENT_TOKEN_URL == undefined ||
    ENV?.OAUTH2_CLIENT_ID == undefined || 
    ENV?.OAUTH2_CLIENT_SECRET == undefined ||
    ENV?.OAUTH2_CLIENT_CALLBACKURL == undefined) ? enabled = false : enabled = true;
  
  return enabled;
}
export function checkGithubEnabled(): boolean {
  let enabled = false;
  (
    ENV?.GITHUB_CLIENT_SECRET == undefined ||
    ENV?.GITHUB_CLIENT_ID == undefined ||
    ENV?.GITHUB_CLIENT_CALLBACKURL == undefined ||
    ENV?.GITHUB_CLIENT_ORG == undefined) ? enabled = false : enabled = true;
  
  return enabled;
}

export function checkLocalauthEnabled(): boolean {
  return ENV?.KUBERO_USERS != null;
}
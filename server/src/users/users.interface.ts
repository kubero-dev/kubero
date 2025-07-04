export interface Users {}
export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  password?: string;
  twoFaSecret?: string;
  twoFaEnabled: boolean;
  image?: string;
  roleId?: string;
  isActive: boolean;
  lastLogin?: Date;
  lastIp?: string;
  provider?: string;
  providerId?: string;
  providerData?: string;
  createdAt: Date;
  updatedAt: Date;
}

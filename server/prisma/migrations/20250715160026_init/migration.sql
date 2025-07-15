-- CreateTable
CREATE TABLE "Audit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" TEXT NOT NULL DEFAULT 'normal',
    "action" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "pipeline" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT 'unknown',
    "message" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Audit_user_fkey" FOREIGN KEY ("user") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT NOT NULL,
    "twoFaSecret" TEXT,
    "twoFaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "roleId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "lastIp" TEXT,
    "provider" TEXT DEFAULT 'local',
    "providerId" TEXT,
    "providerData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" DATETIME,
    "lastIp" TEXT,
    "description" TEXT,
    "role" TEXT NOT NULL,
    "groups" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "namespace" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Runpack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "fetchId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Runpack_fetchId_fkey" FOREIGN KEY ("fetchId") REFERENCES "RunpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Runpack_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "RunpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Runpack_runId_fkey" FOREIGN KEY ("runId") REFERENCES "RunpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PodSize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cpuLimit" TEXT NOT NULL,
    "memoryLimit" TEXT NOT NULL,
    "cpuRequest" TEXT NOT NULL,
    "memoryRequest" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RunpackPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repository" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "command" TEXT,
    "readOnlyAppStorage" BOOLEAN NOT NULL,
    "securityContextId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RunpackPhase_securityContextId_fkey" FOREIGN KEY ("securityContextId") REFERENCES "SecurityContext" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SecurityContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runAsUser" INTEGER NOT NULL,
    "runAsGroup" INTEGER NOT NULL,
    "runAsNonRoot" BOOLEAN NOT NULL,
    "readOnlyRootFilesystem" BOOLEAN NOT NULL,
    "allowPrivilegeEscalation" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "securityCtxId" TEXT NOT NULL,
    CONSTRAINT "Capability_securityCtxId_fkey" FOREIGN KEY ("securityCtxId") REFERENCES "SecurityContext" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapabilityAdd" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    CONSTRAINT "CapabilityAdd_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CapabilityDrop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "capabilityId" TEXT NOT NULL,
    CONSTRAINT "CapabilityDrop_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_UserToUserGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserToUserGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserToUserGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToToken" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToToken_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToToken_B_fkey" FOREIGN KEY ("B") REFERENCES "Token" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroup_name_key" ON "UserGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_UserToUserGroup_AB_unique" ON "_UserToUserGroup"("A", "B");

-- CreateIndex
CREATE INDEX "_UserToUserGroup_B_index" ON "_UserToUserGroup"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToToken_AB_unique" ON "_PermissionToToken"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToToken_B_index" ON "_PermissionToToken"("B");

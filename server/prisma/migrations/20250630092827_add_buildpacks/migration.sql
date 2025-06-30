-- AlterTable
ALTER TABLE "Token" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Buildpack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "fetchId" TEXT NOT NULL,
    "buildId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Buildpack_fetchId_fkey" FOREIGN KEY ("fetchId") REFERENCES "BuildpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Buildpack_buildId_fkey" FOREIGN KEY ("buildId") REFERENCES "BuildpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Buildpack_runId_fkey" FOREIGN KEY ("runId") REFERENCES "BuildpackPhase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BuildpackPhase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repository" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "command" TEXT,
    "readOnlyAppStorage" BOOLEAN NOT NULL,
    "securityContextId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BuildpackPhase_securityContextId_fkey" FOREIGN KEY ("securityContextId") REFERENCES "SecurityContext" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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

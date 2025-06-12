-- CreateTable
CREATE TABLE "Audit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'normal',
    "action" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "pipeline" TEXT NOT NULL,
    "resource" TEXT NOT NULL DEFAULT 'unknown',
    "message" TEXT NOT NULL
);

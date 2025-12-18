-- Create Employee table
CREATE TABLE IF NOT EXISTS "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create LotterySession table
CREATE TABLE IF NOT EXISTS "LotterySession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create Participant table
CREATE TABLE IF NOT EXISTS "Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "tickets" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("sessionId") REFERENCES "LotterySession"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("employeeId", "sessionId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Participant_employeeId_idx" ON "Participant"("employeeId");
CREATE INDEX IF NOT EXISTS "Participant_sessionId_idx" ON "Participant"("sessionId");

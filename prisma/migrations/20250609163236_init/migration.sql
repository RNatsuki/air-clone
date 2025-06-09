-- CreateTable
CREATE TABLE "Device" (
    "mac" TEXT NOT NULL PRIMARY KEY,
    "ip" TEXT,
    "hostname" TEXT,
    "model" TEXT,
    "ssid" TEXT,
    "firmware" TEXT,
    "sshUsername" TEXT NOT NULL,
    "sshPassword" TEXT NOT NULL,
    "lastSeen" INTEGER,
    "cpu" REAL,
    "memory" REAL,
    "uptime" INTEGER,
    "signal" INTEGER
);

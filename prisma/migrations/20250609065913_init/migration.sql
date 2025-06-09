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
    "lastSeen" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceMac" TEXT NOT NULL,
    "cpu" REAL,
    "memory" REAL,
    "uptime" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metric_deviceMac_fkey" FOREIGN KEY ("deviceMac") REFERENCES "Device" ("mac") ON DELETE CASCADE ON UPDATE CASCADE
);

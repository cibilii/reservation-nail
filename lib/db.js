import path from "path";
import { promises as fs } from "fs";

// lib/db.js

const dataFilePath = path.join(process.cwd(), 'lib', 'data.json');
const backupDir = path.join(process.cwd(), 'backups');

let isWriting = false;
let writeQueue = [];

const defaultData = {
  bookings: [],
  nextId: 1,
  settings: {
    workingHours: { start: "09:00", end: "20:00" },
    workingDays: [0, 1, 2, 3, 4, 6], // یکشنبه تا پنج‌شنبه و جمعه
    holidays: [],
    slotDuration: 30,
  },
};

async function acquireLock() {
  while (isWriting) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  isWriting = true;
}

function releaseLock() {
  isWriting = false;
  if (writeQueue.length > 0) {
    const next = writeQueue.shift();
    next();
  }
}

async function ensureFile() {
  try {
    await fs.access(dataFilePath);
  } catch {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

export async function readData() {
  await ensureFile();
  try {
    const rawData = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { ...defaultData, bookings: [], nextId: 1 };
  }
}

export async function writeData(data) {
  return new Promise((resolve, reject) => {
    const writeOperation = async () => {
      await acquireLock();
      try {
        const tempFile = `${dataFilePath}.tmp`;
        await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
        await fs.rename(tempFile, dataFilePath);
        resolve();
      } catch (error) {
        console.error('Error writing data file:', error);
        reject(error);
      } finally {
        releaseLock();
      }
    };
    writeQueue.push(writeOperation);
    if (!isWriting) {
      writeOperation();
    }
  });
}

export async function backup() {
  await ensureFile();
  try {
    await fs.mkdir(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);
    await fs.copyFile(dataFilePath, backupPath);
    console.log(`Backup created successfully: ${backupFileName}`);
    return { success: true, fileName: backupFileName };
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
}
import { readData, writeData } from "./db";

export async function getServiceById(id) {
  const data = await readData();
  return data.services?.find(s => s.id === id);
}

export async function updateService(id, updates) {
  const data = await readData();

  const index = data.services.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Service not found");

  data.services[index] = {
    ...data.services[index],
    ...updates,
  };

  await writeData(data);
  return data.services[index];
}

export async function deleteService(id) {
  const data = await readData();

  data.services = data.services.filter(s => s.id !== id);

  await writeData(data);
  return true;
}
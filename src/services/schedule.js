import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

const COLLECTION = "tv_schedule";

export async function getSchedule(filters = {}) {
  const constraints = { orderBy: [{ field: "airDate", dir: "asc" }] };
  const conds = [];

  if (filters.date) {
    conds.push({ field: "airDate", operator: "==", value: filters.date });
  }
  if (filters.isActive !== undefined) {
    conds.push({ field: "isActive", operator: "==", value: filters.isActive });
  }

  if (conds.length) constraints.filters = conds;
  return getDocs(COLLECTION, constraints);
}

export async function getScheduleItem(id) {
  return getDoc(COLLECTION, id);
}

export async function createScheduleItem(data) {
  return addDoc(COLLECTION, data);
}

export async function updateScheduleItem(id, data) {
  return updateDoc(COLLECTION, id, data);
}

export async function deleteScheduleItem(id) {
  return deleteDoc(COLLECTION, id);
}

export async function getUpcomingSchedule(limit = 20) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getDocs(COLLECTION, {
    filters: [
      { field: "airDate", operator: ">=", value: today.toISOString().split("T")[0] },
      { field: "isActive", operator: "==", value: true },
    ],
    orderBy: [{ field: "airDate", dir: "asc" }, { field: "airTime", dir: "asc" }],
    limit,
  });
}

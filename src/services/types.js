import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

const COLLECTION = "types";

export async function getTypes() {
  return getDocs(COLLECTION, {
    orderBy: [{ field: "sortOrder", dir: "asc" }],
  });
}

export async function getType(id) {
  return getDoc(COLLECTION, id);
}

export async function createType(data) {
  return addDoc(COLLECTION, data);
}

export async function updateType(id, data) {
  return updateDoc(COLLECTION, id, data);
}

export async function deleteType(id) {
  return deleteDoc(COLLECTION, id);
}

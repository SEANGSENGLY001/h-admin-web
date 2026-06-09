import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

const COLLECTION = "categories";

export async function getCategories() {
  return getDocs(COLLECTION, {
    orderBy: [{ field: "sortOrder", dir: "asc" }],
  });
}

export async function getCategory(id) {
  return getDoc(COLLECTION, id);
}

export async function createCategory(data) {
  return addDoc(COLLECTION, data);
}

export async function updateCategory(id, data) {
  return updateDoc(COLLECTION, id, data);
}

export async function deleteCategory(id) {
  return deleteDoc(COLLECTION, id);
}

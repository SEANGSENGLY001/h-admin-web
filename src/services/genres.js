import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

const COLLECTION = "genres";

export async function getGenres() {
  return getDocs(COLLECTION, {
    orderBy: [{ field: "sortOrder", dir: "asc" }],
  });
}

export async function getGenre(id) {
  return getDoc(COLLECTION, id);
}

export async function createGenre(data) {
  return addDoc(COLLECTION, data);
}

export async function updateGenre(id, data) {
  return updateDoc(COLLECTION, id, data);
}

export async function deleteGenre(id) {
  return deleteDoc(COLLECTION, id);
}

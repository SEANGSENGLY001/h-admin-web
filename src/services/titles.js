import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

const COLLECTION = "titles";

export async function getTitles(filters = {}) {
  const constraints = { filters: [], orderBy: [{ field: "createdAt", dir: "desc" }] };

  if (filters.contentType) {
    constraints.filters.push({ field: "contentType", operator: "==", value: filters.contentType });
  }
  if (filters.status) {
    constraints.filters.push({ field: "status", operator: "==", value: filters.status });
  }
  if (filters.categoryId) {
    constraints.filters.push({ field: "categoryIds", operator: "array-contains", value: filters.categoryId });
  }
  if (filters.typeId) {
    constraints.filters.push({ field: "typeIds", operator: "array-contains", value: filters.typeId });
  }
  if (filters.genreId) {
    constraints.filters.push({ field: "genreIds", operator: "array-contains", value: filters.genreId });
  }
  if (filters.limit) {
    constraints.limit = filters.limit;
  }

  return getDocs(COLLECTION, constraints);
}

export async function getTitle(id) {
  return getDoc(COLLECTION, id);
}

export async function createTitle(data) {
  return addDoc(COLLECTION, data);
}

export async function updateTitle(id, data) {
  return updateDoc(COLLECTION, id, data);
}

export async function deleteTitle(id) {
  return deleteDoc(COLLECTION, id);
}

export function getTrending(limit = 10) {
  return getDocs(COLLECTION, {
    filters: [{ field: "isTrending", operator: "==", value: true }],
    orderBy: [{ field: "trendingScore", dir: "desc" }],
    limit,
  });
}

export function getNewReleases(limit = 10) {
  return getDocs(COLLECTION, {
    filters: [{ field: "isNew", operator: "==", value: true }],
    orderBy: [{ field: "createdAt", dir: "desc" }],
    limit,
  });
}

export function getUpcoming(limit = 10) {
  return getDocs(COLLECTION, {
    filters: [{ field: "isUpcoming", operator: "==", value: true }],
    orderBy: [{ field: "releaseDate", dir: "asc" }],
    limit,
  });
}

export async function getTitleStats() {
  const all = await getDocs(COLLECTION);
  return {
    total: all.length,
    movies: all.filter((t) => t.contentType === "movie").length,
    series: all.filter((t) => t.contentType === "series").length,
    active: all.filter((t) => t.status === "active").length,
  };
}

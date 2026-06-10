import {
  collection,
  doc,
  addDoc as fbAddDoc,
  updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc,
  getDoc as fbGetDoc,
  getDocs as fbGetDocs,
  query as fbQuery,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "firebase/firestore/lite";
import { db } from "../firebase";

function colRef(path) {
  return collection(db, path);
}

function docRef(path, id) {
  return doc(db, path, id);
}

function addTimestamps(data, isUpdate = false) {
  const ts = serverTimestamp();
  const clean = { ...data };
  delete clean.role;
  return isUpdate
    ? { ...clean, updatedAt: clean.updatedAt ?? ts }
    : { ...clean, createdAt: clean.createdAt ?? ts, updatedAt: clean.updatedAt ?? ts };
}

function extractData(snapshot) {
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

function extractAll(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addDoc(collectionPath, data) {
  const ref = colRef(collectionPath);
  const snap = await fbAddDoc(ref, addTimestamps(data));
  return snap.id;
}

export async function updateDoc(collectionPath, docId, data) {
  const ref = docRef(collectionPath, docId);
  await fbUpdateDoc(ref, addTimestamps(data, true));
}

export async function deleteDoc(collectionPath, docId) {
  await fbDeleteDoc(docRef(collectionPath, docId));
}

export async function getDoc(collectionPath, docId) {
  const snap = await fbGetDoc(docRef(collectionPath, docId));
  return extractData(snap);
}

export async function getDocs(collectionPath, constraints = {}) {
  const ref = colRef(collectionPath);
  const q = buildQuery(ref, constraints);
  const snap = await fbGetDocs(q);
  return extractAll(snap);
}

function buildQuery(ref, { filters, orderBy: order, limit: lim, startAfter: after } = {}) {
  const clauses = [];

  if (filters) {
    for (const f of Array.isArray(filters) ? filters : [filters]) {
      if (f.field && f.operator && f.value !== undefined) {
        clauses.push(where(f.field, f.operator, f.value));
      }
    }
  }

  if (order) {
    const arr = Array.isArray(order) ? order : [order];
    for (const o of arr) {
      clauses.push(orderBy(o.field, o.dir || "asc"));
    }
  }

  if (after) {
    clauses.push(startAfter(after));
  }

  if (lim !== undefined) {
    clauses.push(limit(lim));
  }

  return clauses.length > 0 ? fbQuery(ref, ...clauses) : ref;
}

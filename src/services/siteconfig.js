import { doc, setDoc } from "firebase/firestore/lite";
import { db } from "../firebase";
import { getDoc, updateDoc } from "./db";

const REF = doc(db, "siteconfig", "settings");

export async function getSiteConfig() {
  return getDoc("siteconfig", "settings");
}

import { serverTimestamp } from "firebase/firestore/lite";

export async function updateSection(section, data) {
  return setDoc(REF, { [section]: data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateSocial(data) {
  return updateSection("social", data);
}

export async function updateAbout(data) {
  return updateSection("aboutus", data);
}

export async function updateWebsite(data) {
  return updateSection("website", data);
}

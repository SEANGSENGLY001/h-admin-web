import { getDoc, updateDoc } from "./db";

const PATH = "siteconfig/settings";

export async function getSiteConfig() {
  return getDoc("siteconfig", "settings");
}

export async function updateSection(section, data) {
  return updateDoc("siteconfig", "settings", { [section]: data });
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

import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from "./db";

function subPath(titleId) {
  return `titles/${titleId}/videos`;
}

export async function getVideos(titleId) {
  return getDocs(subPath(titleId), {
    orderBy: [{ field: "sortOrder", dir: "asc" }],
  });
}

export async function getVideo(titleId, videoId) {
  return getDoc(subPath(titleId), videoId);
}

export async function createVideo(titleId, data) {
  return addDoc(subPath(titleId), data);
}

export async function updateVideo(titleId, videoId, data) {
  return updateDoc(subPath(titleId), videoId, data);
}

export async function deleteVideo(titleId, videoId) {
  return deleteDoc(subPath(titleId), videoId);
}

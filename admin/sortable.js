
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  db,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

export function makeGallerySortable() {
  let dragged;
  galleryList.querySelectorAll(".gallery-item").forEach(item => {
    item.draggable = true;

    item.addEventListener("dragstart", e => dragged = item);
    item.addEventListener("dragover", e => e.preventDefault());
    item.addEventListener("drop", e => {
      if (dragged === item) return;
      galleryList.insertBefore(dragged, item.nextSibling);
      // Optionally, update a "position" field in Firestore if needed
    });
  });
}

// Call after gallery render
onSnapshot(collection(db, "gallery"), snapshot => {
  galleryList.innerHTML = "";
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.innerHTML = `
      <img src="${data.url}" alt="${data.eventName}" width="150"/>
      <p><strong>Event:</strong> ${data.eventName}</p>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Group:</strong> ${data.group}</p>
      ${data.cover ? `<p><em>Cover Image</em></p>` : ""}
    `;
    galleryList.appendChild(div);
  });
  makeGallerySortable();
});

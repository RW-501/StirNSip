import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = { 
  apiKey: "AIzaSyBlN_vkUzQMfsCSFttdKA2ZMNz8v26JrQ8",
  authDomain: "stirnsip-978dc.firebaseapp.com",
  projectId: "stirnsip-978dc",
  storageBucket: "stirnsip-978dc.firebasestorage.app",
  messagingSenderId: "727033774529",
  appId: "1:727033774529:web:b2d103f6231bec75916f40",
  measurementId: "G-E72374YTPE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const classesList = document.getElementById("classes-list");

// Render visible classes
function renderClasses(docs) {
  classesList.innerHTML = "";

  if (docs.length === 0) {
    classesList.innerHTML = `<p>No upcoming classes yet — check back soon!</p>`;
    return;
  }

  docs.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("class-card");
    div.innerHTML = `
      <h3>${data.name}</h3>
      <p><strong>Date:</strong> ${data.date} @ ${data.time}</p>
      <p>${data.description}</p>
      <a href="class.html?id=${docSnap.id}" class="cta-btn">View Details</a>
    `;
    classesList.appendChild(div);
  });
}

// Only load visible classes
const q = query(
  collection(db, "classes"),
  where("visible", "==", true),
  orderBy("date", "asc")
);

onSnapshot(q, (snapshot) => {
  renderClasses(snapshot.docs);
});

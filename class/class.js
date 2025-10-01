// js/class.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, query, doc, getDocs, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import { showToast } from 'https://rw-501.github.io/StirNSip/js/showToast.js';

// Firebase config
const firebaseConfig = { 
  apiKey: "AIzaSyBlN_vkUzQMfsCSFttdKA2ZMNz8v26JrQ8",
  authDomain: "stirnsip-978dc.firebaseapp.com",
  projectId: "stirnsip-978dc",
  storageBucket: "stirnsip-978dc.firebasestorage.app",
  messagingSenderId: "727033774529",
  appId: "1:727033774529:web:b2d103f6231bec75916f40",
  measurementId: "G-E72374YTPE"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Get class ID
const classId = new URLSearchParams(window.location.search).get("id");

// Class detail elements
const classNameEl = document.getElementById("className");
const classDateEl = document.getElementById("classDate");
const classTimeEl = document.getElementById("classTime");
const classDescriptionEl = document.getElementById("classDescription");
const classVibeEl = document.getElementById("classVibe");
const classSizeEl = document.getElementById("classSize");
const spotsAvailableEl = document.getElementById("spotsAvailable");
const singlesCostEl = document.getElementById("singlesCost");
const couplesCostEl = document.getElementById("couplesCost");
const whatCookingEl = document.getElementById("whatCooking");
const recipeContentEl = document.getElementById("recipeContent");

const eventbriteBtn = document.getElementById("eventbriteBtn");
const otherBuyBtn = document.getElementById("otherBuyBtn");

async function loadClassDetails() {
  if (!classId) {
    classNameEl.textContent = "Class not found.";
    return;
  }

  try {
    const docRef = doc(db, "classes", classId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      classNameEl.textContent = "Class not found.";
      return;
    }

    const data = docSnap.data();


    classNameEl.textContent = data.name;
    classDescriptionEl.textContent = data.description;
    classVibeEl.textContent = `Vibe: ${data.vibe || "N/A"}`;
    classSizeEl.textContent = `Size: ${data.classSize || 0}`;
    spotsAvailableEl.textContent = `Spots Available: ${data.spotsAvailable || 0}`;
    singlesCostEl.textContent = `Singles: $${data.singlesCost?.toFixed(2) || 0}`;
    couplesCostEl.textContent = `Couples: $${data.couplesCost?.toFixed(2) || 0}`;
    whatCookingEl.textContent = `What We’re Cooking: ${data.whatCooking || "TBD"}`;

    // If multiple date/times exist
    if (data.dateTimes && data.dateTimes.length > 0) {
      classDateEl.innerHTML = "Dates: " + data.dateTimes.map(dt => dt.date).join(", ");
      classTimeEl.innerHTML = "Times: " + data.dateTimes.map(dt => dt.time).join(", ");
    } else {
      classDateEl.textContent = `Date: ${data.date || "TBD"}`;
      classTimeEl.textContent = `Time: ${data.time || "TBD"}`;
    }

    // Recipe / extras
    recipeContentEl.innerHTML = data.recipe || "<p>No recipe shared yet — check back soon!</p>";

    // Buy buttons
    eventbriteBtn.href = data.eventbriteLink || "#";
    otherBuyBtn.href = data.otherBuyLink || "#";

    // Load upcoming classes & merch
    loadUpcomingClasses(data.name);
    loadMerch();

  } catch (err) {
    console.error("Error loading class details:", err);
    classNameEl.textContent = "Error loading class.";
  }
}

// Upcoming classes (exclude current)
async function loadUpcomingClasses(currentClassName) {
  const classesList = document.getElementById("classesList");
  classesList.innerHTML = "<p>Loading upcoming classes...</p>";

  try {
    const q = query(
      collection(db, "classes"),
      where("visible", "==", true),
      orderBy("date", "asc")
    );
    const snapshot = await getDocs(q);
console.log("loadUpcomingClasses snapshot: ",snapshot);

    const filtered = snapshot.docs.filter(docSnap => docSnap.data().name !== currentClassName);
    if (!filtered.length) {
      classesList.innerHTML = "<p>No upcoming classes yet.</p>";
      return;
    }

    classesList.innerHTML = "";
    filtered.forEach(docSnap => {
      const data = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("class-card");
console.log("Classes data: ",data);

      div.innerHTML = `
        <h3>${data.name}</h3>
        <p>${data.dateTimes?.map(dt => `${dt.date} @ ${dt.time}`).join(", ") || `${data.date} @ ${data.time}`}</p>
        <p>${data.description}</p>
        <a href="class.html?id=${docSnap.id}" class="cta-btn">View Details</a>
      `;

      classesList.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading upcoming classes:", err);
    classesList.innerHTML = "<p>Error loading upcoming classes.</p>";
  }
}

// Simple merch loader example
async function loadMerch() {
  const merchList = document.getElementById("merchList");
  merchList.innerHTML = "<p>Loading merch...</p>";

  try {
    const snapshot = await getDocs(collection(db, "merch"));
    if (snapshot.empty) {
      merchList.innerHTML = "<p>No merch available yet.</p>";
      return;
    }
console.log("snapshot: ",snapshot);

    merchList.innerHTML = "";
    snapshot.docs.forEach(docSnap => {
      const item = docSnap.data();
      console.log("data Mearch item: ",item);

      const div = document.createElement("div");
      div.classList.add("merch-item");
      div.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}" />
        <p>${item.name}</p>
        <p>$${item.price?.toFixed(2)}</p>
        <a href="${item.buyLink}" class="cta-btn" target="_blank">Buy</a>
      `;
      merchList.appendChild(div);
    });

  } catch (err) {
    console.error("Error loading merch:", err);
    merchList.innerHTML = "<p>Error loading merch.</p>";
  }
}

loadClassDetails();

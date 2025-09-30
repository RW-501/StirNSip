// js/class.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

// Helper: get query param from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Get class ID
const classId = getQueryParam("id");

// Load class details
async function loadClassDetails() {
  if (!classId) {
    document.getElementById("className").textContent = "Class not found.";
    return;
  }

  try {
    const docRef = doc(db, "classes", classId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      document.getElementById("className").textContent = data.name;
      document.getElementById("classDate").textContent = `Date: ${data.date}`;
      document.getElementById("classTime").textContent = `Time: ${data.time}`;
      document.getElementById("classDescription").textContent = data.description;

      // Recipes / extras (rich text allowed)
      const recipeContainer = document.getElementById("recipeContent");
      if (data.recipe && data.recipe.trim() !== "") {
        recipeContainer.innerHTML = data.recipe; 
      } else {
        recipeContainer.innerHTML = `<p>No recipe shared yet — check back soon!</p>`;
      }
    } else {
      document.getElementById("className").textContent = "Class not found.";
    }
  } catch (err) {
    console.error("Error loading class details:", err);
    document.getElementById("className").textContent = "Error loading class.";
  }
}

loadClassDetails();

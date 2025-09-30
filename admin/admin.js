// js/admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";


// Config
const firebaseConfig = {
  apiKey: "AIzaSyBlN_vkUzQMfsCSFttdKA2ZMNz8v26JrQ8",
  authDomain: "stirnsip-978dc.firebaseapp.com",
  projectId: "stirnsip-978dc",
  storageBucket: "stirnsip-978dc.firebasestorage.app",
  messagingSenderId: "727033774529",
  appId: "1:727033774529:web:b2d103f6231bec75916f40",
  measurementId: "G-E72374YTPE",
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Init Storage
const storage = getStorage(app);


// DOM
const classForm = document.getElementById("class-form");
const cancelEditBtn = document.getElementById("cancelEdit");
const classesList = document.getElementById("admin-classes-list");

// Save / Update class
classForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("classId").value;
  const data = {
    name: document.getElementById("className").value,
    date: document.getElementById("classDate").value,
    time: document.getElementById("classTime").value,
    description: document.getElementById("classDescription").value,
    recipe: document.getElementById("classRecipe").value || "",
    visible: document.getElementById("classVisible").checked,
    updatedAt: new Date(),
  };

  try {
    if (id) {
      // Update existing
      await updateDoc(doc(db, "classes", id), data);
      alert("Class updated!");
    } else {
      // Add new
      data.createdAt = new Date();
      await addDoc(collection(db, "classes"), data);
      alert("Class added!");
    }
    classForm.reset();
    document.getElementById("classId").value = "";
    cancelEditBtn.style.display = "none";
  } catch (err) {
    console.error("Error saving class: ", err);
  }
});

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  classForm.reset();
  document.getElementById("classId").value = "";
  cancelEditBtn.style.display = "none";
});

// Render classes
function renderClasses(docs) {
  classesList.innerHTML = "";
  docs.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("class-item");

    div.innerHTML = `
      <h3>${data.name} ${!data.visible ? "(Hidden)" : ""}</h3>
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p>${data.description}</p>
      ${data.recipe ? `<p><em>Recipe Info: ${data.recipe}</em></p>` : ""}
      <button data-id="${docSnap.id}" class="edit-btn">Edit</button>
      <button data-id="${docSnap.id}" class="delete-btn">Delete</button>
      <button data-id="${docSnap.id}" class="toggle-btn">${data.visible ? "Hide" : "Show"}</button>
    `;

    classesList.appendChild(div);
  });

  // Edit
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const docSnap = docs.find((d) => d.id === id);
      const data = docSnap.data();

      document.getElementById("classId").value = id;
      document.getElementById("className").value = data.name;
      document.getElementById("classDate").value = data.date;
      document.getElementById("classTime").value = data.time;
      document.getElementById("classDescription").value = data.description;
      document.getElementById("classRecipe").value = data.recipe || "";
      document.getElementById("classVisible").checked = data.visible ?? true;

      cancelEditBtn.style.display = "inline-block";
    });
  });

  // Delete
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Delete this class?")) {
        await deleteDoc(doc(db, "classes", id));
      }
    });
  });

  // Toggle Show/Hide
  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const docSnap = docs.find((d) => d.id === id);
      const visible = !docSnap.data().visible;
      await updateDoc(doc(db, "classes", id), { visible });
    });
  });
}

// Live listener
onSnapshot(collection(db, "classes"), (snapshot) => {
  renderClasses(snapshot.docs);
});


// DOM
const galleryForm = document.getElementById("gallery-form");
const galleryList = document.getElementById("gallery-list");

// Upload gallery image
galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = document.getElementById("galleryImage").files[0];
  const eventName = document.getElementById("galleryEvent").value;
  const date = document.getElementById("galleryDate").value;
  const location = document.getElementById("galleryLocation").value;
  const group = document.getElementById("galleryGroup").value;
  const isCover = document.getElementById("galleryCover").checked;

  if (!file) return alert("Please select an image");

  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `gallery/${fileName}`);

  try {
    // Upload image
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    // Save metadata in Firestore
    await addDoc(collection(db, "gallery"), {
      eventName,
      date,
      location,
      group,
      cover: isCover,
      url: imageUrl,
      createdAt: new Date()
    });

    alert("Image uploaded!");
    galleryForm.reset();
  } catch (err) {
    console.error("Error uploading image: ", err);
  }
});

// Render gallery images live
onSnapshot(collection(db, "gallery"), (snapshot) => {
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
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query, 
  doc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Firebase Config
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
const storage = getStorage(app);

const auth = getAuth();
const loginScreen = document.getElementById("login-screen");
const siteSettings = document.getElementById("site-settings");
const loginError = document.getElementById("loginError");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const phoneLoginBtn = document.getElementById("phoneLoginBtn");
const phoneLoginForm = document.getElementById("phoneLoginForm");
const phoneNumberInput = document.getElementById("phoneNumber");
const sendCodeBtn = document.getElementById("sendCodeBtn");
const verificationCodeInput = document.getElementById("verificationCode");
const verifyCodeBtn = document.getElementById("verifyCodeBtn");

// Allowed emails and phone numbers
const allowedEmails = ["1988lrp@gmail.com", "owner@stirnsip.com"];
const allowedPhones = ["+19725977878", "+14445556666"];

// Show/hide sections based on login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check allowed emails/phones
    const emailOk = user.email && allowedEmails.includes(user.email);
    const phoneOk = user.phoneNumber && allowedPhones.includes(user.phoneNumber);

    if (emailOk || phoneOk) {
      loginScreen.style.display = "none";
      siteSettings.style.display = "block";
      

// Initial load
loadClasses();


    } else {
      auth.signOut();
      loginError.textContent = "Unauthorized user.";
    }
  } else {
    loginScreen.style.display = "block";
    siteSettings.style.display = "none";
  }
});

// Google login
googleLoginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    if (!allowedEmails.includes(user.email)) {
      await auth.signOut();
      loginError.textContent = "Unauthorized Google account.";
    } else {
      loginError.textContent = "";
    }
  } catch(err) {
    console.error(err);
    loginError.textContent = "Google login failed.";
  }
});

// Phone login
phoneLoginBtn.addEventListener("click", () => {
  phoneLoginForm.style.display = "block";
  window.recaptchaVerifier = new RecaptchaVerifier('sendCodeBtn', {
    'size': 'invisible',
    'callback': () => {}
  }, auth);
});

sendCodeBtn.addEventListener("click", async () => {
  const phoneNumber = phoneNumberInput.value;
  if (!allowedPhones.includes(phoneNumber)) {
    loginError.textContent = "Unauthorized phone number.";
    return;
  }
  const appVerifier = window.recaptchaVerifier;
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    verificationCodeInput.style.display = "block";
    verifyCodeBtn.style.display = "block";
    loginError.textContent = "";
  } catch(err) {
    console.error(err);
    loginError.textContent = "Failed to send code.";
  }
});

verifyCodeBtn.addEventListener("click", async () => {
  const code = verificationCodeInput.value;
  try {
    await window.confirmationResult.confirm(code);
    loginError.textContent = "";
  } catch(err) {
    console.error(err);
    loginError.textContent = "Invalid verification code.";
  }
});




const classForm = document.getElementById("class-form"); 
const cancelEditBtn = document.getElementById("cancelEdit"); 
const classesList = document.getElementById("admin-classes-list"); 
const classCoverSelect = document.getElementById("classCover"); 
const coverPreview = document.getElementById("coverPreview"); 
const galleryForm = document.getElementById("gallery-form"); 
const galleryList = document.getElementById("gallery-list"); 
const classCost = document.getElementById("classCost"); 
const classSize = document.getElementById("classSize"); 
const spotsAvailable = document.getElementById("spotsAvailable"); 
const classVibe = document.getElementById("classVibe");

// Load & Render Classes
async function loadClasses() {
  classesList.innerHTML = "<p>Loading classes...</p>";
  try {
    const q = query(collection(db, "classes"), orderBy("date", "asc"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      classesList.innerHTML = "<p>No classes added yet.</p>";
      return;
    }

    classesList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const cls = docSnap.data();
      const div = document.createElement("div");
      div.className = "class-item";

      div.innerHTML = `
        <h4>${cls.name}</h4>
        <p><strong>Date:</strong> ${cls.date} ${cls.time}</p>
        <p><strong>Cost:</strong> $${cls.classCost?.toFixed(2) || 0}</p>
        <p><strong>Size:</strong> ${cls.classSize}</p>
        <p><strong>Spots:</strong> ${cls.spotsAvailable}</p>
        <p><strong>Vibe:</strong> ${cls.vibe || "N/A"}</p>
        <img src="${cls.coverImage || ""}" alt="Cover" style="max-width:150px;" />
        <p>${cls.description}</p>
        <button data-id="${docSnap.id}" class="edit-class">Edit</button>
        <button data-id="${docSnap.id}" class="delete-class">Delete</button>
      `;

      classesList.appendChild(div);
    });

    // Attach edit / delete handlers
    document.querySelectorAll(".edit-class").forEach(btn => {
      btn.addEventListener("click", () => editClass(btn.dataset.id));
    });

    document.querySelectorAll(".delete-class").forEach(btn => {
      btn.addEventListener("click", () => deleteClass(btn.dataset.id));
    });

  } catch (err) {
    console.error("Error loading classes:", err);
    classesList.innerHTML = "<p>Error loading classes.</p>";
  }
}

// Edit Class
async function editClass(id) {
  try {
    const docSnap = await getDoc(doc(db, "classes", id));
    if (docSnap.exists()) {
      const cls = docSnap.data();

      document.getElementById("classId").value = id;
      document.getElementById("className").value = cls.name;
      document.getElementById("classDate").value = cls.date;
      document.getElementById("classTime").value = cls.time;
      document.getElementById("classDescription").value = cls.description;
      document.getElementById("classRecipe").value = cls.recipe || "";
      document.getElementById("classVisible").checked = cls.visible;

      classCost.value = cls.classCost || 0;
      classSize.value = cls.classSize || 0;
      spotsAvailable.value = cls.spotsAvailable || 0;
      classVibe.value = cls.vibe || "";

      classCoverSelect.value = cls.coverImage || "";
      coverPreview.src = cls.coverImage || "";

      cancelEditBtn.style.display = "inline-block";
    }
  } catch (err) {
    console.error("Error editing class:", err);
  }
}

// Delete Class
async function deleteClass(id) {
  if (!confirm("Are you sure you want to delete this class?")) return;
  try {
    await deleteDoc(doc(db, "classes", id));
    alert("Class deleted!");
    loadClasses();
  } catch (err) {
    console.error("Error deleting class:", err);
  }
}

// Reload list after save
classForm.addEventListener("submit", async () => {
  loadClasses();
});
cancelEditBtn.addEventListener("click", () => {
  loadClasses();
});

// Drag & Drop handling
const dropZone = document.getElementById("drop-zone");
const galleryInput = document.getElementById("galleryImage");

dropZone.addEventListener("click", () => galleryInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#333";
});
dropZone.addEventListener("dragleave", () => {
  dropZone.style.borderColor = "#aaa";
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.borderColor = "#aaa";
  galleryInput.files = e.dataTransfer.files;
});

// -------------------- Gallery Upload --------------------
galleryForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const files = galleryInput.files;
  if (!files.length) return alert("Please select at least one image");

  const group = document.getElementById("galleryGroup").value;
  const isCover = document.getElementById("galleryCover").checked;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `gallery/${fileName}`);

    try {
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "gallery"), {
        group,
        cover: isCover && i === 0, // only first file marked cover
        url: imageUrl,
        visible: true,
        createdAt: new Date()
      });
    } catch (err) {
      console.error("Error uploading image: ", err);
      alert("Error uploading some files. Check console.");
    }
  }

  alert(`${files.length} image(s) uploaded!`);
  galleryForm.reset();
  galleryInput.value = "";
});

// -------------------- Gallery Live Render --------------------
onSnapshot(collection(db, "gallery"), snapshot => {
  galleryList.innerHTML = "";
  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.style.border = "1px solid #ddd";
    div.style.padding = "5px";

    div.innerHTML = `
      <img src="${data.url}" alt="${data.group}" width="150"/>
      <p><strong>Group:</strong> ${data.group || "N/A"}</p>
      ${data.cover ? `<p style="color:green;"><em>Cover Image</em></p>` : ""}
      <button data-id="${id}" class="delete-gallery">Delete</button>
    `;

    galleryList.appendChild(div);
  });

  // Delete handlers
  document.querySelectorAll(".delete-gallery").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this image?")) return;
      try {
        await deleteDoc(doc(db, "gallery", btn.dataset.id));
        alert("Image deleted");
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    });
  });
});


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

// DOM
const classForm = document.getElementById("class-form");
const cancelEditBtn = document.getElementById("cancelEdit");
const classesList = document.getElementById("admin-classes-list");
const classCoverSelect = document.getElementById("classCover");
const coverPreview = document.getElementById("coverPreview");
const galleryForm = document.getElementById("gallery-form");
const galleryList = document.getElementById("gallery-list");



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
      

      // Live listener for classes
    onSnapshot(collection(db, "classes"), snapshot => renderClasses(snapshot.docs));

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


// Login button
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value;
  const password = loginPassword.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginError.textContent = "";
  } catch(err) {
    console.error("Login error:", err);
    loginError.textContent = "Invalid email or password.";
  }
});


// -------------------- Classes --------------------
async function loadCoverOptions(className) {
  const gallerySnapshot = await getDocs(collection(db, "gallery"));
  classCoverSelect.innerHTML = `<option value="">-- Select Cover --</option>`;
  
  gallerySnapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    if (data.eventName === className) {
      const option = document.createElement("option");
      option.value = data.url;
      option.textContent = `${data.date} - ${data.group || "Gallery"}`;
      classCoverSelect.appendChild(option);
    }
  });
}

// Preview cover image
classCoverSelect.addEventListener("change", (e) => {
  coverPreview.src = e.target.value || "";
});

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
    coverImage: classCoverSelect.value || "",
    updatedAt: new Date(),
  };

  try {
    if (id) {
      await updateDoc(doc(db, "classes", id), data);
      alert("Class updated!");
    } else {
      data.createdAt = new Date();
      await addDoc(collection(db, "classes"), data);
      alert("Class added!");
    }
    classForm.reset();
    document.getElementById("classId").value = "";
    coverPreview.src = "";
    cancelEditBtn.style.display = "none";
  } catch (err) {
    console.error("Error saving class: ", err);
  }
});

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  classForm.reset();
  document.getElementById("classId").value = "";
  coverPreview.src = "";
  cancelEditBtn.style.display = "none";
});

// Render classes
function renderClasses(docs) {
  classesList.innerHTML = "";
  docs.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("class-item");
    div.innerHTML = `
      <h3>${data.name} ${!data.visible ? "(Hidden)" : ""}</h3>
      ${data.coverImage ? `<img src="${data.coverImage}" alt="Cover" width="150"/>` : ""}
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

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const docSnap = docs.find(d => d.id === id);
      const data = docSnap.data();

      document.getElementById("classId").value = id;
      document.getElementById("className").value = data.name;
      document.getElementById("classDate").value = data.date;
      document.getElementById("classTime").value = data.time;
      document.getElementById("classDescription").value = data.description;
      document.getElementById("classRecipe").value = data.recipe || "";
      document.getElementById("classVisible").checked = data.visible ?? true;

      await loadCoverOptions(data.name);
      classCoverSelect.value = data.coverImage || "";
      coverPreview.src = data.coverImage || "";

      cancelEditBtn.style.display = "inline-block";
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (confirm("Delete this class?")) {
        await deleteDoc(doc(db, "classes", id));
      }
    });
  });

  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const docSnap = docs.find(d => d.id === id);
      const visible = !docSnap.data().visible;
      await updateDoc(doc(db, "classes", id), { visible });
    });
  });
}


// -------------------- Gallery --------------------
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
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

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

    // Auto-refresh cover options if a class is being edited
    const currentClassName = document.getElementById("className").value;
    if (currentClassName) loadCoverOptions(currentClassName);

  } catch (err) {
    console.error("Error uploading image: ", err);
  }
});

// Live gallery rendering
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
});


const dropZone = document.getElementById("drop-zone");

// Prevent default behaviors
["dragenter","dragover","dragleave","drop"].forEach(eventName => {
  dropZone.addEventListener(eventName, e => e.preventDefault());
  dropZone.addEventListener(eventName, e => e.stopPropagation());
});

// Highlight on drag
["dragenter","dragover"].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.add("highlight"));
});
["dragleave","drop"].forEach(eventName => {
  dropZone.addEventListener(eventName, () => dropZone.classList.remove("highlight"));
});

// Handle dropped files
dropZone.addEventListener("drop", e => {
  const dt = e.dataTransfer;
  const files = dt.files;
  document.getElementById("galleryImage").files = files; // populate form
  galleryForm.requestSubmit(); // auto-submit
});

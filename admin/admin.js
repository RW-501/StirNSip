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
  orderBy, 
  getDoc, 
  doc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

import { showToast } from 'https://rw-501.github.io/StirNSip/js/showToast.js';
   
import { initImagePopup } from 'https://rw-501.github.io/StirNSip/js/imagePopup.js';

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
const classSize = document.getElementById("classSize"); 
const spotsAvailable = document.getElementById("spotsAvailable"); 
const classVibe = document.getElementById("classVibe");
const dateTimeContainer = document.getElementById("dateTimeContainer");
const addDateTimeBtn = document.getElementById("addDateTime");

// Load & Render Classes
async function loadClasses() {
  classesList.innerHTML = "<p>Loading classes...</p>";
  try {
    const q = query(collection(db, "classes"), orderBy("name", "asc")); // order by name instead of date since multiple dates exist
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

      // Build multiple date/times
      let dateTimesHTML = "";
      if (Array.isArray(cls.dateTimes)) {
        dateTimesHTML = cls.dateTimes.map(dt => `<li>${dt.date} @ ${dt.time}</li>`).join("");
      }

      div.innerHTML = `
        <h4>${cls.name}</h4>
        <ul><strong>Dates/Times:</strong> ${dateTimesHTML || "<li>N/A</li>"}</ul>
        <p><strong>Singles Cost:</strong> $${cls.singlesCost?.toFixed(2) || 0}</p>
        <p><strong>Couples Cost:</strong> $${cls.couplesCost?.toFixed(2) || 0}</p>
        <p><strong>What We're Cooking:</strong> ${cls.whatCooking || "N/A"}</p>
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

// Handle multiple date/time slots
addDateTimeBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.className = "date-time-group";
  div.innerHTML = `
    <input type="time" class="classTime" required />
    <button type="button" class="removeDateTime">Remove</button>
  `;
  dateTimeContainer.appendChild(div);

  div.querySelector(".removeDateTime").addEventListener("click", () => {
    div.remove();
  });
});

//     <input type="date" class="classDate" required />


// When saving form → gather all dates/times into an array
classForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("classId").value;
  const name = document.getElementById("className").value;
  const description = document.getElementById("classDescription").value;
  const recipe = document.getElementById("classRecipe").value;
  const whatCooking = document.getElementById("whatCooking").value;

  const eventbriteLink = document.getElementById("eventbriteLink").value;
  const secondLink = document.getElementById("secondLink").value;

  const visible = document.getElementById("classVisible").checked;

  const singlesCost = parseFloat(document.getElementById("singlesCost").value) || 0;
  const couplesCost = parseFloat(document.getElementById("couplesCost").value) || 0;
  const size = parseInt(document.getElementById("classSize").value) || 0;
  const spots = parseInt(document.getElementById("spotsAvailable").value) || 0;
  const vibe = document.getElementById("classVibe").value;
  const coverImage = classCoverSelect.value;

  // Collect multiple dates/times
  const dateTimes = [];
  document.querySelectorAll(".date-time-group").forEach(group => {
    const date = group.querySelector(".classDate").value;
    const time = group.querySelector(".classTime").value;
    if (date && time) dateTimes.push({ date, time });
  });

  const classData = {
    name,
    description,
    recipe,
    whatCooking,
    visible,
    singlesCost,
    couplesCost,
    classSize: size,
    spotsAvailable: spots,
    vibe,
    coverImage,
    secondLink,
    eventbriteLink,
    dateTimes
  };

  try {
    if (id) {
      await updateDoc(doc(db, "classes", id), classData);
    } else {
      await addDoc(collection(db, "classes"), classData);
    }
    classForm.reset();
    dateTimeContainer.innerHTML = `<div class="date-time-group">
      <input type="date" class="classDate" required />
      <input type="time" class="classTime" required />
    </div>`; // reset with one date/time
    loadClasses();
  } catch (err) {
    console.error("Error saving class:", err);
  }
});

// Edit Class
async function editClass(id) {
  try {
    const docSnap = await getDoc(doc(db, "classes", id));
    if (docSnap.exists()) {
      const cls = docSnap.data();

      document.getElementById("classId").value = id;
      document.getElementById("className").value = cls.name;
      document.getElementById("classDescription").value = cls.description;
      document.getElementById("classRecipe").value = cls.recipe || "";
      document.getElementById("whatCooking").value = cls.whatCooking || "";
      document.getElementById("classVisible").checked = cls.visible;

      document.getElementById("eventbriteLink").value = cls.eventbriteLink || "";
      document.getElementById("secondLink").value = cls.secondLink || "";

      document.getElementById("singlesCost").value = cls.singlesCost || 0;
      document.getElementById("couplesCost").value = cls.couplesCost || 0;
      classSize.value = cls.classSize || 0;
      spotsAvailable.value = cls.spotsAvailable || 0;
      classVibe.value = cls.vibe || "";

      classCoverSelect.value = cls.coverImage || "";
      coverPreview.src = cls.coverImage || "";

      // Reset date/time container
      dateTimeContainer.innerHTML = "";
      if (Array.isArray(cls.dateTimes) && cls.dateTimes.length > 0) {
        cls.dateTimes.forEach(dt => {
          const div = document.createElement("div");
          div.className = "date-time-group";
          div.innerHTML = `
            <input type="time" class="classTime" value="${dt.time}" required />
            <button type="button" class="removeDateTime">Remove</button>
          `;
          dateTimeContainer.appendChild(div);
          div.querySelector(".removeDateTime").addEventListener("click", () => div.remove());
        });
      } else {
        // Add one empty set if none
        dateTimeContainer.innerHTML = `<div class="date-time-group">
          <input type="date" class="classDate" required />
          <input type="time" class="classTime" required />
        </div>`;
      }

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
    showToast("Class deleted!");
    loadClasses();
  } catch (err) {
    console.error("Error deleting class:", err);
  }
}

cancelEditBtn.addEventListener("click", () => {
  classForm.reset();
  loadClasses();
  cancelEditBtn.style.display = "none";
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
      showToast("Error uploading some files. Check console.");
    }
  }

  showToast(`${files.length} image(s) uploaded!`);
  galleryForm.reset();
  galleryInput.value = "";
});



// -------------------- Gallery Live Render + Cover Options --------------------
onSnapshot(collection(db, "gallery"), snapshot => {
  galleryList.innerHTML = "";
  classCoverSelect.innerHTML = "";
  merchCoverOptions.innerHTML = "";

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    // --- Render Gallery Item ---
    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.style.border = "1px solid #ddd";
    div.style.padding = "10px";
    div.style.marginBottom = "10px";

    div.innerHTML = `
      <img src="${data.url}" alt="${data.group || "Gallery"}" width="150"/>
      <p><strong>Group:</strong> ${data.group || "N/A"}</p>
      ${data.cover ? `<p style="color:green;"><em>Cover Image</em></p>` : ""}
      <button data-id="${id}" class="toggle-home">
        ${data.showOnHome !== false ? "✅ Showing on Home" : "❌ Hidden from Home"}
      </button>
      <button data-id="${id}" class="delete-gallery">Delete</button>
    `;
    galleryList.appendChild(div);

    // --- Cover selection for classes ---
    const classImg = document.createElement("img");
    classImg.src = data.url;
    classImg.alt = data.group || "Gallery";
    classImg.style.width = "100px";
    classImg.style.margin = "5px";
    classImg.style.cursor = "pointer";
    classImg.style.border = "2px solid transparent";

    classImg.addEventListener("click", () => {
      document.querySelectorAll("#classCover img").forEach(i => i.style.border = "2px solid transparent");
      classImg.style.border = "2px solid blue";
      coverPreview.src = data.url;
      classCoverSelect.value = data.url;
    });
    classCoverSelect.appendChild(classImg);

    // --- Cover selection for merch ---
    const merchImg = document.createElement("img");
    merchImg.src = data.url;
    merchImg.alt = data.group || "Gallery";
    merchImg.style.width = "80px";
    merchImg.style.margin = "5px";
    merchImg.style.cursor = "pointer";
    merchImg.style.border = "2px solid transparent";

    merchImg.addEventListener("click", () => {
      document.querySelectorAll("#merchCoverOptions img").forEach(i => i.style.border = "2px solid transparent");
      merchImg.style.border = "2px solid blue";
      merchCoverPreview.src = data.url;
    });
    merchCoverOptions.appendChild(merchImg);

    
    // Initialize popup for all gallery images
  initImagePopup('img');

  });

  // --- Event Listeners ---
  // Delete gallery image
  document.querySelectorAll(".delete-gallery").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docId = btn.dataset.id;
      if (!confirm("Delete this image?")) return;

      try {
        await deleteDoc(doc(db, "gallery", docId));
        showToast("Image deleted!");
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    });
  });

  // Toggle show on home
  document.querySelectorAll(".toggle-home").forEach(btn => {
    btn.addEventListener("click", async () => {
      const docId = btn.dataset.id;
      const docRef = doc(db, "gallery", docId);

      try {
        const snap = await getDoc(docRef);
        if (!snap.exists()) return;

        const current = snap.data().showOnHome !== false; // default true
        await updateDoc(docRef, { showOnHome: !current });
        showToast(`Image is now ${!current ? "visible" : "hidden"} on home page.`);
      } catch (err) {
        console.error("Error updating showOnHome:", err);
      }
    });
  });
});





const saveTemplateBtn = document.getElementById("saveTemplate");
const templateSelect = document.getElementById("templateSelect");
const loadTemplateBtn = document.getElementById("loadTemplate");

// Save current form as template
saveTemplateBtn.addEventListener("click", async () => {
  const name = document.getElementById("className").value;
  if (!name) {
    showToast("Please enter a class name before saving as template.");
    return;
  }

  // Gather class data like you do for saving
  const dateTimes = [];
  document.querySelectorAll(".date-time-group").forEach(group => {
    const date = group.querySelector(".classDate")?.value || "";
    const time = group.querySelector(".classTime")?.value || "";
    if (date || time) dateTimes.push({ date, time });
  });

  const templateData = {
    name,
    description: document.getElementById("classDescription").value,
    recipe: document.getElementById("classRecipe").value,
    whatCooking: document.getElementById("whatCooking").value,
    singlesCost: parseFloat(document.getElementById("singlesCost").value) || 0,
    couplesCost: parseFloat(document.getElementById("couplesCost").value) || 0,
    classSize: parseInt(classSize.value) || 0,
    spotsAvailable: parseInt(spotsAvailable.value) || 0,
    vibe: classVibe.value,
    coverImage: classCoverSelect.value,
    eventbriteLink: document.getElementById("eventbriteLink").value,
    secondLink: document.getElementById("secondLink").value,
    dateTimes
  };

  try {
    await addDoc(collection(db, "classTemplates"), templateData);
    showToast("Template saved!");
    loadTemplates();
  } catch (err) {
    console.error("Error saving template:", err);
  }
});

async function loadTemplates() {
  templateSelect.innerHTML = `<option value="">-- Load Template --</option>`;
  const snapshot = await getDocs(collection(db, "classTemplates"));
  snapshot.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.data().name;
    templateSelect.appendChild(option);
  });
}

// Call on page load
loadTemplates();


loadTemplateBtn.addEventListener("click", async () => {
  const id = templateSelect.value;
  if (!id) return;

  const docSnap = await getDoc(doc(db, "classTemplates", id));
  if (!docSnap.exists()) return;

  const tpl = docSnap.data();

  document.getElementById("className").value = tpl.name || "";
  document.getElementById("classDescription").value = tpl.description || "";
  document.getElementById("classRecipe").value = tpl.recipe || "";
  document.getElementById("whatCooking").value = tpl.whatCooking || "";
  document.getElementById("singlesCost").value = tpl.singlesCost || 0;
  document.getElementById("couplesCost").value = tpl.couplesCost || 0;
  classSize.value = tpl.classSize || 0;
  spotsAvailable.value = tpl.spotsAvailable || 0;
  classVibe.value = tpl.vibe || "";
  classCoverSelect.value = tpl.coverImage || "";
  coverPreview.src = tpl.coverImage || "";
  document.getElementById("eventbriteLink").value = tpl.eventbriteLink || "";
  document.getElementById("secondLink").value = tpl.secondLink || "";

  // Date/times
  dateTimeContainer.innerHTML = "";
  if (Array.isArray(tpl.dateTimes)) {
    tpl.dateTimes.forEach(dt => {
      const div = document.createElement("div");
      div.className = "date-time-group";
      div.innerHTML = `
        <input type="date" class="classDate" value="${dt.date || ""}" />
        <input type="time" class="classTime" value="${dt.time || ""}" />
        <button type="button" class="removeDateTime">Remove</button>
      `;
      dateTimeContainer.appendChild(div);
      div.querySelector(".removeDateTime").addEventListener("click", () => div.remove());
    });
  }
});

const updateTemplateBtn = document.getElementById("updateTemplate");

// Update existing template
updateTemplateBtn.addEventListener("click", async () => {
  const id = templateSelect.value;
  if (!id) {
    showToast("Please select a template to update.");
    return;
  }

  // Gather current form values
  const dateTimes = [];
  document.querySelectorAll(".date-time-group").forEach(group => {
    const date = group.querySelector(".classDate")?.value || "";
    const time = group.querySelector(".classTime")?.value || "";
    if (date || time) dateTimes.push({ date, time });
  });

  const templateData = {
    name: document.getElementById("className").value,
    description: document.getElementById("classDescription").value,
    recipe: document.getElementById("classRecipe").value,
    whatCooking: document.getElementById("whatCooking").value,
    singlesCost: parseFloat(document.getElementById("singlesCost").value) || 0,
    couplesCost: parseFloat(document.getElementById("couplesCost").value) || 0,
    classSize: parseInt(classSize.value) || 0,
    spotsAvailable: parseInt(spotsAvailable.value) || 0,
    vibe: classVibe.value,
    coverImage: classCoverSelect.value,
    eventbriteLink: document.getElementById("eventbriteLink").value,
    secondLink: document.getElementById("secondLink").value,
    dateTimes
  };

  try {
    await setDoc(doc(db, "classTemplates", id), templateData, { merge: true });
    showToast("Template updated!");
    loadTemplates();
  } catch (err) {
    console.error("Error updating template:", err);
  }
});


const deleteTemplateBtn = document.getElementById("deleteTemplate");

// Delete selected template
deleteTemplateBtn.addEventListener("click", async () => {
  const id = templateSelect.value;
  if (!id) {
    showToast("Please select a template to delete.");
    return;
  }

  if (!confirm("Are you sure you want to delete this template?")) return;

  try {
    await deleteDoc(doc(db, "classTemplates", id));
    showToast("Template deleted!");
    loadTemplates(); // refresh dropdown
    templateSelect.value = "";

    // 🔹 Clear the form fields after delete
    document.getElementById("className").value = "";
    document.getElementById("classDescription").value = "";
    document.getElementById("classRecipe").value = "";
    document.getElementById("whatCooking").value = "";
    document.getElementById("singlesCost").value = "";
    document.getElementById("couplesCost").value = "";
    classSize.value = "";
    spotsAvailable.value = "";
    classVibe.value = "";
    classCoverSelect.value = "";
    coverPreview.src = "";
    document.getElementById("eventbriteLink").value = "";
    document.getElementById("secondLink").value = "";
    dateTimeContainer.innerHTML = "";
  } catch (err) {
    console.error("Error deleting template:", err);
  }
});

const merchForm = document.getElementById("merch-form");
const merchList = document.getElementById("admin-merch-list");
const merchCoverOptions = document.getElementById("merchCoverOptions");
const merchCoverPreview = document.getElementById("merchCoverPreview");
const cancelMerchEdit = document.getElementById("cancelMerchEdit");

// Load merch items
async function loadMerch() {
  merchList.innerHTML = "<p>Loading merchandise...</p>";
  try {
    const q = query(collection(db, "merch"), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      merchList.innerHTML = "<p>No merch added yet.</p>";
      return;
    }
    
    merchList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      const div = document.createElement("div");
      div.className = "merch-item";
      div.innerHTML = `
        <h4>${m.name}</h4>
        <img src="${m.coverImage || ''}" style="max-width:100px;">
        <p>${m.description}</p>
        <p><strong>Cost:</strong> $${m.cost?.toFixed(2) || 0}</p>
        <p><strong>Available:</strong> ${m.available}</p>
        <p><strong>Link:</strong> ${m.link ? `<a href="${m.link}" target="_blank">Buy</a>` : "<em>Coming Soon</em>"}</p>
        <p><strong>Visible:</strong> ${m.visible ? "Yes" : "No"}</p>
        <button data-id="${docSnap.id}" class="edit-merch">Edit</button>
        <button data-id="${docSnap.id}" class="delete-merch">Delete</button>
      `;
      merchList.appendChild(div);
    });

    // Edit / delete handlers
    document.querySelectorAll(".edit-merch").forEach(btn => {
      btn.addEventListener("click", () => editMerch(btn.dataset.id));
    });
    document.querySelectorAll(".delete-merch").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this merch item?")) return;
        await deleteDoc(doc(db, "merch", btn.dataset.id));
        loadMerch();
      });
    });
    
  } catch (err) {
    console.error(err);
    merchList.innerHTML = "<p>Error loading merch.</p>";
  }
}

// Save merch
merchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("merchId").value;
  const name = document.getElementById("merchName").value;
  const description = document.getElementById("merchDescription").value;
  const cost = parseFloat(document.getElementById("merchCost").value) || 0;
  const available = parseInt(document.getElementById("merchAvailable").value) || 0;
  const link = document.getElementById("merchLink").value || "";
  const visible = document.getElementById("merchVisible").checked;
  const coverImage = merchCoverPreview.src || "";

  const merchData = { name, description, cost, available, link, visible, coverImage };
  
  try {
    if (id) {
      await updateDoc(doc(db, "merch", id), merchData);
    } else {
      await addDoc(collection(db, "merch"), merchData);
    }
    merchForm.reset();
    merchCoverPreview.src = "";
    loadMerch();
  } catch (err) {
    console.error(err);
  }
});

// Edit merch
async function editMerch(id) {
  const docSnap = await getDoc(doc(db, "merch", id));
  if (!docSnap.exists()) return;
  const m = docSnap.data();
  document.getElementById("merchId").value = id;
  document.getElementById("merchName").value = m.name || "";
  document.getElementById("merchDescription").value = m.description || "";
  document.getElementById("merchCost").value = m.cost || 0;
  document.getElementById("merchAvailable").value = m.available || 0;
  document.getElementById("merchLink").value = m.link || "";
  document.getElementById("merchVisible").checked = m.visible || false;
  merchCoverPreview.src = m.coverImage || "";
}

// Cancel edit
cancelMerchEdit.addEventListener("click", () => {
  merchForm.reset();
  merchCoverPreview.src = "";
});


// budgetPlanner.js

export async function initBudgetPlanner(options = {}) {
  const budgetTableBody = document.querySelector("#budgetTable tbody");
  const addBudgetItemBtn = document.getElementById("addBudgetItemBtn");
  const budgetSearch = document.getElementById("budgetSearch");
  const budgetFilterClass = document.getElementById("budgetFilterClass");
  const notesPopup = document.getElementById("budgetNotesPopup");
  const budgetNotesText = document.getElementById("budgetNotesText");
  const saveBudgetNotesBtn = document.getElementById("saveBudgetNotesBtn");
  const closeBudgetNotesBtn = document.getElementById("closeBudgetNotesBtn");

  let currentNotesId = null;
  let budgetData = [];

  // Load classes into filter
  async function loadClassFilter() {
    budgetFilterClass.innerHTML = '<option value="">All Classes</option>';
    const snapshot = await getDocs(collection(db, "classes"));
    snapshot.forEach(docSnap => {
      const cls = docSnap.data();
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = cls.name;
      budgetFilterClass.appendChild(option);
    });
  }

  // Render table
  function renderTable() {
    const searchText = budgetSearch.value.toLowerCase();
    const filterClass = budgetFilterClass.value;
    budgetTableBody.innerHTML = "";

    let totalEst = 0, totalActual = 0, totalTicket = 0, totalVenue = 0, totalProfit = 0;

    budgetData.forEach(item => {
      if (searchText && !item.item.toLowerCase().includes(searchText)) return;
      if (filterClass && item.classId !== filterClass) return;

      const profit = (item.ticketCost || 0) - ((item.actualCost || 0) + (item.venueCost || 0));
      totalEst += item.estimatedCost || 0;
      totalActual += item.actualCost || 0;
      totalTicket += item.ticketCost || 0;
      totalVenue += item.venueCost || 0;
      totalProfit += profit;

      const tr = document.createElement("tr");
      tr.dataset.id = item.id;

      tr.innerHTML = `
        <td>${item.className || "N/A"}</td>
        <td><input type="checkbox" class="liveStatus" ${item.live ? "checked" : ""}></td>
        <td contenteditable class="itemName">${item.item || ""}</td>
        <td contenteditable class="estCost">${item.estimatedCost || 0}</td>
        <td contenteditable class="actualCost">${item.actualCost || 0}</td>
        <td contenteditable class="ticketCost">${item.ticketCost || 0}</td>
        <td contenteditable class="venueCost">${item.venueCost || 0}</td>
        <td>${profit.toFixed(2)}</td>
        <td class="linksCell">${(item.links || []).map(l=>`<a href="${l}" target="_blank">Link</a>`).join("<br>")} <button class="editLinks">Edit</button></td>
        <td class="picsCell">${(item.pictures || []).map(img=>`<img src="${img}" width="50"/>`).join("")} <button class="editPics">Add</button></td>
        <td>
          <select class="priority">
            <option ${item.priority==="High"?"selected":""}>High</option>
            <option ${item.priority==="Medium"?"selected":""}>Medium</option>
            <option ${item.priority==="Low"?"selected":""}>Low</option>
          </select>
        </td>
        <td><button class="editNotes">Edit</button></td>
        <td><button class="deleteItem">Delete</button></td>
      `;

      // Event listeners
      tr.querySelector(".liveStatus")?.addEventListener("change", async e => {
        await updateDoc(doc(db, "budgets", item.id), { live: e.target.checked });
        showToast("Live status updated");
      });

      ["itemName","estCost","actualCost","ticketCost","venueCost"].forEach(cls => {
        tr.querySelector(`.${cls}`)?.addEventListener("blur", async e => {
          let val = cls.includes("Cost") ? parseFloat(e.target.textContent) || 0 : e.target.textContent;
          await updateDoc(doc(db, "budgets", item.id), { [cls==="itemName"?"item":cls==="estCost"?"estimatedCost":cls==="actualCost"?"actualCost":cls==="ticketCost"?"ticketCost":"venueCost"]: val });
        });
      });

      tr.querySelector(".priority")?.addEventListener("change", async e => {
        await updateDoc(doc(db, "budgets", item.id), { priority: e.target.value });
      });

      tr.querySelector(".editNotes")?.addEventListener("click", () => {
        currentNotesId = item.id;
        budgetNotesText.value = item.notes || "";
        notesPopup.classList.remove("hidden");
      });

      tr.querySelector(".deleteItem")?.addEventListener("click", async () => {
        if (!confirm("Delete this item?")) return;
        await deleteDoc(doc(db, "budgets", item.id));
        showToast("Item deleted!");
      });

// Replace your previous editPics listener:
tr.querySelector(".editPics")?.addEventListener("click", () => openGalleryPicker(item.id));



      tr.querySelector(".editPics")?.addEventListener("click", () => {
        const url = prompt("Add image URL:");
        if (!url) return;
        item.pictures = item.pictures || [];
        item.pictures.push(url);
        updateDoc(doc(db, "budgets", item.id), { pictures: item.pictures });
        showToast("Picture added!");
      });

      budgetTableBody.appendChild(tr);
    });

    // Update totals
    document.getElementById("totalEstCost").textContent = totalEst.toFixed(2);
    document.getElementById("totalActualCost").textContent = totalActual.toFixed(2);
    document.getElementById("totalTicketCost").textContent = totalTicket.toFixed(2);
    document.getElementById("totalVenueCost").textContent = totalVenue.toFixed(2);
    document.getElementById("totalProfit").textContent = totalProfit.toFixed(2);
  }

  // Notes popup
  saveBudgetNotesBtn.addEventListener("click", async () => {
    if (!currentNotesId) return;
    await updateDoc(doc(db, "budgets", currentNotesId), { notes: budgetNotesText.value });
    showToast("Notes saved");
    notesPopup.classList.add("hidden");
  });
  closeBudgetNotesBtn.addEventListener("click", () => notesPopup.classList.add("hidden"));

  // Add new budget item
  addBudgetItemBtn.addEventListener("click", async () => {
    const newItem = {
      className: "",
      live: false,
      item: "",
      estimatedCost: 0,
      actualCost: 0,
      ticketCost: 0,
      venueCost: 0,
      links: [],
      pictures: [],
      priority: "Medium",
      notes: ""
    };
    const docRef = await addDoc(collection(db, "budgets"), newItem);
    newItem.id = docRef.id;
    budgetData.push(newItem);
    renderTable();
    showToast("Budget item added");
  });

  // Search & filter events
  budgetSearch.addEventListener("input", renderTable);
  budgetFilterClass.addEventListener("change", renderTable);

  // Sort columns
  document.querySelectorAll("#budgetTable th").forEach((th, idx) => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const keyMap = ["className","live","item","estimatedCost","actualCost","ticketCost","venueCost","profit","links","pictures","priority","notes"];
      const key = keyMap[idx];
      budgetData.sort((a,b) => {
        if(key==="profit") {
          const pa = (a.ticketCost||0) - ((a.actualCost||0)+(a.venueCost||0));
          const pb = (b.ticketCost||0) - ((b.actualCost||0)+(b.venueCost||0));
          return pa - pb;
        }
        return (a[key] || "").toString().localeCompare((b[key] || "").toString());
      });
      renderTable();
    });
  });

  // Export CSV
  function exportCSV() {
    let csv = "Class,Live,Item,EstCost,ActualCost,Ticket,Venue,Profit,Links,Pictures,Priority,Notes\n";
    budgetData.forEach(item => {
      const profit = (item.ticketCost||0) - ((item.actualCost||0)+(item.venueCost||0));
      csv += `"${item.className || ""}",${item.live}, "${item.item || ""}",${item.estimatedCost || 0},${item.actualCost || 0},${item.ticketCost || 0},${item.venueCost || 0},${profit}, "${(item.links||[]).join("|")}","${(item.pictures||[]).join("|")}", "${item.priority}", "${item.notes || ""}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export PDF (using jsPDF if loaded on page)
  function exportPDF() {
    if (typeof jsPDF === "undefined") {
      alert("jsPDF not loaded");
      return;
    }
    const doc = new jsPDF();
    let y = 10;
    budgetData.forEach(item => {
      const profit = (item.ticketCost||0) - ((item.actualCost||0)+(item.venueCost||0));
      doc.text(`Class: ${item.className || ""}`, 10, y); y+=6;
      doc.text(`Item: ${item.item || ""}`, 10, y); y+=6;
      doc.text(`EstCost: ${item.estimatedCost || 0} | Actual: ${item.actualCost || 0} | Ticket: ${item.ticketCost || 0} | Venue: ${item.venueCost || 0} | Profit: ${profit}`, 10, y); y+=8;
      doc.text(`Links: ${(item.links||[]).join(", ")}`, 10, y); y+=6;
      doc.text(`Notes: ${item.notes || ""}`, 10, y); y+=10;
      if(y>280){doc.addPage();y=10;}
    });
    doc.save("budget.pdf");
  }

  // Listen for export events
  document.getElementById("exportCSVBtn")?.addEventListener("click", exportCSV);
  document.getElementById("exportPDFBtn")?.addEventListener("click", exportPDF);

  // Firebase live listener
  onSnapshot(collection(db, "budgets"), snapshot => {
    budgetData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderTable();
  });

  await loadClassFilter();
}

// Assuming you have a Firebase collection "gallery" with images
async function openGalleryPicker(itemId) {
  // Fetch gallery images
  const snapshot = await getDocs(collection(db, "gallery"));
  const images = snapshot.docs.map(docSnap => ({ id: docSnap.id, url: docSnap.data().url }));

  // Create a simple picker popup
  const picker = document.createElement("div");
  picker.className = "galleryPickerPopup";
  picker.style.position = "fixed";
  picker.style.top = "50%";
  picker.style.left = "50%";
  picker.style.transform = "translate(-50%, -50%)";
  picker.style.background = "#fff";
  picker.style.padding = "20px";
  picker.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
  picker.style.zIndex = "9999";
  picker.style.maxHeight = "80vh";
  picker.style.overflowY = "auto";

  picker.innerHTML = `<h3>Select Images</h3><div class="pickerGrid" style="display:grid; grid-template-columns:repeat(auto-fill, 80px); gap:10px;"></div><button id="closePicker">Close</button>`;
  const grid = picker.querySelector(".pickerGrid");
  images.forEach(img => {
    const imgEl = document.createElement("img");
    imgEl.src = img.url;
    imgEl.style.width = "70px";
    imgEl.style.height = "70px";
    imgEl.style.cursor = "pointer";
    imgEl.addEventListener("click", async () => {
      // Add to budget item
      const budgetDoc = doc(db, "budgets", itemId);
      const itemSnap = budgetData.find(b => b.id === itemId);
      itemSnap.pictures = itemSnap.pictures || [];
      if (!itemSnap.pictures.includes(img.url)) itemSnap.pictures.push(img.url);
      await updateDoc(budgetDoc, { pictures: itemSnap.pictures });
      showToast("Image added!");
      picker.remove();
    });
    grid.appendChild(imgEl);
  });

  document.body.appendChild(picker);
  picker.querySelector("#closePicker").addEventListener("click", () => picker.remove());
}


initBudgetPlanner();


function setupAdminNav() {
  const navButtons = document.querySelectorAll("#adminNav button[data-target]");
  const showAllBtn = document.getElementById("showAllSections");

  navButtons.forEach(btn => {
    const targetSelector = btn.dataset.target;
    const targetEl = document.querySelector(targetSelector);
    if (!targetEl) return;

    btn.addEventListener("click", () => {
      // Hide all sections first
      document.querySelectorAll("section, form#class-form").forEach(sec => {
        sec.style.display = "none";
      });
      // Show only this section
      targetEl.style.display = "block";
    });
  });

  // Show all sections button
  showAllBtn.addEventListener("click", () => {
    document.querySelectorAll("section, form#class-form").forEach(sec => {
      sec.style.display = "block";
    });
  });

  // Optional: hide all sections on page load except first
  document.querySelectorAll("section, form#class-form").forEach((sec, i) => {
   // sec.style.display = i === 0 ? "block" : "none";
  });
}



// Call this after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupAdminNav();


});

 


  
// HTML container where admin table will be rendered
const adminContainer = document.getElementById("contactAdminSection");

if (!adminContainer) {
  console.warn("No admin container found. Add a div with id='contactAdminSection'");
}

// Function to render table
export function initContactAdmin() {
  // Create table
  const table = document.createElement("table");
  table.id = "contactAdminTable";
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Subject</th>
        <th>Message</th>
        <th>Guests</th>
        <th>Food Type</th>
        <th>Event Date</th>
        <th>Event Time</th>
        <th>Location</th>
        <th>Contact Method</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  adminContainer.appendChild(table);

  const tbody = table.querySelector("tbody");

  // Real-time listener for submissions
  onSnapshot(collection(db, "contactSubmissions"), snapshot => {
    tbody.innerHTML = ""; // clear table

    if (snapshot.empty) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="10" style="text-align:center">No submissions yet</td>`;
      tbody.appendChild(tr);
      return;
    }

    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #ccc";

      tr.innerHTML = `
        <td>${data.name || ""}</td>
        <td>${data.email || ""}</td>
        <td>${data.subject || ""}</td>
        <td>${data.message || ""}</td>
        <td>${data.guests || ""}</td>
        <td>${data.foodType || ""}</td>
        <td>${data.eventDate || ""}</td>
        <td>${data.eventTime || ""}</td>
        <td>${data.location || ""}</td>
        <td>${data.contactMethod || ""}</td>
      `;

      tbody.appendChild(tr);
    });
  }, err => {
    console.error("Error loading submissions:", err);
    showToast("Error loading submissions");
  });
}


initContactAdmin();

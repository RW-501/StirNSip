 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
    
 import { getFirestore, addDoc, collection, query, where, orderBy, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import { showToast } from 'https://rw-501.github.io/StirNSip/js/showToast.js';


    import { initImagePopup } from 'https://rw-501.github.io/StirNSip/js/imagePopup.js';

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

// DOM Elements
const heroImage = document.getElementById("heroImage");
const aboutText = document.getElementById("aboutText");

const classesList = document.getElementById("classesList");
const galleryList = document.getElementById("galleryList");

const faqListEl = document.getElementById("faqList");
const faqSearch = document.getElementById("faqSearch");

async function loadSiteSettings() {
  try {
    const settingsDoc = doc(db, "siteSettings", "main");
    const docSnap = await getDoc(settingsDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Hero / About / Contact
      heroImage.src = data.heroImage || "";
      aboutText.innerHTML  = data.about || "";

      // Main merch image
      const mainMerchContainer = document.getElementById("mainMerchContainer");
      const mainMerchImage = document.getElementById("mainMerchImage");

      if (data.mainMerchImage && data.showMerchOnHome) {
        mainMerchImage.src = data.mainMerchImage;
        mainMerchContainer.style.display = "block";
      } else {
        mainMerchContainer.style.display = "none";
      }

      // Load FAQ
      renderFAQ(data.faq || []);
    }
  } catch (err) {
    console.error("Error loading site settings:", err);
  }
}



// -------------------- Gallery Live Render --------------------
onSnapshot(collection(db, "gallery"), snapshot => {
  galleryList.innerHTML = "";

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    // Only show if showOnHome is true OR not defined
    if (!data.showOnHome || data.showOnHome === false) return;

    const div = document.createElement("div");
    div.classList.add("gallery-item");
    div.style.border = "1px solid #ddd";
    // div.style.padding = "5px";

    div.innerHTML = `
      <img src="${data.url}" alt="${data.group || "Gallery"}" width="150"/>
    `;

    galleryList.appendChild(div);
  });

  
  // Initialize popup for all gallery images
  initImagePopup('img');
});


function renderFAQ(faqArray) {
  faqListEl.innerHTML = "";

  faqArray.forEach(({ question, answer }) => {
    const item = document.createElement("div");
    item.className = "faq-item";

    const btn = document.createElement("button");
    btn.className = "faq-toggle";
    btn.textContent = question;

    const ans = document.createElement("p");
    ans.className = "faq-answer";
    ans.textContent = answer;
    ans.style.display = "none";

    btn.addEventListener("click", () => {
      ans.style.display = ans.style.display === "none" ? "block" : "none";
    });

    item.appendChild(btn);
    item.appendChild(ans);
    faqListEl.appendChild(item);
  });
}

// Search filter
faqSearch.addEventListener("input", () => {
  const term = faqSearch.value.toLowerCase();
  const items = faqListEl.querySelectorAll(".faq-item");

  items.forEach(item => {
    const q = item.querySelector(".faq-toggle").textContent.toLowerCase();
    const a = item.querySelector(".faq-answer").textContent.toLowerCase();
    item.style.display = q.includes(term) || a.includes(term) ? "block" : "none";
  });
});


// Render grouped classes
function renderClasses(docs) {
  classesList.innerHTML = "";

  if (docs.length === 0) {
    classesList.innerHTML = `<p>No upcoming classes yet — check back soon!</p>`;
    return;
  }

  // Group by class name
  const grouped = {};
  docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (!grouped[data.name]) {
      grouped[data.name] = {
        description: data.description,
        id: docSnap.id, // keep first ID for details page
        times: []
      };
    }
    grouped[data.name].times.push({
      date: data.date,
      time: data.time
    });
  });

  // Render grouped cards
  Object.entries(grouped).forEach(([name, info]) => {
    const div = document.createElement("div");
    div.classList.add("class-card");

    // Make badges for each time
    const timesHtml = info.times
      .map(
        t => `<span class="time-badge">${t.date} @ ${t.time}</span>`
      )
      .join(" ");

    div.innerHTML = `
      <h3>${name}</h3>
      <div class="time-badges">${timesHtml}</div>
      <p>${info.description}</p>
      <a href="class.html?id=${info.id}" class="cta-btn">View Details</a>
    `;
    classesList.appendChild(div);
  });
}


// Load visible classes
const classesQuery = query(
  collection(db, "classes"),
  where("visible", "==", true),
  orderBy("dateTimes.0.date", "asc") // Use first date in array if you changed to multiple dates
);

// Listen for changes
onSnapshot(classesQuery, snapshot => renderClasses(snapshot.docs));





const merchListHome = document.getElementById("merchList");

onSnapshot(query(collection(db, "merch"), where("visible", "==", true)), snapshot => {
  merchListHome.innerHTML = "";
  snapshot.docs.forEach(docSnap => {
    const m = docSnap.data();
    const isAvailable = m.available > 0 && m.link;
    
    const div = document.createElement("div");
    div.className = "merch-card";
    div.innerHTML = `
      <img src="${m.coverImage || ''}" alt="${m.name}" style="max-width:150px;">
      <h4>${m.name}</h4>
      <p>${m.description}</p>
      <p><strong>Cost:</strong> $${m.cost?.toFixed(2) || 0}</p>
      <p><strong>Stock:</strong> ${m.available || 0}</p>
      <a href="${isAvailable ? m.link : '#'}" target="_blank" class="cta-btn" style="pointer-events:${isAvailable ? "auto" : "none"}; opacity:${isAvailable ? 1 : 0.5}">
        ${isAvailable ? "Buy Now" : "Coming Soon"}
      </a>
    `;
    merchListHome.appendChild(div);
  });
});


    // Initial site settings load
    loadSiteSettings();

    // Update year
    document.getElementById("year").textContent = new Date().getFullYear();
 




const contactForm = document.getElementById("contact-form");
const subjectSelect = document.getElementById("subject");
const eventFields = document.getElementById("eventFields");

// Function to create input fields
function createEventFields() {
  eventFields.innerHTML = `
    <input type="number" name="guests" placeholder="Number of Guests" min="1" required>
    <input type="text" name="foodType" placeholder="Type of Food / Cuisine" required>
    <input type="date" name="eventDate" required>
    <input type="time" name="eventTime" required>
    <input type="text" name="location" placeholder="Event Location" required>
    <input type="text" name="contactMethod" placeholder="Preferred Contact Method (Phone/Email)" required>
  `;
}

// Show/hide dynamic fields based on subject
subjectSelect.addEventListener("change", (e) => {
  if (e.target.value === "event") {
    eventFields.style.display = "block";
    createEventFields();
  } else {
    eventFields.style.display = "none";
    eventFields.innerHTML = "";
  }
});

// Form submission
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData.entries());

  try {
    await addDoc(collection(db, "contactSubmissions"), data);
    showToast("Thank you! We received your submission.");
  } catch (err) {
    console.error("Error saving contact submission:", err);
    showToast("Oops! Something went wrong, please try again.");
  }

  contactForm.reset();
  eventFields.style.display = "none";
  eventFields.innerHTML = "";
});

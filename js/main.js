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

const grouped = {};

// Group classes by name
docs.forEach(docSnap => {
  const data = docSnap.data();
  if (!grouped[data.name]) {
    grouped[data.name] = {
      id: docSnap.id,
      coverImage: data.coverImage || "",
      whatCooking: data.whatCooking || "",
      vibe: data.vibe || "",
      singlesCost: data.singlesCost || 0,
      couplesCost: data.couplesCost || 0,
      dateTimes: [] // array of { date, time }
    };
  }

  (data.dateTimes).forEach(dt => {
    grouped[data.name].dateTimes.push(dt);
  });
});

// Function to map vibe to color
function vibeColor(vibe) {
  const map = {
    "Hip Hop": "#FF6347", // reddish
    "Jazz": "#6A5ACD",    // purple
    "Classical": "#FFD700", // gold
    "Casual": "#20B2AA", // teal
    "Relaxed": "#FF69B4" // pink
  };
  return map[vibe] || "#333"; // default dark
}

// Render grouped class cards
classesList.innerHTML = ""; // clear container

Object.entries(grouped).forEach(([name, info]) => {
  const div = document.createElement("div");
  div.classList.add("class-card");
  div.style.borderRadius = "12px";
  div.style.overflow = "hidden";
  div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
  div.style.marginBottom = "20px";
  div.style.background = "#fff";
  div.style.transition = "transform 0.2s";
  div.onmouseover = () => div.style.transform = "scale(1.02)";
  div.onmouseout = () => div.style.transform = "scale(1)";
  div.style.display = "flex";
  div.style.flexDirection = "column";

function formatTime24to12(time24) {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // convert 0 => 12, 13 => 1, etc.
  return `${hour}:${minute} ${ampm}`;
}

const timesHtml = info.dateTimes
  .map(dt => {
    const formattedDate = new Date(dt.date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
    return dt.times.map(t => `
      <span class="time-badge" style="
        background: ${vibeColor(info.vibe)}22;
        color: ${vibeColor(info.vibe)};
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.85em;
        font-weight: 500;
        margin: 2px;
        display: inline-block;
      ">${formattedDate} @ ${formatTime24to12(t)}</span>
    `).join("");
  })
  .join("");

  div.innerHTML = `
    <div class="card-image" style="
      height:180px; 
      background:url('${info.coverImage}') center/cover no-repeat;
      border-bottom:4px solid ${vibeColor(info.vibe)};
    "></div>
    <div class="card-content" style="padding:15px; flex:1; display:flex; flex-direction:column; justify-content:space-between;">
      <div>
        <h3 style="margin:0 0 5px 0;">${name}</h3>
        <p style="margin:0 0 5px 0; font-weight:bold;">Cooking: ${info.whatCooking}</p>
        <p style="margin:0 0 10px 0;">Vibe: <span style="font-style:italic;">${info.vibe}</span></p>
        <p style="margin:0 0 10px 0;">Cost: $${info.singlesCost} (single) | $${info.couplesCost} (couple)</p>
        <div class="time-badges" style="display:flex; flex-wrap:wrap;">${timesHtml}</div>
      </div>
      <a href="class/index.html?id=${info.id}" class="cta-btn" style="
        display:inline-block; 
        padding:10px 20px; 
        background:${vibeColor(info.vibe)}; 
        color:#fff; 
        text-decoration:none; 
        border-radius:6px;
        font-weight:bold;
        text-align:center;
        margin-top:10px;
      ">View Details</a>
    </div>
  `;

  classesList.appendChild(div);
});

// Responsive adjustments via JS (optional if no CSS media queries)
document.querySelectorAll(".class-card").forEach(card => {
  card.style.width = "100%";
  card.style.maxWidth = "400px";
  card.style.margin = "10px auto";
});


}


// Load visible classes
const classesQuery = query(
  collection(db, "classes"),
  where("visible", "==", true),
  orderBy("firstDate", "asc")
);

onSnapshot(classesQuery, snapshot => renderClasses(snapshot.docs));




const merchListHome = document.getElementById("merchList");

onSnapshot(
  query(collection(db, "merch"), where("visible", "==", true)),
  snapshot => {
    merchListHome.innerHTML = "";
    snapshot.docs.forEach(docSnap => {
      const m = docSnap.data();
      const isAvailable = m.available > 0 && m.link;

      // Pick main image (first one in array if available)
      const mainImage = (m.images && m.images[0]) || "";

      const div = document.createElement("div");
      div.className = "merch-card";
      div.innerHTML = `
        <div class="merch-main-img">
          <img src="${mainImage}" alt="${m.name}" class="main-img">
        </div>
        <div class="merch-thumbs">
          ${(m.images || [])
            .map(
              (url, i) =>
                `<img src="${url}" class="thumb ${i === 0 ? "active" : ""}">`
            )
            .join("")}
        </div>
        <h4>${m.name}</h4>
        <p>${m.description}</p>
        <p><strong>Cost:</strong> $${m.cost?.toFixed(2) || 0}</p>
        <p><strong>Stock:</strong> ${m.available || 0}</p>
        <a href="${isAvailable ? m.link : '#'}" target="_blank" 
           class="cta-btn" 
           style="pointer-events:${isAvailable ? "auto" : "none"}; opacity:${isAvailable ? 1 : 0.5}">
          ${isAvailable ? "Buy Now" : "Coming Soon"}
        </a>
      `;

      // Add functionality: clicking thumbnails changes main image
      setTimeout(() => {
        const mainImgEl = div.querySelector(".main-img");
        div.querySelectorAll(".thumb").forEach(thumb => {
          thumb.addEventListener("click", () => {
            // update main image
            mainImgEl.src = thumb.src;
            // update active class
            div.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
          });
        });
      }, 0);

      merchListHome.appendChild(div);
    });
  }
);



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


  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("show");
  });
 import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
    import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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
    const classesList = document.getElementById("classes-list");
    const heroImage = document.getElementById("heroImage");
    const aboutText = document.getElementById("aboutText");
    const classCostEl = document.getElementById("classCost");
    const classSizeEl = document.getElementById("classSize");
    const spotsAvailableEl = document.getElementById("spotsAvailable");
    const classVibeEl = document.getElementById("classVibe");
    const faqTextEl = document.getElementById("faqText");
    const contactInfoEl = document.getElementById("contactInfo");

    // Load site-wide settings
    async function loadSiteSettings() {
      try {
        const settingsDoc = doc(db, "siteSettings", "main");
        const docSnap = await getDoc(settingsDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          heroImage.src = data.heroImage || "";
          aboutText.textContent = data.about || "";
          classCostEl.textContent = data.classCost || "0";
          classSizeEl.textContent = data.classSize || "0";
          spotsAvailableEl.textContent = data.spotsAvailable || "0";
          classVibeEl.textContent = data.vibe || "";
          faqTextEl.textContent = data.faq || "";
          contactInfoEl.textContent = data.contact || "";
        }
      } catch(err) {
        console.error("Error loading site settings:", err);
      }
    }

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

    // Load visible classes
    const classesQuery = query(
      collection(db, "classes"),
      where("visible", "==", true),
      orderBy("date", "asc")
    );

    onSnapshot(classesQuery, snapshot => renderClasses(snapshot.docs));

    // Initial site settings load
    loadSiteSettings();

    // Update year
    document.getElementById("year").textContent = new Date().getFullYear();
 
// DOM Elements
const heroImageInput = document.getElementById("heroImage");
const heroPreview = document.getElementById("heroPreview");
const aboutText = document.getElementById("aboutText");
const classCost = document.getElementById("classCost");
const classSize = document.getElementById("classSize");
const spotsAvailable = document.getElementById("spotsAvailable");
const classVibe = document.getElementById("classVibe");
const faqText = document.getElementById("faqText");
const contactInfo = document.getElementById("contactInfo");
const saveSettingsBtn = document.getElementById("saveSettings");

// Load settings from Firestore
async function loadSettings() {
  const settingsDoc = doc(db, "siteSettings", "main");
  const snapshot = await getDocs(collection(db, "siteSettings"));
  const dataSnap = await getDocs(collection(db, "siteSettings"));
  try {
    const docSnap = await getDoc(settingsDoc);
    if (docSnap.exists()) {
      const data = docSnap.data();
      heroPreview.src = data.heroImage || "";
      aboutText.value = data.about || "";
      classCost.value = data.classCost || "";
      classSize.value = data.classSize || "";
      spotsAvailable.value = data.spotsAvailable || "";
      classVibe.value = data.vibe || "";
      faqText.value = data.faq || "";
      contactInfo.value = data.contact || "";
    }
  } catch(err) {
    console.error("Error loading settings:", err);
  }
}

// Upload hero image
async function uploadHeroImage(file) {
  const fileName = `hero_${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `settings/${fileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Save settings
saveSettingsBtn.addEventListener("click", async () => {
  let heroUrl = heroPreview.src;

  if (heroImageInput.files[0]) {
    heroUrl = await uploadHeroImage(heroImageInput.files[0]);
    heroPreview.src = heroUrl;
  }

  const settingsData = {
    heroImage: heroUrl,
    about: aboutText.value,
    classCost: parseFloat(classCost.value) || 0,
    classSize: parseInt(classSize.value) || 0,
    spotsAvailable: parseInt(spotsAvailable.value) || 0,
    vibe: classVibe.value,
    faq: faqText.value,
    contact: contactInfo.value,
    updatedAt: new Date()
  };

  try {
    const settingsDoc = doc(db, "siteSettings", "main");
    await updateDoc(settingsDoc, settingsData).catch(async () => {
      // If document doesn't exist, create it
      await setDoc(settingsDoc, settingsData);
    });
    alert("Settings saved!");
  } catch(err) {
    console.error("Error saving settings:", err);
  }
});

// Initial load
loadSettings();

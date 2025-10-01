// imagePopup.js
export function initImagePopup(imageSelector) {
  // Inject popup HTML if it doesn't exist
  if (!document.getElementById("imagePopup")) {
    const popupHTML = `
      <div id="imagePopup" class="image-popup hidden">
        <div class="popup-backdrop"></div>
        <div class="popup-content">
          <button id="closeImagePopup" class="close-btn">&times;</button>
          <img id="popupImage" src="" alt="Full view">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", popupHTML);

    // Inject basic CSS
    const style = document.createElement("style");
    style.textContent = `
      .image-popup.hidden { display: none; }
      .image-popup {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .popup-backdrop {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.7);
        backdrop-filter: blur(2px);
      }
      .popup-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .popup-content img {
        max-width: 100%;
        max-height: 100%;
        border-radius: 8px;
      }
      .close-btn {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #fff;
        border: none;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        font-size: 24px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  const popup = document.getElementById("imagePopup");
  const popupImg = document.getElementById("popupImage");
  const closeBtn = document.getElementById("closeImagePopup");
  const backdrop = popup.querySelector(".popup-backdrop");

  function openPopup(src) {
    popupImg.src = src;
    popup.classList.remove("hidden");
  }

  function closePopup() {
    popup.classList.add("hidden");
    popupImg.src = "";
  }

  // Attach click to images
  document.querySelectorAll(imageSelector).forEach(img => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => openPopup(img.src));
  });

  // Close events
  closeBtn.addEventListener("click", closePopup);
  backdrop.addEventListener("click", closePopup);
}

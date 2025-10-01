// toast.js

// Inject styles once
const style = document.createElement("style");
style.innerHTML = `
  .toast-container {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  .toast {
    min-width: 250px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 15px;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s, transform 0.4s;
  }
  .toast.show {
    opacity: 1;
    transform: translateY(0);
  }
  .toast.success { background-color: #28a745; }   /* Green */
  .toast.error   { background-color: #dc3545; }   /* Red */
  .toast.info    { background-color: #17a2b8; }   /* Blue */
  .toast.warning { background-color: #ffc107; color: #000; } /* Yellow */
`;
document.head.appendChild(style);

// Create container if missing
let container = document.getElementById("toast-container");
if (!container) {
  container = document.createElement("div");
  container.id = "toast-container";
  container.className = "toast-container";
  document.body.appendChild(container);
}

/**
 * Show a toast message
 * @param {string} message - The text to show
 * @param {"success"|"error"|"info"|"warning"} [type="info"] - Toast type
 * @param {number} [duration=3000] - Duration in ms
 */
export function showToast(message, type = "info", duration = 3000) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add("show"));

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

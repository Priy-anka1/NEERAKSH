export function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    modal.style.display = "flex";
  }
}

export function closeModal(modalId) {
  hideModal(modalId);
}

export function hideModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("active");
    setTimeout(() => {
      if (!el.classList.contains("active")) el.style.display = "none";
    }, 300); // match transition
  }
}

/* Menu */
export function toggleMenu(id) {
  document.getElementById(id)?.classList.toggle("hidden");
}

// Expose to window for inline HTML onclick handlers
window.closeLoginForm = () => hideModal("loginModal");
window.closeUploadForm = () => hideModal("uploadModal");
window.closeDetailsForm = () => hideModal("detailsModal");
window.closeConfirmForm = () => hideModal("confirmModal");

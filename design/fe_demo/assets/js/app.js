/* ==========================================================================
   TripMate AI — Global Application Controller (design/fe_demo)
   Handles Toasts, Modals, Scope Switching, and Page Lifecycles
   ========================================================================== */

const AppModule = (() => {
  let toastTimer = null;

  function init() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function showToast(message, type = "normal") {
    let toast = document.getElementById("global-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "global-toast";
      toast.className = "toast-banner";
      document.body.appendChild(toast);
    }

    if (toastTimer) clearTimeout(toastTimer);

    let borderLeftColor = "var(--color-sky-action)";
    let iconName = "info";

    if (type === "green") {
      borderLeftColor = "var(--color-quorum-green)";
      iconName = "check-circle";
    } else if (type === "amber") {
      borderLeftColor = "var(--color-amber-alert)";
      iconName = "cloud-rain";
    } else if (type === "red") {
      borderLeftColor = "var(--color-reject-rose)";
      iconName = "alert-triangle";
    }

    toast.style.borderLeftColor = borderLeftColor;
    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:18px;height:18px;color:${borderLeftColor};"></i>
      <span style="font-size:13px;font-weight:500;color:var(--color-ink-black);">${message}</span>
    `;

    toast.classList.add("show");
    if (window.lucide) window.lucide.createIcons();

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3800);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("open");
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("open");
    }
  }

  function toggleScope(selectedScope) {
    document.querySelectorAll(".scope-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const target = document.getElementById(`scope-${selectedScope}`);
    if (target) target.classList.add("active");

    showToast(`Đã chuyển sang chế độ: ${selectedScope === 'day' ? 'Đi chơi trong ngày (Day Hangout)' : 'Kỳ nghỉ nhiều ngày (Vacation)'}`);
  }

  return {
    init,
    showToast,
    openModal,
    closeModal,
    toggleScope
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  AppModule.init();
});

/* ==========================================================================
   TripMate AI — Smart Packing Checklist Module (design/fe_demo)
   Feature: TASK-317 Packing Checklist UI
   ========================================================================== */

const ChecklistModule = (() => {
  let items = [...MOCK_CHECKLIST];

  function init() {
    renderChecklist();
    setupAddForm();
  }

  function renderChecklist() {
    const container = document.getElementById("checklist-items-container");
    const countEl = document.getElementById("checklist-progress-count");
    const barEl = document.getElementById("checklist-progress-bar");

    if (!container) return;

    const completed = items.filter(i => i.checked).length;
    const total = items.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (countEl) countEl.innerText = `${completed}/${total} đồ dùng (${percent}%)`;
    if (barEl) barEl.style.width = `${percent}%`;

    let html = "";
    items.forEach(item => {
      html += `
        <div class="checklist-row" style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#ffffff;border:1px solid var(--color-ash-border);border-radius:var(--radius-control);margin-bottom:8px;">
          <label style="display:flex;align-items:center;gap:12px;cursor:pointer;flex:1;">
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="ChecklistModule.toggleItem('${item.id}')" style="width:18px;height:18px;accent-color:var(--color-quorum-green);cursor:pointer;" />
            <span style="font-size:14px;font-weight:500;${item.checked ? 'text-decoration:line-through;color:var(--color-steel-muted);' : 'color:var(--color-ink-black);'}">
              ${item.label}
            </span>
          </label>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge badge-neutral">${item.category}</span>
            <span class="badge badge-transit">${item.assigned_to}</span>
            <button onclick="ChecklistModule.deleteItem('${item.id}')" style="color:var(--color-steel-muted);padding:4px;" title="Xóa">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  }

  function toggleItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      renderChecklist();
    }
  }

  function deleteItem(id) {
    items = items.filter(i => i.id !== id);
    renderChecklist();
    if (window.AppModule) AppModule.showToast("Đã xóa đồ dùng khỏi danh sách!");
  }

  function setupAddForm() {
    const form = document.getElementById("checklist-add-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("checklist-new-label");
      const categorySelect = document.getElementById("checklist-new-cat");
      if (!input || !input.value.trim()) return;

      items.push({
        id: `c_${Date.now()}`,
        category: categorySelect ? categorySelect.value : "Cá Nhân",
        label: input.value.trim(),
        checked: false,
        assigned_to: "Bạn"
      });

      input.value = "";
      renderChecklist();
      if (window.AppModule) AppModule.showToast("Đã thêm đồ dùng mới vào checklist!");
    });
  }

  return {
    init,
    toggleItem,
    deleteItem
  };
})();

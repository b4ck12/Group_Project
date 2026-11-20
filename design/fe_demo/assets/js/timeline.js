/* ==========================================================================
   TripMate AI — Editorial Living Timeline & Itinerary Engine (design/fe_demo)
   Bespoke Editorial Travel Journal System (Kinfolk & Airbnb Luxe)
   Handles Visual Rhythm (Hero vs Compact), Heart Reactions, Swap, and Lock
   ========================================================================== */

const TimelineModule = (() => {
  let currentDay = 1;
  const dayStopsMap = {
    1: [...MOCK_STOPS_DAY_1],
    2: [...MOCK_STOPS_DAY_2],
    3: [...MOCK_STOPS_DAY_3]
  };

  let consensusState = MOCK_EVENT.status; // "CURATED_MICRO" | "FINAL_LOCKED"

  function init() {
    renderDayTabs();
    renderTimeline();
    updateAgreementUI();
  }

  function getCurrentStops() {
    return dayStopsMap[currentDay] || dayStopsMap[1];
  }

  function switchDay(dayNum) {
    if (dayNum === currentDay) return;
    currentDay = dayNum;

    renderDayTabs();
    renderTimeline();

    // Synchronize Leaflet Map
    if (window.MapModule) {
      MapModule.updateMarkers(getCurrentStops());
    }

    // Update map header overlay title
    const mapTitleEl = document.querySelector(".map-meta-title span");
    if (mapTitleEl) {
      const area = currentDay === 1 ? "Phố Cổ Hội An & An Bàng" : currentDay === 2 ? "Bán Đảo Sơn Trà & Biển Mỹ Khê" : "Cầu Rồng & Trung Tâm Đà Nẵng";
      mapTitleEl.innerText = `Bản Đồ Tuyến Điểm — Ngày ${currentDay} (${area})`;
    }

    AppModule.showToast(`Đã chuyển sang xem lịch trình Ngày ${currentDay}`);
  }

  function renderDayTabs() {
    const tabsContainer = document.getElementById("day-tabs-container");
    if (!tabsContainer) return;

    const days = [
      { num: 1, label: "Ngày 1: Phố Cổ & Biển An Bàng", count: dayStopsMap[1].length },
      { num: 2, label: "Ngày 2: Sơn Trà & Mỹ Khê", count: dayStopsMap[2].length },
      { num: 3, label: "Ngày 3: Cầu Rồng & Chợ Hàn", count: dayStopsMap[3].length }
    ];

    tabsContainer.innerHTML = days.map(d => `
      <button class="day-tab ${d.num === currentDay ? 'active' : ''}" onclick="TimelineModule.switchDay(${d.num})">
        <i data-lucide="calendar" style="width:13px;height:13px;"></i>
        <span>${d.label}</span>
        <span class="tag-editorial ${d.num === currentDay ? 'tag-ochre' : ''}" style="font-size:10px;padding:1px 6px;">${d.count} điểm</span>
      </button>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  function renderTimeline() {
    const container = document.getElementById("timeline-stops-container");
    if (!container) return;

    const stops = getCurrentStops();
    let html = "";
    let currentSlot = "";

    stops.forEach((stop, index) => {
      // Time Slot Header
      if (stop.time_slot !== currentSlot) {
        currentSlot = stop.time_slot;
        const slotName = currentSlot === "MORNING" ? "Buổi Sáng · 08:00 - 12:00" :
                         currentSlot === "AFTERNOON" ? "Buổi Chiều · 14:00 - 17:30" : "Buổi Tối · 18:30 - 21:30";
        const iconName = currentSlot === "MORNING" ? "sun" : currentSlot === "AFTERNOON" ? "cloud-sun" : "moon";
        
        html += `
          <div class="time-slot-label">
            <i data-lucide="${iconName}" style="width:14px;height:14px;"></i>
            <span>${slotName}</span>
          </div>
        `;
      }

      // Visual Rhythm: Hero Stop Card vs Compact Stop Card
      const cardTypeClass = stop.is_hero ? "stop-card-hero" : "stop-card-compact";
      const hasBackup = stop.backup_options && stop.backup_options.length > 0;
      const isReplaced = stop.status === "REPLACED";

      // Voter avatars preview
      const votersHtml = (stop.voters || []).map(avatar => `
        <img src="${avatar}" class="voter-mini-avatar" alt="Thành viên đã thích" />
      `).join("");

      html += `
        <div class="stop-card ${cardTypeClass} ${isReplaced ? 'replaced' : ''}" id="card-${stop.id}">
          <div class="stop-card-media">
            <img src="${stop.image}" alt="${stop.place_name}" class="stop-card-image" loading="lazy" />
            <div class="stop-card-badges">
              <span class="tag-editorial tag-pine">
                <i data-lucide="compass" style="width:11px;height:11px;"></i>
                ${stop.verified_provider}
              </span>
              <span class="tag-editorial tag-ochre">${stop.category}</span>
            </div>
          </div>
          
          <div class="stop-card-body">
            <div class="stop-header-row">
              <div>
                <span class="badge badge-transit" style="margin-bottom: 4px; font-weight:700;">#${index + 1} · ${stop.time_display}</span>
                <h3 class="stop-name">${stop.place_name}</h3>
              </div>
              <div class="stop-cost">${stop.cost_estimated}</div>
            </div>

            <div class="stop-address">
              <i data-lucide="map-pin" style="width:13px;height:13px;color:var(--color-terracotta);"></i>
              <span>${stop.address}</span>
            </div>

            ${stop.description ? `<p class="stop-desc">${stop.description}</p>` : ''}

            ${stop.sticky_note ? `
              <div class="friend-sticky-note">
                <i data-lucide="pin" style="width:13px;height:13px;color:var(--color-ochre-gold);flex-shrink:0;"></i>
                <span>${stop.sticky_note}</span>
              </div>
            ` : ''}

            ${hasBackup ? `
              <div class="backup-preview-box">
                <div class="backup-text">
                  <i data-lucide="refresh-cw" style="width:12px;height:12px;color:var(--color-ochre-gold);"></i>
                  <span><strong>Gợi ý dự phòng:</strong> ${stop.backup_options[0].place_name} (cách ${stop.backup_options[0].distance_meters}m)</span>
                </div>
                <button class="btn btn-sm btn-swap" onclick="TimelineModule.swapStop('${stop.id}')" ${consensusState === 'FINAL_LOCKED' ? 'disabled' : ''}>
                  Swap
                </button>
              </div>
            ` : ''}
          </div>

          <div class="stop-card-footer">
            <div class="voter-heart-group">
              <button class="btn-heart ${stop.is_hearted ? 'active' : ''}" onclick="TimelineModule.toggleHeart('${stop.id}')" ${consensusState === 'FINAL_LOCKED' ? 'disabled' : ''} title="Thả tim điểm dừng này">
                <i data-lucide="heart" style="width:14px;height:14px;"></i>
                <span>${stop.hearts_count}</span>
              </button>
              <div class="voter-mini-stack" title="Các bạn đã thả tim">
                ${votersHtml}
              </div>
            </div>

            ${hasBackup ? `
              <button class="btn btn-sm btn-swap" onclick="TimelineModule.swapStop('${stop.id}')" ${consensusState === 'FINAL_LOCKED' ? 'disabled' : ''} title="Đổi ngay sang phương án dự phòng">
                <i data-lucide="refresh-cw" style="width:12px;height:12px;"></i>
                <span>Swap</span>
              </button>
            ` : `
              <span class="tag-editorial tag-pine" style="font-size:11px;">
                <i data-lucide="check" style="width:12px;height:12px;"></i>
                Đã Duyệt
              </span>
            `}
          </div>
        </div>
      `;

      // Poetic Transit Connector between Cards
      if (stop.transit_to_next) {
        const transit = stop.transit_to_next;
        const iconName = transit.mode === "WALKING" ? "footprints" : "car";
        const modeLabel = transit.mode === "WALKING" ? "Dạo bộ" : "Grab / Taxi";

        html += `
          <div class="transit-connector">
            <div class="transit-line-segment"></div>
            <div class="transit-badge" title="${transit.instructions}">
              <span class="transit-icon"><i data-lucide="${iconName}" style="width:12px;height:12px;"></i></span>
              <span><strong>${modeLabel} ${transit.duration_mins} phút</strong> (${transit.distance_km} km)</span>
              <span style="color:#cbd5e1;">·</span>
              <span style="color:var(--color-steel-muted);">${transit.instructions}</span>
            </div>
            <div class="transit-line-segment"></div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();

    // Attach Stop Card hover to trigger Leaflet Map Pin highlight
    stops.forEach((stop, index) => {
      const cardEl = document.getElementById(`card-${stop.id}`);
      if (cardEl) {
        cardEl.addEventListener("mouseenter", () => {
          if (window.MapModule) MapModule.highlightMarker(index);
        });
      }
    });
  }

  function toggleHeart(stopId) {
    if (consensusState === "FINAL_LOCKED") return;

    const stops = getCurrentStops();
    const stop = stops.find(s => s.id === stopId);
    if (!stop) return;

    stop.is_hearted = !stop.is_hearted;
    if (stop.is_hearted) {
      stop.hearts_count++;
      AppModule.showToast(`Bạn đã thả tim ❤️ cho ${stop.place_name}!`);
    } else {
      stop.hearts_count--;
      AppModule.showToast(`Đã bỏ tim khỏi ${stop.place_name}.`);
    }

    renderTimeline();
  }

  function swapStop(stopId) {
    const stops = getCurrentStops();
    const stopIndex = stops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) return;

    const currentStop = stops[stopIndex];
    if (!currentStop.backup_options || currentStop.backup_options.length === 0) return;

    const backup = currentStop.backup_options[0];
    const oldName = currentStop.place_name;

    // Execute the Swap
    currentStop.place_name = backup.place_name;
    currentStop.address = backup.address;
    currentStop.lat = backup.lat;
    currentStop.lng = backup.lng;
    currentStop.cost_estimated = backup.cost_estimated;
    currentStop.rating = backup.rating;
    currentStop.image = backup.image;
    currentStop.description = "Phương án thay thế thông minh với không gian ấm cúng và cự ly di chuyển cực kỳ thuận tiện.";
    currentStop.sticky_note = "Huy: Điểm này không gian yên tĩnh và trà hoa quả rất ngon!";
    currentStop.backup_options = []; // Consumed
    currentStop.status = "ACCEPTED";
    currentStop.hearts_count = 5;
    currentStop.is_hearted = true;

    renderTimeline();

    // Synchronize Map
    if (window.MapModule) {
      MapModule.updateMarkers(stops);
      MapModule.flyToLocation(currentStop.lat, currentStop.lng);
    }

    AppModule.showToast(`🔄 Đã Swap sang "${backup.place_name}"!`, "green");

    if (window.ChatModule) {
      ChatModule.appendSystemMessage(`🔄 Nhóm đã chọn Swap sang <strong>${backup.place_name}</strong>.`);
    }
  }

  function lockFinalPlan() {
    consensusState = "FINAL_LOCKED";
    updateAgreementUI();
    renderTimeline();

    if (typeof confetti === "function") {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    AppModule.showToast("🎉 Lịch trình chính thức đã được chốt thành công!", "green");
    
    if (window.ChatModule) {
      ChatModule.appendSystemMessage("🔒 <strong>Host Tạ Quang Huy đã chốt hành trình!</strong> Toàn bộ điểm đến đã sẵn sàng.");
    }
  }

  function updateAgreementUI() {
    const lockBtn = document.getElementById("final-lock-btn");

    if (lockBtn) {
      if (consensusState === "FINAL_LOCKED") {
        lockBtn.innerHTML = `<i data-lucide="lock" style="width:14px;height:14px;"></i> Đã Chốt Hành Trình`;
        lockBtn.className = "btn btn-sm btn-navy";
        lockBtn.disabled = true;
      } else {
        lockBtn.innerHTML = `<i data-lucide="check" style="width:14px;height:14px;"></i> Chốt Lịch Trình`;
        lockBtn.className = "btn btn-sm btn-navy";
        lockBtn.disabled = false;
      }
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function adaptForRain() {
    if (currentDay !== 1) switchDay(1);

    const stop2 = dayStopsMap[1].find(s => s.id === "stop_2");
    if (stop2 && stop2.backup_options && stop2.backup_options.length > 0) {
      swapStop("stop_2");
      AppModule.showToast("🌧️ Đã thích ứng thời tiết: Đổi sang quán cà phê trong nhà!", "green");

      if (window.ChatModule) {
        ChatModule.appendAIMessage(
          "🌧️ Dự báo trời có mưa rào nhẹ tại Hội An! Mình đã tự động chuyển điểm dừng sang **The Hill Station Heritage Cafe** (cách 350m) có không gian vintage Pháp ấm cúng trong nhà để cả nhóm trú mưa nhé!"
        );
      }
    } else {
      AppModule.showToast("Điểm dừng đã được tối ưu cho thời tiết trong nhà!", "neutral");
    }
  }

  return {
    init,
    getCurrentStops,
    switchDay,
    toggleHeart,
    swapStop,
    lockFinalPlan,
    adaptForRain
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.querySelector(".sidebar");
  const container = document.querySelector(".container");
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    container.classList.toggle("sidebar-collapsed");
  });

  const themeToggle = document.getElementById("themeToggle");
  const themeSwitcher = document.getElementById("themeSwitcher");
  const defaultTheme = "sunburst-theme";
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    document.body.className = savedTheme;
    themeSwitcher.value = savedTheme.replace("-theme", "");
  } else {
    document.body.className = defaultTheme;
  }
  function applyTheme(themeName) {
    const themeClass = `${themeName}-theme`;
    document.body.className = themeClass;
    localStorage.setItem("selectedTheme", themeClass);
    themeSwitcher.value = themeName;
    updateStickyNoteOnThemeChange();
  }
  themeToggle.addEventListener("click", () => {
    const current = document.body.className.includes("daylight") ? "daylight" : "moonlight";
    const nextTheme = current === "daylight" ? "moonlight" : "daylight";
    applyTheme(nextTheme);
    updateStickyNoteOnThemeChange();
  });
  themeSwitcher.addEventListener("change", (e) => {
    const selected = e.target.value;
    if (selected) {
      applyTheme(selected)
      updateStickyNoteOnThemeChange();
    }
  });
  const resetThemeBtn = document.getElementById("resetThemeBtn");
  resetThemeBtn.addEventListener("click", () => {
    applyTheme("sunburst");
    themeSwitcher.value = "sunburst";
  });

  const calendar = document.getElementById("calendarGrid");
  const monthTitle = document.getElementById("monthTitle");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  let currentDate = new Date();
  let selectedDate = null;
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  function renderCalendar() {
    calendar.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    monthTitle.textContent = `${currentDate.toLocaleString("default", {
      month: "long",
    })} ${year}`;
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement("div");
      calendar.appendChild(blank);
    }
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    for (let d = 1; d <= daysInMonth; d++) {
      const dayBox = document.createElement("div");
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      if (date === new Date().toISOString().split("T")[0]) {
        dayBox.classList.add("today");
      }
      if (date === selectedDate) {
        dayBox.classList.add("selected-date");
      }
      const selectedCategory = document.getElementById("eventCategoryFilter").value;
      const todayEvents = events.filter((e) => {
        return e.date === date && (selectedCategory === "all" || e.category === selectedCategory);
      });
      dayBox.innerHTML = `<strong>${d}</strong>` + todayEvents
        .map((e) => `<span class="event-item">${e.title || ""}</span>`)
        .join("");
      dayBox.addEventListener("click", () => {
        selectedDate = date;
        renderCalendar();
        openDayEventsModal(date);
      });
      calendar.appendChild(dayBox);
    }
  }
  document.getElementById("eventCategoryFilter").addEventListener("change", renderCalendar);

  function openDayEventsModal(date) {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const dayEvents = events
    .map((e, index) => ({ ...e, index }))
    .filter((e) => e.date === date);
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.id = "dayEventsModal";
    const content = document.createElement("div");
    content.className = "modal-content";
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.onclick = () => modal.remove();
    const heading = document.createElement("h3");
    heading.textContent = `Events on ${date}`;
    content.appendChild(closeBtn);
    content.appendChild(heading);
    if (dayEvents.length === 0) {
      const noEvents = document.createElement("p");
      noEvents.textContent = "No events on this date.";
      content.appendChild(noEvents);
    } else {
      dayEvents.forEach((e) => {
        const wrapper = document.createElement("div");
        wrapper.className = "event-summary";
        const row = document.createElement("div");
        row.className = "event-title-row";
        const title = document.createElement("strong");
        title.textContent = e.title;
        title.style.cursor = "pointer";
        title.style.textDecoration = "underline";
        title.addEventListener("click", () => {
          eventIndexInput.value = e.index;
          eventTitle.value = e.title;
          eventDesc.value = e.desc;
          eventDate.value = e.date;
          eventCategory.value = e.category;
          deleteEvent.style.display = "inline-block";
          modal.remove(); // close day modal
          eventModal.classList.remove("hidden"); // open edit modal
        });
        const del = document.createElement("button");
        del.textContent = "🗑️";
        del.className = "delete-task-btn";
        del.onclick = () => {
          const modal = document.getElementById("deleteConfirmModal");
          const title = modal.querySelector("h3");
          const confirmBtn = document.getElementById("confirmDeleteBtn");
          const cancelBtn = document.getElementById("cancelDeleteBtn");
          // Set dynamic message and button text
          title.textContent = "Are you sure you want to delete this event?";
          confirmBtn.textContent = "Delete";
          // Replace buttons to clear old listeners
          const newConfirm = confirmBtn.cloneNode(true);
          const newCancel = cancelBtn.cloneNode(true);
          confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
          cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
          // Show modal
          modal.classList.remove("hidden");
          // Handle delete
          newConfirm.addEventListener("click", () => {
            const updated = events.filter((_, i) => i !== e.index);
            localStorage.setItem("events", JSON.stringify(updated));
            modal.classList.add("hidden");
            document.getElementById("dayEventsModal").remove();
            renderCalendar();
            renderEventChart();
          });
          newCancel.addEventListener("click", () => {
            modal.classList.add("hidden");
          });
        };

        const toggle = document.createElement("button");
        toggle.textContent = "🔻";
        toggle.className = "dropdown-toggle";
        toggle.onclick = () => {
          details.classList.toggle("hidden");
          toggle.textContent = details.classList.contains("hidden") ? "🔻" : "🔺";
        };
        row.appendChild(title);
        row.appendChild(toggle);
        row.appendChild(del);
        const details = document.createElement("div");
        details.className = "event-details hidden";
        details.innerHTML = `<p><strong>Category:</strong> ${e.category}</p>
        <p><strong>Description:</strong> ${e.desc || "No description"}</p>`;
        wrapper.appendChild(row);
        wrapper.appendChild(details);
        content.appendChild(wrapper);
      });
    }

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "➕ Add New Event";
    plusBtn.className = "themed-btn";
    plusBtn.onclick = () => {
      eventIndexInput.value = "";
      eventTitle.value = "";
      eventDesc.value = "";
      eventDate.value = date;
      eventCategory.value = "💼 Work";
      deleteEvent.style.display = "none";
      modal.remove();
      eventModal.classList.remove("hidden");
    };
    content.appendChild(plusBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });
  document.getElementById("todayBtn").addEventListener("click", () => {
    currentDate = new Date();
    renderCalendar();
  });

  const addEventBtn = document.getElementById("addEventBtn");
  const eventModal = document.getElementById("eventModal");
  const closeModal = eventModal.querySelector(".close-btn");
  const saveEvent = document.getElementById("saveEvent");
  const deleteEvent = document.getElementById("deleteEvent");
  const eventTitle = document.getElementById("eventTitle");
  const eventDesc = document.getElementById("eventDesc");
  const eventDate = document.getElementById("eventDate");
  const eventCategory = document.getElementById("eventCategory");
  const eventIndexInput = document.getElementById("eventIndex");
  addEventBtn.addEventListener("click", () => {
    eventIndexInput.value = "";
    eventTitle.value = "";
    eventDesc.value = "";
    eventDate.value = "";
    eventCategory.value = "💼 Work";
    deleteEvent.style.display = eventIndexInput.value !== "" ? "inline-block" : "none";
    eventModal.classList.remove("hidden");
  });
  closeModal.addEventListener("click", () => {
    eventModal.classList.add("hidden");
  });
  saveEvent.addEventListener("click", () => {
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    const newEvent = {
      title: eventTitle.value.trim(),
      desc: eventDesc.value.trim(),
      date: eventDate.value,
      category: eventCategory.value,
    };
    const index = eventIndexInput.value;
    if (index !== "") {
      events[index] = newEvent;
    } else {
      events.push(newEvent);
    }
    localStorage.setItem("events", JSON.stringify(events));
    eventModal.classList.add("hidden");
    showNotification("Saved!");
    renderCalendar();
    renderEventChart();
  });
  deleteEvent.addEventListener("click", () => {
    const modal = document.getElementById("deleteConfirmModal");
    const title = modal.querySelector("h3");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    title.textContent = "Are you sure you want to delete this event?";
    confirmBtn.textContent = "Delete";
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    modal.classList.remove("hidden");
    newConfirm.addEventListener("click", () => {
      const index = parseInt(eventIndexInput.value);
      if (!isNaN(index)) {
        const events = JSON.parse(localStorage.getItem("events") || "[]");
        events.splice(index, 1);
        localStorage.setItem("events", JSON.stringify(events));
        eventModal.classList.add("hidden");
        renderCalendar();
        renderEventChart();
      }
      modal.classList.add("hidden");
    });
    newCancel.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  });

  function showNotification(text) {
    const toast = document.getElementById("notification");
    toast.textContent = text;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2000);
  }

  function updateClock() {
    const clock = document.getElementById("liveClock");
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
      clock.textContent = timeStr;
    }, 1000);
  }
  updateClock();

  const taskList = document.getElementById("taskList");
  const taskInput = document.getElementById("newTaskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  let selectedTaskDate = new Date().toISOString().split("T")[0]; // Default to today
  function renderTasks() {
    const filter = document.getElementById("taskFilter").value;
    const allTasks = JSON.parse(localStorage.getItem("tasks") || "{}");
    taskList.innerHTML = "";
    if (filter === "all") {
      const allDates = Object.keys(allTasks).sort((a, b) => new Date(b) - new Date(a));
      allDates.forEach(date => {
        const tasks = allTasks[date];
        tasks.forEach((task, index) => {
          const li = document.createElement("li");
          li.dataset.index = index;
          li.draggable = true;
          // Checkbox
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = task.done;
          checkbox.addEventListener("change", () => {
            task.done = checkbox.checked;
            allTasks[date][index] = task;
            localStorage.setItem("tasks", JSON.stringify(allTasks));
            renderTasks();
            renderTaskChart();
          });
          // Task Text
          const span = document.createElement("span");
          span.textContent = `${task.text} — 📅 ${date}`;
          // Delete Button
          const delBtn = document.createElement("button");
          delBtn.textContent = "🗑️";
          delBtn.style.marginLeft = "10px";
          delBtn.addEventListener("click", () => {
            tasks.splice(index, 1);
            allTasks[date] = tasks;
            localStorage.setItem("tasks", JSON.stringify(allTasks));
            renderTasks();
            renderTaskChart();
          });
          li.appendChild(checkbox);
          li.appendChild(span);
          li.appendChild(delBtn);
          // Drag and drop
          li.addEventListener("dragstart", dragStart);
          li.addEventListener("dragover", dragOver);
          li.addEventListener("drop", drop);
          taskList.appendChild(li);
        });
      });
    } else {
      const tasks = allTasks[selectedTaskDate] || [];
      tasks.forEach((task, index) => {
        if (filter === "done" && !task.done) return;
        if (filter === "pending" && task.done) return;
        const li = document.createElement("li");
        li.dataset.index = index;
        li.draggable = true;
        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.addEventListener("change", () => {
          task.done = checkbox.checked;
          allTasks[selectedTaskDate][index] = task;
          localStorage.setItem("tasks", JSON.stringify(allTasks));
          renderTasks();
          renderTaskChart();
        });
        // Task Text
        const span = document.createElement("span");
        span.textContent = task.text;
        // Delete Button
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.style.marginLeft = "10px";
        delBtn.addEventListener("click", () => {
          tasks.splice(index, 1);
          allTasks[selectedTaskDate] = tasks;
          localStorage.setItem("tasks", JSON.stringify(allTasks));
          renderTasks();
          renderTaskChart();
        });
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        // Drag and drop
        li.addEventListener("dragstart", dragStart);
        li.addEventListener("dragover", dragOver);
        li.addEventListener("drop", drop);
        taskList.appendChild(li);
      });
    }
  }

  function renderMiniCalendar() {
    const miniCalendar = document.getElementById("miniCalendar");
    if (!miniCalendar) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    miniCalendar.innerHTML = "";
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.classList.add("empty-cell"); // Add a class to blank cells
      miniCalendar.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement("div");
      cell.textContent = day;
      const cellDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (cellDate === new Date().toISOString().split("T")[0]) {
        cell.classList.add("today");
      }
      // Add selected day highlight
      if (cellDate === selectedTaskDate) {
        cell.classList.add("mini-selected");
      }
      cell.addEventListener("click", () => {
        selectedTaskDate = cellDate;
        renderTasks();
        renderMiniCalendar();
      });
      miniCalendar.appendChild(cell);
    }
  }
  
  const toggleMiniCal = document.getElementById("toggleMiniCal");
  const miniCalendarContainer = document.getElementById("miniCalendarContainer");
  let isMiniCalCollapsed = false;
  toggleMiniCal.addEventListener("click", () => {
    isMiniCalCollapsed = !isMiniCalCollapsed;
    miniCalendarContainer.style.display = isMiniCalCollapsed ? "none" : "block";
    toggleMiniCal.textContent = isMiniCalCollapsed ? "▶" : "▼";
  });
  selectedTaskDate = new Date().toISOString().split("T")[0];
  renderTasks();
  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  }
  function dragOver(e) {
    e.preventDefault();
  }
  function drop(e) {
    const from = e.dataTransfer.getData("text/plain");
    const to = e.target.dataset.index;
    const allTasks = JSON.parse(localStorage.getItem("tasks") || "{}");
    const tasks = allTasks[selectedTaskDate] || [];
    const [moved] = tasks.splice(from, 1);
    tasks.splice(to, 0, moved);
    allTasks[selectedTaskDate] = tasks;
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    renderTasks();
  }
  addTaskBtn.addEventListener("click", () => {
    const task = taskInput.value.trim();
    if (task) {
      const allTasks = JSON.parse(localStorage.getItem("tasks") || "{}");
      if (!allTasks[selectedTaskDate]) {
        allTasks[selectedTaskDate] = [];
      }
      allTasks[selectedTaskDate].push({ text: task, done: false });
      localStorage.setItem("tasks", JSON.stringify(allTasks));
      taskInput.value = "";
      renderTasks();
      renderTaskChart();
    }
  });
  
  const stickyNoteArea = document.getElementById("stickyNoteArea");
  // Apply background color from theme variable
  function applyStickyNoteColor() {
    stickyNoteArea.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--note-bg');
  }
  // On page load
  stickyNoteArea.value = localStorage.getItem("stickyNote") || "";
  applyStickyNoteColor();
  // Save note content on input
  stickyNoteArea.addEventListener("input", () => {
    localStorage.setItem("stickyNote", stickyNoteArea.value);
  });
  // Observe theme changes to update sticky note background color
  const observer = new MutationObserver(() => {
    applyStickyNoteColor();
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  // Remove any old custom color setting (cleanup)
  localStorage.removeItem("stickyNoteColor");

//Mood Tracker
const selectedMood = document.getElementById("selectedMood");
const moodPopup = document.getElementById("moodPopup");
// Toggle popup on click
selectedMood.addEventListener("click", () => {
  moodPopup.classList.toggle("hidden");
});
// Handle mood selection
moodPopup.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const mood = btn.textContent;
    // Update visible mood
    selectedMood.textContent = mood;
    moodPopup.classList.add("hidden");
    // Save to localStorage
    const moods = JSON.parse(localStorage.getItem("moods") || "[]");
    moods.push(mood);
    localStorage.setItem("moods", JSON.stringify(moods));
    // Update the chart
    renderMoodChart();
  });
});

// Close popup if clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".mood-tracker")) {
    moodPopup.classList.add("hidden");
  }
});


  //WEATHER + TEMP
  const apiKey = "0c397456888a4073170b65200548c39a";  
  const weatherBox = document.getElementById("weatherBox");
  // Always use saved city or fallback
  function getSavedCity() {
    return localStorage.getItem("selectedCity") || "Patiala,IN";
  }
  function updateWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=Patiala,IN&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const temp = Math.round(data.main.temp);
      const weatherMain = data.weather[0].main.toLowerCase();
      let emoji = "❓";
      if (weatherMain.includes("cloud")) emoji = "⛅";
      else if (weatherMain.includes("clear")) emoji = "☀️";
      else if (weatherMain.includes("rain")) emoji = "🌧️";
      else if (weatherMain.includes("storm")) emoji = "⛈️";
      else if (weatherMain.includes("snow")) emoji = "❄️";
      else if (weatherMain.includes("fog") || weatherMain.includes("mist")) emoji = "🌫️";
      weatherBox.innerHTML = `<span style="font-size: 1.8rem;">${emoji}</span> ${temp}°C`;
      console.log(`✅ Weather updated for ${city}: ${emoji} ${temp}°C`);
    })
    .catch(error => {
      weatherBox.textContent = "❓ --°C";
      console.error("❌ Failed to fetch weather data:", error);
    });
  }
  // Run on page load
  document.addEventListener("DOMContentLoaded", () => {
    const city = getSavedCity();
    updateWeather(city);
    setInterval(() => updateWeather(city), 1800000);
  });


  //Profile PIC
  const profilePicBtn = document.getElementById("profilePicBtn");
  const profileModal = document.getElementById("profileModal");
  const profileDisplayArea = document.getElementById("profileDisplayArea");
  const closeProfileModal = document.getElementById("closeProfileModal");
  const changePicBtn = document.getElementById("changePicBtn");
  const defaultPicBtn = document.getElementById("defaultPicBtn");
  const uploadPicInput = document.getElementById("uploadPicInput");
  const defaultProfilePic = "assets/App logo.jpg";
  function loadProfilePic() {
    const savedPic = localStorage.getItem("profilePic");
    profilePicBtn.src = savedPic || defaultProfilePic;
  }
  function updateProfileModal() {
    const savedPic = localStorage.getItem("profilePic");
    profileDisplayArea.innerHTML = "";
    const img = document.createElement("img");
    img.src = savedPic || defaultProfilePic;
    profileDisplayArea.appendChild(img);
    profileModal.classList.remove("hidden");
  }
  profilePicBtn.addEventListener("click", updateProfileModal);
  closeProfileModal.addEventListener("click", () => {
    profileModal.classList.add("hidden");
  });
  changePicBtn.addEventListener("click", () => {
    uploadPicInput.click();
  });
  uploadPicInput.addEventListener("change", () => {
    const file = uploadPicInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("profilePic", reader.result);
      loadProfilePic();
      profileModal.classList.add("hidden");
    };
    reader.readAsDataURL(file);
  });
  defaultPicBtn.addEventListener("click", () => {
    localStorage.removeItem("profilePic");
    loadProfilePic();
    profileModal.classList.add("hidden");
  });

  const sidebarNameInput = document.getElementById("sidebarNameInput");
  // Load saved name or fallback to "Your Name"
  sidebarNameInput.value = localStorage.getItem("sidebarName") || "";
  // Show placeholder if input is empty
  sidebarNameInput.placeholder = "Your Name";
  // Save name to localStorage on input
  sidebarNameInput.addEventListener("input", () => {
    const name = sidebarNameInput.value.trim();
    if (name) {
      localStorage.setItem("sidebarName", name);
    } else {
      localStorage.removeItem("sidebarName");
    }
  });

  // Reset All Data
  document.getElementById("resetBtn").addEventListener("click", () => {
    const modal = document.getElementById("deleteConfirmModal");
    const title = modal.querySelector("h3");
    const confirmBtn = document.getElementById("confirmDeleteBtn");
    const cancelBtn = document.getElementById("cancelDeleteBtn");
    // Set message and confirm button text
    title.textContent = "Are you sure you want to reset all data?";
    confirmBtn.textContent = "Reset";
    // Remove old event listeners safely
    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    // Show modal
    modal.classList.remove("hidden");
    // Bind new actions
    newConfirm.addEventListener("click", () => {
      localStorage.clear();
      modal.classList.add("hidden");
      location.reload();
    });
    newCancel.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  });

  //Print
  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  // Persist and apply saved category filter
  const categoryFilter = document.getElementById("eventCategoryFilter");
  const savedCategory = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedCategory;
  categoryFilter.addEventListener("change", () => {
    localStorage.setItem("selectedCategory", categoryFilter.value);
    renderCalendar();
  });


  renderCalendar();
  renderTasks();
  renderMiniCalendar();


  //Section switching
  const navItems = document.querySelectorAll("nav li");
  const calendarSection = document.getElementById("calendarSection");
  const historySection = document.getElementById("historySection");
  const settingsSection = document.getElementById("settingsSection");
  // Default show calendar
  calendarSection.style.display = "block";
  historySection.style.display = "none";
  settingsSection.style.display = "none";
  navItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      navItems.forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      // Toggle views based on index
      if (index === 0) {
        calendarSection.style.display = "block";
        historySection.style.display = "none";
        settingsSection.style.display = "none";
      } else if (index === 1) {
        calendarSection.style.display = "none";
        historySection.style.display = "block";
        settingsSection.style.display = "none";
      } else if (index === 2) {
        calendarSection.style.display = "none";
        historySection.style.display = "none";
        settingsSection.style.display = "block";
      }
    });
  });


  //search bar
  document.getElementById("searchInput").addEventListener("input", () => {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";
    if (!query) return;
    const matched = [];
    // Search Events
    const events = JSON.parse(localStorage.getItem("events") || "[]");
    events.forEach((event, i) => {
      const { title, desc, category, date } = event;
      if (
        title.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        date.includes(query)
      ) {
        matched.push(`<div><strong>Event:</strong> ${title} (${date})</div>`);
      }
    });
    // Search Tasks
    const allTasks = JSON.parse(localStorage.getItem("tasks") || "{}");
    for (const [date, tasks] of Object.entries(allTasks)) {
      tasks.forEach((task, i) => {
        if (task.text.toLowerCase().includes(query)) {
          matched.push(`<div><strong>Task:</strong> ${task.text} (${date})</div>`);
        }
      });
    }
    // Search Sticky Note
    const note = localStorage.getItem("stickyNote") || "";
    if (note.toLowerCase().includes(query)) {
      matched.push(`<div><strong>Sticky Note:</strong> ${note}</div>`);
    }
    if (matched.length > 0) {
      resultsDiv.innerHTML = matched.join("<hr>");  
    } else {
      resultsDiv.innerHTML = "<em>No matches found</em>";
    }
  });

  //Terms & Policies
  const openTermsBtn = document.getElementById("openTermsBtn");
  const openPrivacyBtn = document.getElementById("openPrivacyBtn");
  const legalModal = document.getElementById("legalModal");
  const legalTitle = document.getElementById("legalTitle");
  const legalContent = document.getElementById("legalContent");
  const closeLegalModal = document.getElementById("closeLegalModal");
  const termsText = `
    <h3>1. Acceptance of Terms</h3>
    <p>By using Cllario, you agree to our terms...</p>
    <h3>2. User Responsibilities</h3>
    <p>You must use the app ethically and legally...</p>
    <!-- Add more sections here -->
  `;
  const privacyText = `
    <h3>1. Data We Collect</h3>
    <p>We collect only necessary data like name, photo, tasks...</p>
    <h3>2. How We Use Data</h3>
    <p>Your data stays in your device and helps personalize the app...</p>
    <!-- Add more sections here -->
  `;
  openTermsBtn.addEventListener("click", () => {
    legalTitle.textContent = "Terms & Conditions";
    legalContent.innerHTML = termsText;
    legalModal.classList.remove("hidden");
  });
  openPrivacyBtn.addEventListener("click", () => {
    legalTitle.textContent = "Privacy Policy";
    legalContent.innerHTML = privacyText;
    legalModal.classList.remove("hidden");
  });
  closeLegalModal.addEventListener("click", () => {
    legalModal.classList.add("hidden");
  });
  
  // Render charts if functions exist
  if (typeof renderTaskChart === "function") renderTaskChart();
  if (typeof renderEventChart === "function") renderEventChart();
  if (typeof renderMoodChart === "function") renderMoodChart();
});
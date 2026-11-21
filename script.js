/* ===== HotelHire – script.js =====
   Plain JavaScript prototype. Data is saved in localStorage so it
   survives page refresh. Replace the `DB` functions with API calls
   when you connect a real backend.                                  */

/* ---------- Constants ---------- */
const LOCATIONS = ["Pune", "Mumbai", "Solapur", "Baramati", "Nashik", "Kolhapur", "Satara"];
const JOB_TYPES = ["Waiter", "Chef", "Kitchen Helper", "Housekeeping", "Receptionist",
                   "Cleaner", "Security", "Room Service", "Delivery Staff", "Other"];
const HOTELS = ["Hotel Sunrise", "The Deccan Residency", "Hotel Sahyadri Grand", "Riverside Inn",
                "The Presidency Suites", "Hotel Ambience", "Fort View Hotel", "The Grand Palazzo",
                "Hotel Krishna Palace", "Hilltop Retreat"];
const WORKER_NAMES = ["Rahul Patil", "Sneha Kulkarni", "Amit Shinde", "Pooja Deshmukh", "Vikram Jadhav",
                      "Anjali More", "Suresh Gaikwad", "Priya Bhosale", "Ravi Pawar", "Neha Chavan"];
const SKILL_SETS = [
  ["Cooking", "Cleaning", "Kitchen Support"],
  ["Guest Service", "Billing", "POS Systems"],
  ["Room Cleaning", "Linen Handling", "Time Management"],
  ["Front Desk", "Check-in/out", "Communication"],
  ["Serving", "Table Setup", "Customer Care"],
];

/* ---------- Demo data (10 vacancies + 10 workers) ---------- */
function seedVacancies() {
  const required = [1, 2, 2, 3, 1, 2, 4, 1, 2, 3];
  const hired    = [0, 0, 1, 3, 0, 2, 1, 1, 2, 0];
  return HOTELS.map((name, i) => ({
    id: "V" + (i + 1),
    hotelName: name,
    location: LOCATIONS[i % LOCATIONS.length],
    address: (12 + i) + " MG Road, " + LOCATIONS[i % LOCATIONS.length],
    contact: "98" + String(20000000 + i * 1234).slice(0, 8),
    jobType: JOB_TYPES[i % 9],
    workersRequired: required[i],
    workersHired: hired[i],
    startDate: "2026-08-" + String(24 + (i % 5)).padStart(2, "0"),
    endDate: "2026-08-" + String(27 + (i % 5)).padStart(2, "0"),
    workingHours: i % 2 === 0 ? "10 AM – 7 PM" : "6 PM – 2 AM",
    salaryPerDay: 600 + i * 45,
    foodProvided: i % 3 !== 0,
    accommodation: i % 4 === 0,
    experience: i % 2 === 0 ? "0–1 year" : "1–2 years",
    notes: "",
    distanceKm: (1.2 + i * 0.7).toFixed(1),
  }));
}

function seedWorkers() {
  return WORKER_NAMES.map((name, i) => ({
    id: "W" + (i + 1),
    name: name,
    role: JOB_TYPES[i % 9],
    location: LOCATIONS[(i + 2) % LOCATIONS.length],
    experience: ((i % 4) + 1) + " year" + ((i % 4) + 1 > 1 ? "s" : ""),
    from: "25 Aug", to: (30 + (i % 2)) + " Aug",
    skills: SKILL_SETS[i % SKILL_SETS.length],
    rating: (3.8 + (i % 5) * 0.25).toFixed(1),
    mobile: "97" + String(41000000 + i * 987).slice(0, 8),
    email: name.toLowerCase().replace(" ", ".") + "@mail.com",
  }));
}

/* ---------- Tiny "database" layer (localStorage) ---------- */
const DB = {
  get(key, fallback) {
    try { const v = localStorage.getItem("hh_" + key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("hh_" + key, JSON.stringify(value)); } catch (e) {}
  },
};

/* ---------- App state ---------- */
const state = {
  user: DB.get("user", null),
  role: DB.get("role", null),
  vacancies: DB.get("vacancies", null) || seedVacancies(),
  workers: seedWorkers(),
  applications: DB.get("applications", []),
  authMode: "login",
};
DB.set("vacancies", state.vacancies);

/* ---------- Helpers ---------- */
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function save() {
  DB.set("user", state.user); DB.set("role", state.role);
  DB.set("vacancies", state.vacancies); DB.set("applications", state.applications);
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.add("hidden"), 2600);
}

function statusOf(v) {
  const ratio = v.workersHired / v.workersRequired;
  if (ratio >= 1) return { key: "filled", label: "🔴 Filled" };
  if (ratio >= 0.5) return { key: "almost", label: "🟡 Almost Filled" };
  return { key: "open", label: "🟢 Open" };
}

function fmtDate(d) {
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fillSelect(sel, options, firstLabel) {
  sel.innerHTML = (firstLabel ? `<option value="">${firstLabel}</option>` : "") +
    options.map((o) => `<option>${o}</option>`).join("");
}

/* ---------- Logo (SVG) ---------- */
const LOGO_SVG = `
<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="44" height="44" rx="12" fill="#0F172A"/>
  <path d="M12 34V16h4v7h12v-7h4v18h-4v-7H16v7h-4z" fill="#F8FAFC"/>
  <circle cx="36" cy="14" r="5.5" fill="#F59E0B"/>
  <path d="M33.7 14l1.5 1.5 3-3" stroke="#0F172A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
<span class="logo-text">Hotel<span>Hire</span></span>`;
$$(".logo").forEach((el) => (el.innerHTML = LOGO_SVG));

/* ---------- Navigation ---------- */
const OWNER_LINKS = [["ownerDash", "Dashboard"], ["postVacancy", "Post Vacancy"],
                     ["myVacancies", "My Vacancies"], ["findWorkers", "Find Workers"], ["profile", "Profile"]];
const WORKER_LINKS = [["findJobs", "Find Jobs"], ["myApplications", "My Applications"], ["profile", "Profile"]];
const PUBLIC_PAGES = ["landing", "auth", "userType"];
let currentPage = "landing";

function go(page) {
  currentPage = page;
  $$(".page").forEach((p) => p.classList.add("hidden"));
  $("#page-" + page).classList.remove("hidden");
  $("#page-" + page).style.display = page === "auth" || page === "userType" ? "flex" : "";
  $("#navbar").classList.toggle("hidden", PUBLIC_PAGES.includes(page));
  buildNav();
  renderPage(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildNav() {
  const links = state.role === "owner" ? OWNER_LINKS : WORKER_LINKS;
  const nav = $("#nav-links");
  nav.innerHTML = links.map(([id, label]) =>
    `<button data-go="${id}" class="${id === currentPage ? "active" : ""}">${label}</button>`).join("") +
    `<button id="logout">Exit</button>`;
  $("#logout").onclick = logout;
  nav.classList.remove("open");
}

function logout() {
  state.user = null; state.role = null; save(); go("landing");
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-go]");
  if (t) go(t.dataset.go);
});
$("#menu-btn").onclick = () => $("#nav-links").classList.toggle("open");

/* ---------- Auth ---------- */
function setAuthMode(mode) {
  state.authMode = mode;
  $("#tab-login").classList.toggle("active", mode === "login");
  $("#tab-signup").classList.toggle("active", mode === "signup");
  $("#signup-only").style.display = mode === "signup" ? "block" : "none";
  $("#signup-only-2").style.display = mode === "signup" ? "block" : "none";
  $("#auth-submit").textContent = mode === "login" ? "Login" : "Create Account";
  $("#auth-error").textContent = "";
}
$("#tab-login").onclick = () => setAuthMode("login");
$("#tab-signup").onclick = () => setAuthMode("signup");

function validateAuth() {
  const name = $("#f-name").value.trim();
  const mobile = $("#f-mobile").value.trim();
  const email = $("#f-email").value.trim();
  const pass = $("#f-pass").value;
  const confirm = $("#f-confirm").value;
  const err = $("#auth-error");

  if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = "Enter a valid email address."; return null; }
  if (pass.length < 6) { err.textContent = "Password must be at least 6 characters."; return null; }
  if (state.authMode === "signup") {
    if (name.length < 2) { err.textContent = "Please enter your full name."; return null; }
    if (!/^[6-9]\d{9}$/.test(mobile)) { err.textContent = "Enter a valid 10-digit Indian mobile number."; return null; }
    if (pass !== confirm) { err.textContent = "Passwords do not match."; return null; }
  }
  err.textContent = "";
  return { name: name || email.split("@")[0], mobile: mobile || "9800000000", email };
}

function finishAuth(role) {
  const u = validateAuth();
  if (!u) return;
  state.user = u; save();
  if (role) { state.role = role; save(); go(role === "owner" ? "ownerDash" : "findJobs"); }
  else go("userType");
}
$("#auth-submit").onclick = () => finishAuth(null);
$("#as-owner").onclick = () => finishAuth("owner");
$("#as-worker").onclick = () => finishAuth("worker");

$("#pick-owner").onclick = () => { state.role = "owner"; save(); go("ownerDash"); };
$("#pick-worker").onclick = () => { state.role = "worker"; save(); go("findJobs"); };

/* ---------- Page renderers ---------- */
function renderPage(page) {
  if (page === "ownerDash") renderOwnerDash();
  if (page === "postVacancy") fillSelect($("#vacancy-form [name=location]"), LOCATIONS, "Select city");
  if (page === "myVacancies") renderMyVacancies();
  if (page === "findWorkers") renderWorkers();
  if (page === "findJobs") renderJobs();
  if (page === "myApplications") renderMyApps();
  if (page === "profile") renderProfile();
}

/* Owner dashboard */
function renderOwnerDash() {
  const first = (state.user && state.user.name.split(" ")[0]) || "Hotel Owner";
  $("#welcome-owner").textContent = `Welcome, ${first}!`;
  const active = state.vacancies.filter((v) => statusOf(v).key !== "filled").length;
  const filled = state.vacancies.length - active;
  const hired = state.vacancies.reduce((s, v) => s + v.workersHired, 0);
  const stats = [["Active Vacancies", active], ["Applications", state.applications.length],
                 ["Workers Hired", hired], ["Vacancies Filled", filled]];
  $("#owner-stats").innerHTML = stats.map(([l, n]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join("");
}

/* Post vacancy */
fillSelect($("#job-type-select"), JOB_TYPES);
$("#vacancy-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const start = f.get("startDate"), end = f.get("endDate");
  if (end < start) return toast("End date cannot be before start date.");
  state.vacancies.unshift({
    id: "V" + Date.now(),
    hotelName: f.get("hotelName"), location: f.get("location"), address: f.get("address"),
    contact: f.get("contact"), jobType: f.get("jobType"),
    workersRequired: Math.max(1, Number(f.get("workersRequired"))), workersHired: 0,
    startDate: start, endDate: end, workingHours: f.get("workingHours") || "Flexible",
    salaryPerDay: Number(f.get("salaryPerDay")),
    foodProvided: f.get("foodProvided") === "yes", accommodation: f.get("accommodation") === "yes",
    experience: f.get("experience"), notes: f.get("notes"),
    distanceKm: (Math.random() * 8 + 0.5).toFixed(1),
  });
  save(); e.target.reset();
  toast("Vacancy posted successfully!");
  go("myVacancies");
});

/* Vacancy card HTML */
function vacancyCard(v, mode) {
  const s = statusOf(v);
  const pct = Math.min(100, (v.workersHired / v.workersRequired) * 100);
  const buttons = mode === "worker"
    ? `<button class="btn outline" onclick="viewVacancy('${v.id}')">View Details</button>
       <button class="btn outline" onclick="contactHotel('${v.id}')">Contact Hotel</button>
       <button class="btn gold" onclick="applyNow('${v.id}')">Apply Now</button>`
    : "";
  return `
  <div class="item">
    <div class="item-head">
      <div><h4>🏨 ${v.hotelName}</h4><div class="sub">📍 ${v.location} · ${v.distanceKm} km</div></div>
      <span class="badge ${s.key}">${s.label}</span>
    </div>
    <strong>${v.jobType} Required</strong>
    <div class="facts">
      <span>👥 ${v.workersRequired} Workers</span>
      <span>📅 ${fmtDate(v.startDate)} – ${fmtDate(v.endDate)}</span>
      <span>⏰ ${v.workingHours}</span>
      <span>💰 ₹${v.salaryPerDay}/day</span>
      <span>🍽 ${v.foodProvided ? "Food Provided" : "No Food"}</span>
      <span>🏠 Stay: ${v.accommodation ? "Yes" : "No"}</span>
    </div>
    <div class="meter ${s.key}"><span style="width:${pct}%"></span></div>
    <div class="meter-label"><span>${v.workersHired}/${v.workersRequired} filled</span><span>Exp: ${v.experience}</span></div>
    <div class="actions">${buttons}</div>
  </div>`;
}

/* Owner: my vacancies + applicants */
function renderMyVacancies() {
  $("#my-vacancies").innerHTML = state.vacancies.map((v) => {
    const s = statusOf(v);
    const apps = state.applications.filter((a) => a.vacancyId === v.id);
    const applicants = apps.map((a) => `
      <div class="applicant">
        <div><b>${a.name}</b><br><span class="sub">${v.jobType} · ${a.experience} · ${a.phoneMasked}</span></div>
        ${a.status === "Pending"
          ? `<div><button class="btn good" onclick="respond('${a.id}','Accepted')">Accept</button>
                  <button class="btn bad" onclick="respond('${a.id}','Rejected')">Reject</button></div>`
          : `<span class="badge ${a.status.toLowerCase()}">${a.status}</span>`}
      </div>`).join("");
    return `
    <div class="item">
      <div class="item-head">
        <div><h4>${v.hotelName}</h4><div class="sub">${v.jobType} · ${v.location}</div></div>
        <span class="badge ${s.key}">${s.label}</span>
      </div>
      <div class="meter ${s.key}"><span style="width:${Math.min(100, v.workersHired / v.workersRequired * 100)}%"></span></div>
      <div class="meter-label"><span>${v.workersHired}/${v.workersRequired} hired</span><span>${apps.length} applicant(s)</span></div>
      ${applicants}
      <div class="actions">
        ${s.key !== "filled" ? `<button class="btn good" onclick="markFilled('${v.id}')">Mark Filled</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

function markFilled(id) {
  const v = state.vacancies.find((x) => x.id === id);
  v.workersHired = v.workersRequired; save();
  toast("Vacancy marked as FILLED."); renderMyVacancies();
}

function respond(appId, status) {
  const a = state.applications.find((x) => x.id === appId);
  a.status = status;
  if (status === "Accepted") {
    const v = state.vacancies.find((x) => x.id === a.vacancyId);
    v.workersHired = Math.min(v.workersRequired, v.workersHired + 1);
  }
  save(); toast("Application " + status.toLowerCase() + "."); renderMyVacancies();
}

/* Owner: worker directory */
fillSelect($("#worker-loc"), LOCATIONS, "All locations");
function renderWorkers() {
  const q = $("#worker-search").value.toLowerCase();
  const loc = $("#worker-loc").value;
  // Supports queries like "waiter in pune" or "workers near pune"
  const words = q.replace(/\b(in|near|available|workers?|me)\b/g, " ").split(/\s+/).filter(Boolean);
  const list = state.workers.filter((w) => {
    const hay = (w.name + " " + w.role + " " + w.location + " " + w.skills.join(" ")).toLowerCase();
    return words.every((x) => hay.includes(x)) && (!loc || w.location === loc);
  });
  $("#worker-list").innerHTML = list.length ? list.map((w) => `
    <div class="item">
      <div class="worker-head">
        <span class="avatar">${w.name[0]}</span>
        <div><h4>${w.name}</h4><div class="sub">👨‍🍳 ${w.role} · 📍 ${w.location}</div></div>
      </div>
      <div class="facts"><span>Experience: ${w.experience}</span><span>⭐ ${w.rating}</span>
        <span>📅 ${w.from} – ${w.to}</span></div>
      <div class="skills">${w.skills.map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="actions">
        <button class="btn outline" onclick="viewWorker('${w.id}')">View Profile</button>
        <button class="btn gold" onclick="contactWorker('${w.id}')">Contact Worker</button>
      </div>
    </div>`).join("") : `<p class="sub">No workers match your search.</p>`;
}
$("#worker-search").oninput = renderWorkers;
$("#worker-loc").onchange = renderWorkers;

/* Worker: find jobs */
fillSelect($("#job-loc"), LOCATIONS, "All locations");
fillSelect($("#job-type"), JOB_TYPES, "All job types");
function renderJobs() {
  const q = $("#job-search").value.toLowerCase();
  const words = q.replace(/\b(in|near|hotel|jobs?|me)\b/g, " ").split(/\s+/).filter(Boolean);
  const loc = $("#job-loc").value, type = $("#job-type").value;
  const minSal = Number($("#job-salary").value), exp = $("#job-exp").value;

  // Filled vacancies never appear in the main job list
  const open = state.vacancies.filter((v) => statusOf(v).key !== "filled");
  const list = open.filter((v) => {
    const hay = (v.hotelName + " " + v.jobType + " " + v.location).toLowerCase();
    return words.every((x) => hay.includes(x)) && (!loc || v.location === loc) &&
           (!type || v.jobType === type) && v.salaryPerDay >= minSal && (!exp || v.experience === exp);
  });
  $("#job-list").innerHTML = list.length ? list.map((v) => vacancyCard(v, "worker")).join("")
                                          : `<p class="sub">No vacancies match your search.</p>`;

  // "Near you" placeholder map
  $("#map-dots").innerHTML = open.slice(0, 7).map((v, i) =>
    `<span class="map-dot" title="${v.hotelName}" style="left:${10 + i * 12}%;top:${20 + (i % 3) * 25}%"></span>`).join("");
  $("#near-list").innerHTML = open.slice().sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 5).map((v) =>
    `<li><span>📍 ${v.hotelName} — ${v.jobType} — ₹${v.salaryPerDay}/day</span><span class="mono">${v.distanceKm} km</span></li>`).join("");
}
["#job-search"].forEach((s) => ($(s).oninput = renderJobs));
["#job-loc", "#job-type", "#job-salary", "#job-exp"].forEach((s) => ($(s).onchange = renderJobs));

/* Worker: my applications */
function renderMyApps() {
  $("#my-apps").innerHTML = state.applications.length ? state.applications.map((a) => {
    const v = state.vacancies.find((x) => x.id === a.vacancyId);
    return `<div class="app-row">
      <div><h4>${v ? v.jobType + " at " + v.hotelName : "Vacancy"}</h4>
      <div class="sub">${v ? v.location : ""} · Available ${fmtDate(a.availableDate)}</div></div>
      <span class="badge ${a.status.toLowerCase()}">${a.status}</span></div>`;
  }).join("") : `<p class="sub">You haven't applied to any jobs yet.</p>`;
}

/* Profile */
function renderProfile() {
  const u = state.user || {};
  const mask = (m) => (m ? m.slice(0, 2) + "******" + m.slice(-2) : "");
  $("#profile-card").innerHTML = `
    <div class="worker-head"><span class="avatar" style="width:64px;height:64px;font-size:1.6rem">${(u.name || "U")[0]}</span>
      <div><h3 style="margin:0">${u.name || ""}</h3>
      <span class="badge accepted">${state.role === "owner" ? "Hotel Owner" : "Worker"}</span></div></div>
    <div class="grid-2" style="margin-top:16px">
      <label>Mobile<br><b>${mask(u.mobile)}</b></label>
      <label>Email<br><b>${u.email || ""}</b></label>
      ${state.role === "owner"
        ? `<label>Hotel Type<br><b>Independent property</b></label><label>Rating<br><b>⭐ 4.8</b></label>`
        : `<label>Skills<br><b>Cooking, Cleaning, Customer Service</b></label><label>Rating<br><b>⭐ 4.6</b></label>`}
    </div>`;
}

/* ---------- Modals ---------- */
function openModal(html) { $("#modal-content").innerHTML = html; $("#modal").classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
$("#modal-close").onclick = closeModal;
$("#modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };

function viewVacancy(id) {
  const v = state.vacancies.find((x) => x.id === id);
  openModal(`<h3>${v.hotelName}</h3>
    <p class="sub">📍 ${v.address}</p>
    <div class="facts">
      <span>Role: ${v.jobType}</span><span>Workers: ${v.workersRequired}</span>
      <span>📅 ${fmtDate(v.startDate)} – ${fmtDate(v.endDate)}</span><span>⏰ ${v.workingHours}</span>
      <span>💰 ₹${v.salaryPerDay}/day</span><span>Exp: ${v.experience}</span>
      <span>🍽 Food: ${v.foodProvided ? "Yes" : "No"}</span><span>🏠 Stay: ${v.accommodation ? "Yes" : "No"}</span>
    </div>
    <p>${v.notes || "No additional requirements."}</p>
    <button class="btn gold full" onclick="closeModal();applyNow('${v.id}')">Apply Now</button>`);
}

function viewWorker(id) {
  const w = state.workers.find((x) => x.id === id);
  openModal(`<h3>${w.name}</h3><p class="sub">${w.role} · ${w.location} · ⭐ ${w.rating}</p>
    <div class="facts"><span>Experience: ${w.experience}</span><span>Available: ${w.from} – ${w.to}</span></div>
    <div class="skills">${w.skills.map((s) => `<span>${s}</span>`).join("")}</div>
    <button class="btn gold full" onclick="closeModal();contactWorker('${w.id}')">Contact Worker</button>`);
}

/* Protected contact: details stay hidden until the user chooses to reveal */
function contactModal(name, mobile, email) {
  openModal(`<h3>Contact ${name}</h3>
    <div class="reveal-box" id="reveal-box">🔒 Contact details are protected.
      <br><button class="btn outline" style="margin-top:10px" id="reveal-btn">Reveal contact</button></div>
    <label>Your Name<input id="c-name" value="${(state.user && state.user.name) || ""}" /></label>
    <label>Mobile Number<input id="c-mobile" value="${(state.user && state.user.mobile) || ""}" /></label>
    <label>Email<input id="c-email" value="${(state.user && state.user.email) || ""}" /></label>
    <label>Message<textarea id="c-msg" rows="3" placeholder="Hi, I'm interested..."></textarea></label>
    <button class="btn dark full" id="send-msg">Send Message</button>`);
  $("#reveal-btn").onclick = () => {
    $("#reveal-box").innerHTML = `📞 ${mobile}<br>✉️ ${email}`;
  };
  $("#send-msg").onclick = () => {
    if (!$("#c-msg").value.trim()) return toast("Please write a message first.");
    closeModal(); toast("Message sent successfully.");
  };
}
function contactHotel(id) {
  const v = state.vacancies.find((x) => x.id === id);
  contactModal(v.hotelName, v.contact, "hr@" + v.hotelName.toLowerCase().replace(/\s+/g, "") + ".com");
}
function contactWorker(id) {
  const w = state.workers.find((x) => x.id === id);
  contactModal(w.name, w.mobile, w.email);
}

/* Apply flow */
function applyNow(id) {
  const v = state.vacancies.find((x) => x.id === id);
  openModal(`<h3>Apply: ${v.jobType} at ${v.hotelName}</h3>
    <label>Worker Name<input id="a-name" value="${(state.user && state.user.name) || ""}" /></label>
    <label>Phone Number<input id="a-phone" maxlength="10" value="${(state.user && state.user.mobile) || ""}" /></label>
    <label>Experience<input id="a-exp" placeholder="e.g. 1 year" /></label>
    <label>Available Date<input id="a-date" type="date" value="${v.startDate}" /></label>
    <label>Message<textarea id="a-msg" rows="3"></textarea></label>
    <button class="btn gold full" id="a-submit">Submit Application</button>`);
  $("#a-submit").onclick = () => {
    const name = $("#a-name").value.trim(), phone = $("#a-phone").value.trim();
    if (!name || !/^\d{10}$/.test(phone)) return toast("Enter your name and a valid 10-digit phone.");
    state.applications.unshift({
      id: "A" + Date.now(), vacancyId: id, name: name,
      phoneMasked: phone.slice(0, 2) + "******" + phone.slice(-2),   // never show full number
      experience: $("#a-exp").value || "—", availableDate: $("#a-date").value,
      message: $("#a-msg").value, status: "Pending",
    });
    save(); closeModal(); toast("Application submitted successfully.");
  };
}

/* ---------- Start ---------- */
setAuthMode("login");
if (state.user && state.role) go(state.role === "owner" ? "ownerDash" : "findJobs");
else go("landing");

// app.js - Frontend Interactivity & API Client

// BASE API URL - Dynamic detection of host
const API_BASE = window.location.origin;

// Client-side Fallback Data (used when backend server is offline)
const FALLBACK_TIPS = [
  {
    id: 1,
    category: "performance",
    title: "Frame Rate Over Graphics (Offline)",
    content: "Set your graphics to 'Smooth' and select the highest available Frame Rate ('Extreme' or '90/120 FPS') to reduce lag and input latency."
  },
  {
    id: 2,
    category: "combat",
    title: "Master the Jiggle Move (Offline)",
    content: "Move your joystick left and right rapidly in close range fire-fights. It throws off enemy crosshairs while yours stays steady."
  },
  {
    id: 3,
    category: "settings",
    title: "Enable Gyroscope (Offline)",
    content: "Set Gyroscope to 'Always On'. Micro-adjust your aim by tilting your phone rather than dragging your finger."
  },
  {
    id: 4,
    category: "combat",
    title: "Pre-fire and Sound Cues (Offline)",
    content: "Wear headphones. When you hear an enemy approaching, fire a split second before they cross the corner to beat latency."
  },
  {
    id: 5,
    category: "performance",
    title: "Background App Restriction (Offline)",
    content: "Restrict background execution for social applications. This maintains low ping and stops micro-stutters during heavy combat."
  },
  {
    id: 6,
    category: "settings",
    title: "Custom Pick-up Limits (Offline)",
    content: "Cap your auto-pickup numbers for standard ammo types. Carry more utilities like smoke and frag grenades instead."
  }
];

const FALLBACK_CODES = [
  { code: "BGMI-NEWERA-2026", reward: "Urban Hunter Set (3d)", status: "Active", expiry: "2026-07-31" },
  { code: "BGMIDROPFAST", reward: "50x Silver Fragments", status: "Active", expiry: "2026-07-15" },
  { code: "WINNERCHICKEN", reward: "Classic Crate Coupon", status: "Active", expiry: "2026-06-30" }
];

const DEFAULT_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pubg.imobile';
const DEFAULT_APK_URL = 'https://www.battlegroundsmobileindia.com/';

// State tracker
let isBackendOnline = false;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Test connection and retrieve stats
  checkBackendStatus();

  // Initialize premium smooth scroll
  initializeSmoothScroll();

  // Load interactive features
  initializeTipsFilter();
  initializeRedeemCodes();
  initializeOptimizer();
  initializeFeedbackForm();
  initializeDownloadLinks();
});

// Helper to check if backend is online and fetch download statistics
async function checkBackendStatus() {
  const statsPlaystore = document.getElementById("stats-playstore");
  const statsApk = document.getElementById("stats-apk");

  try {
    const response = await fetch(`${API_BASE}/api/downloads`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        isBackendOnline = true;
        statsPlaystore.textContent = data.playstore;
        statsApk.textContent = data.apk;
        console.log("Connected to BGMI Backend Server successfully.");
        return;
      }
    }
  } catch (err) {
    console.warn("Backend server offline. Running in Client-Side Offline Fallback Mode.");
  }

  isBackendOnline = false;
  statsPlaystore.textContent = "Offline";
  statsApk.textContent = "Offline";
}

// 1. Interactive Tips Tab Filter
function initializeTipsFilter() {
  const tabs = document.querySelectorAll(".tab-btn");
  const panel = document.getElementById("tips-panel");

  // Load initial all tips
  loadTips("all");

  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      // Toggle active states
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const category = tab.getAttribute("data-category");
      loadTips(category);
    });
  });

  async function loadTips(category) {
    panel.innerHTML = '<div class="loading-spinner">Loading expert tips...</div>';
    
    let tips = [];
    if (isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE}/api/tips?category=${category}`);
        if (response.ok) {
          tips = await response.json();
        } else {
          throw new Error();
        }
      } catch (e) {
        tips = getOfflineTips(category);
      }
    } else {
      tips = getOfflineTips(category);
    }

    renderTips(tips);
  }

  function getOfflineTips(category) {
    if (category === "all") return FALLBACK_TIPS;
    return FALLBACK_TIPS.filter(t => t.category === category);
  }

  function renderTips(tipsList) {
    if (tipsList.length === 0) {
      panel.innerHTML = '<p class="muted text-center">No tips found in this category.</p>';
      return;
    }

    panel.innerHTML = tipsList.map(tip => `
      <div class="tip-item">
        <div class="tip-item-header">
          <h4 class="tip-title">${escapeHTML(tip.title)}</h4>
          <span class="tip-badge badge-${tip.category}">${escapeHTML(tip.category)}</span>
        </div>
        <p class="tip-content">${escapeHTML(tip.content)}</p>
      </div>
    `).join("");
  }
}

// 2. Active Redeem Codes
async function initializeRedeemCodes() {
  const container = document.getElementById("codes-container");
  
  let codes = [];
  if (isBackendOnline) {
    try {
      const response = await fetch(`${API_BASE}/api/codes`);
      if (response.ok) {
        codes = await response.json();
      } else {
        throw new Error();
      }
    } catch (e) {
      codes = FALLBACK_CODES;
    }
  } else {
    codes = FALLBACK_CODES;
  }

  renderCodes(codes);
}

function renderCodes(codesList) {
  const container = document.getElementById("codes-container");
  if (codesList.length === 0) {
    container.innerHTML = '<p class="muted text-center">No active codes at the moment. Check back later!</p>';
    return;
  }

  container.innerHTML = codesList.map(item => `
    <div class="code-card">
      <div class="code-details">
        <span class="code-string">${escapeHTML(item.code)}</span>
        <span class="code-reward">Reward: <strong>${escapeHTML(item.reward)}</strong></span>
        <span class="code-expiry">Expires: ${escapeHTML(item.expiry)}</span>
      </div>
      <div class="code-actions">
        <button class="btn-copy" data-code="${escapeHTML(item.code)}" aria-label="Copy code ${escapeHTML(item.code)}">
          Copy Code
        </button>
      </div>
    </div>
  `).join("");

  // Setup event listeners for copy buttons
  container.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.getAttribute("data-code");
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy Code";
          btn.classList.remove("copied");
        }, 2000);
      }).catch(err => {
        console.error("Failed to copy code", err);
      });
    });
  });
}

// 3. Device Settings Optimizer Form
function initializeOptimizer() {
  const form = document.getElementById("optimizer-form");
  const resultsDiv = document.getElementById("optimizer-results");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const ram = document.getElementById("ram-select").value;
    const soc = document.getElementById("soc-select").value;

    resultsDiv.innerHTML = '<div class="loading-spinner">Analyzing device capacity...</div>';

    let result = null;
    
    if (isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE}/api/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ram, soc })
        });
        if (response.ok) {
          result = await response.json();
        } else {
          throw new Error();
        }
      } catch (err) {
        result = getOfflineOptimization(ram, soc);
      }
    } else {
      result = getOfflineOptimization(ram, soc);
    }

    renderOptimizerResult(result);
  });

  // Client-side fallback analyzer
  function getOfflineOptimization(ram, soc) {
    const ramGb = parseInt(ram, 10);
    const processorTier = soc.toLowerCase();
    
    let graphics = 'Smooth';
    let fps = 'High (30 FPS)';
    let antiAliasing = 'Close';
    let shadows = 'Disabled';
    let style = 'Classic';
    let cameraSens = '110%';
    let adsSens = '110%';
    let gyroSens = '220%';
    let deviceTier = 'Offline Mode - Entry';
    let recommendations = [];

    if (ramGb >= 8 && processorTier === 'high') {
      deviceTier = 'Offline Mode - Flagship Beast';
      graphics = 'Smooth / Extreme HDR';
      fps = '90 FPS / 120 FPS';
      antiAliasing = '4x (Smooth)';
      shadows = 'Enabled (Ultra)';
      style = 'Colorful';
      cameraSens = '95%';
      adsSens = '90%';
      gyroSens = '320%';
      recommendations = [
        'Hardware supports 90/120 FPS. Verify screen refresh rate settings in OS.',
        'Enable high performance / gaming game-space overrides.',
        'Turn on 4x Anti-aliasing to refine cross-map tracking glides.'
      ];
    } else if (ramGb >= 6 && processorTier === 'high') {
      deviceTier = 'Offline Mode - High-End';
      graphics = 'Smooth / HDR';
      fps = 'Extreme (60 FPS)';
      antiAliasing = '2x';
      shadows = 'Enabled';
      style = 'Colorful';
      cameraSens = '100%';
      adsSens = '95%';
      gyroSens = '300%';
      recommendations = [
        'Smooth graphics ensures high frame stability in dense combat areas.',
        'Apply 2x anti-aliasing to clear distant resolution noise.',
        'Enable gyroscope settings to improve target retention.'
      ];
    } else if (ramGb >= 6 && processorTier === 'mid') {
      deviceTier = 'Offline Mode - Mid-Range';
      graphics = 'Smooth';
      fps = 'Extreme (60 FPS)';
      antiAliasing = 'Close';
      shadows = 'Disabled';
      style = 'Colorful';
      cameraSens = '105%';
      adsSens = '100%';
      gyroSens = '280%';
      recommendations = [
        'Set graphics level to Smooth to avoid heat buildup during dynamic matches.',
        'Keep shadows off to save essential memory buffers.',
        'Close other active apps to keep memory limits clean.'
      ];
    } else {
      deviceTier = 'Offline Mode - Budget / Basic';
      graphics = 'Smooth';
      fps = 'High (30 FPS)';
      antiAliasing = 'Close';
      shadows = 'Disabled';
      style = 'Classic';
      cameraSens = '120%';
      adsSens = '120%';
      gyroSens = '240%';
      recommendations = [
        'Graphics Smooth and High FPS provide optimal device performance.',
        'Reduce in-game audio parameters to lower processor overhead.',
        'Decline downloads of secondary content skins to conserve space.'
      ];
    }

    return {
      deviceTier,
      settings: { graphics, fps, antiAliasing, shadows, style },
      sensitivity: { camera: cameraSens, ads: adsSens, gyroscope: gyroSens },
      recommendations
    };
  }

  function renderOptimizerResult(data) {
    resultsDiv.innerHTML = `
      <div class="results-container">
        <div class="result-header">
          <h4>Config Recommendation</h4>
          <span class="tier-badge">${escapeHTML(data.deviceTier)}</span>
        </div>
        
        <div class="results-grid">
          <div class="result-card">
            <h5>Graphics Configuration</h5>
            <ul class="settings-list">
              <li><span>Graphics:</span> <span>${escapeHTML(data.settings.graphics)}</span></li>
              <li><span>Frame Rate:</span> <span>${escapeHTML(data.settings.fps)}</span></li>
              <li><span>Anti-Aliasing:</span> <span>${escapeHTML(data.settings.antiAliasing)}</span></li>
              <li><span>Shadows:</span> <span>${escapeHTML(data.settings.shadows)}</span></li>
              <li><span>Style:</span> <span>${escapeHTML(data.settings.style)}</span></li>
            </ul>
          </div>
          
          <div class="result-card">
            <h5>Recoil Sensitivity Maps</h5>
            <ul class="sens-list">
              <li><span>Camera:</span> <span>${escapeHTML(data.sensitivity.camera)}</span></li>
              <li><span>ADS Target:</span> <span>${escapeHTML(data.sensitivity.ads)}</span></li>
              <li><span>Gyroscope:</span> <span>${escapeHTML(data.sensitivity.gyroscope)}</span></li>
            </ul>
          </div>
        </div>

        <div class="rec-box">
          <h5>Hardware Tips</h5>
          <ul>
            ${data.recommendations.map(r => `<li>${escapeHTML(r)}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;
  }
}

// 4. Feedback Form Handler
function initializeFeedbackForm() {
  const form = document.getElementById("feedback-form");
  const statusDiv = document.getElementById("form-status");
  const btn = document.getElementById("feedback-submit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("fb-name").value;
    const email = document.getElementById("fb-email").value;
    const subject = document.getElementById("fb-subject").value;
    const message = document.getElementById("fb-message").value;

    btn.disabled = true;
    btn.textContent = "Sending Message...";
    statusDiv.className = "form-status";
    statusDiv.style.display = "none";

    if (isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          statusDiv.textContent = data.message;
          statusDiv.classList.add("success");
          form.reset();
        } else {
          throw new Error(data.error || "Failed to submit feedback.");
        }
      } catch (err) {
        showOfflineFeedbackStatus(name, email, subject, message);
      }
    } else {
      showOfflineFeedbackStatus(name, email, subject, message);
    }

    btn.disabled = false;
    btn.textContent = "Send Message";
  });

  function showOfflineFeedbackStatus(name, email, subject, message) {
    console.log("Feedback Form Submitted in Offline Mode:", { name, email, subject, message });
    statusDiv.innerHTML = `<strong>Offline Demo Mode Action:</strong> Message logged in browser log database. Set up backend servers to trigger database file writes.`;
    statusDiv.classList.add("success");
    form.reset();
  }
}

// 5. Download Click Routing and Trigger Redirect
function initializeDownloadLinks() {
  const actions = [
    { elementId: "hero-btn-playstore", type: "playstore", fallbackUrl: DEFAULT_PLAY_STORE_URL },
    { elementId: "hero-btn-apk", type: "apk", fallbackUrl: DEFAULT_APK_URL },
    { elementId: "card-btn-playstore", type: "playstore", fallbackUrl: DEFAULT_PLAY_STORE_URL },
    { elementId: "card-btn-apk", type: "apk", fallbackUrl: DEFAULT_APK_URL }
  ];

  actions.forEach(action => {
    const el = document.getElementById(action.elementId);
    if (!el) return;

    el.addEventListener("click", async () => {
      let targetUrl = action.fallbackUrl;

      if (isBackendOnline) {
        try {
          const response = await fetch(`${API_BASE}/api/downloads/${action.type}`, {
            method: "POST"
          });
          const data = await response.json();
          if (data && data.url) {
            targetUrl = data.url;
          }
        } catch (e) {
          console.warn("Error tracking download click, falling back to direct redirect.");
        }
      }

      // Perform statistics refresh and navigation
      setTimeout(() => {
        window.open(targetUrl, '_blank', 'noopener');
        checkBackendStatus(); // reload statistics badge
      }, 100);
    });
  });
}

// Utility to escape HTML and prevent XSS
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// 6. Lenis Smooth Scroll Initialization and Anchor Link Interception
function initializeSmoothScroll() {
  if (typeof Lenis === 'undefined') {
    console.warn("Lenis library not loaded. Falling back to native scrolling.");
    return;
  }

  // Initialize Lenis with smooth momentum settings
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth cubic deceleration
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1.0,
    smoothTouch: false, // Keep native touch scroll for best performance on mobile
    infinite: false,
  });

  // Setup standard RequestAnimationFrame loop for Lenis
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Smooth scroll to anchor links on the page (matching scroll-padding-top header offset)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      
      // Skip generic # or main accessibility link to let browser focus natively
      if (targetId === '#' || targetId === '#main') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Smoothly scroll to the element, accounting for the 90px header height offset
        lenis.scrollTo(targetElement, {
          offset: -90,
          duration: 1.2
        });
      }
    });
  });

  // Expose lenis globally in case other components require interaction control
  window.lenis = lenis;
}

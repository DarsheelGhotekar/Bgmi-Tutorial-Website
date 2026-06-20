const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(express.static(__dirname));

// Database helper functions
function readDb() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file:', err);
    return {
      tips: [],
      redeemCodes: [],
      downloadStats: { playstore: 0, apk: 0 },
      feedback: []
    };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing database file:', err);
    return false;
  }
}

// REST API Endpoints

// 1. Get pro-tips (optional filter by category)
app.get('/api/tips', (req, res) => {
  const db = readDb();
  const { category } = req.query;
  
  if (category && category !== 'all') {
    const filteredTips = db.tips.filter(tip => tip.category.toLowerCase() === category.toLowerCase());
    return res.json(filteredTips);
  }
  
  res.json(db.tips);
});

// 2. Get active redeem codes
app.get('/api/codes', (req, res) => {
  const db = readDb();
  // Filter active codes
  const activeCodes = db.redeemCodes.filter(code => code.status === 'Active');
  res.json(activeCodes);
});

// 3. Optimize graphics & sensitivity based on device specs
app.post('/api/optimize', (req, res) => {
  const { ram, soc } = req.body;
  
  if (!ram || !soc) {
    return res.status(400).json({ error: 'Please provide both RAM (GB) and Processor Tier (high, mid, low).' });
  }

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
  let deviceTier = 'Entry Level';
  let recommendations = [];

  if (ramGb >= 8 && processorTier === 'high') {
    deviceTier = 'Flagship Beast';
    graphics = 'Smooth / Extreme HDR';
    fps = '90 FPS / 120 FPS';
    antiAliasing = '4x (Smooth)';
    shadows = 'Enabled (Ultra)';
    style = 'Colorful';
    cameraSens = '95%';
    adsSens = '90%';
    gyroSens = '320%';
    recommendations = [
      'Your hardware supports 90/120 FPS. Make sure screen refresh rate is set to maximum in mobile settings.',
      'Enable High Performance mode / Gaming Space on your device.',
      'Use 4x Anti-aliasing to smooth out pixelated edges around long-range targets.'
    ];
  } else if (ramGb >= 6 && processorTier === 'high') {
    deviceTier = 'High-End Performance';
    graphics = 'Smooth / HDR';
    fps = 'Extreme (60 FPS)';
    antiAliasing = '2x';
    shadows = 'Enabled';
    style = 'Colorful';
    cameraSens = '100%';
    adsSens = '95%';
    gyroSens = '300%';
    recommendations = [
      'Use Smooth graphics to secure a stable 60 FPS in hot-drops and close-range combat.',
      'Turn on Anti-aliasing (2x) to clearly spot far-away gliders and snipers.',
      'Enable Gyroscope to control recoil effortlessly.'
    ];
  } else if (ramGb >= 6 && processorTier === 'mid') {
    deviceTier = 'Mid-Range Gaming';
    graphics = 'Smooth';
    fps = 'Extreme (60 FPS)';
    antiAliasing = 'Close';
    shadows = 'Disabled';
    style = 'Colorful';
    cameraSens = '105%';
    adsSens = '100%';
    gyroSens = '280%';
    recommendations = [
      'Set graphics to Smooth to prevent thermal throttling and battery drainage.',
      'Set Anti-aliasing to Close and disable shadows to boost average frame rates.',
      'Clear RAM before starting a match to avoid random screen freezes.'
    ];
  } else if (ramGb >= 4 && processorTier === 'mid') {
    deviceTier = 'Budget Gaming';
    graphics = 'Smooth';
    fps = 'Ultra (40 FPS)';
    antiAliasing = 'Close';
    shadows = 'Disabled';
    style = 'Classic';
    cameraSens = '115%';
    adsSens = '110%';
    gyroSens = '260%';
    recommendations = [
      'A stable 40 FPS is recommended for smooth tracking. Keep graphics on Smooth.',
      'Turn off background sync for social apps to save system bandwidth.',
      'Remove phone cover if device heats up during matches to avoid frame drops.'
    ];
  } else {
    deviceTier = 'Low-End / Battery Saver';
    graphics = 'Smooth';
    fps = 'High (30 FPS)';
    antiAliasing = 'Close';
    shadows = 'Disabled';
    style = 'Classic';
    cameraSens = '120%';
    adsSens = '120%';
    gyroSens = '240%';
    recommendations = [
      'Prioritize performance over looks. Play on Smooth/High FPS.',
      'Set Audio Quality to Low/Medium to reduce CPU load.',
      'Install the Low Spec resource pack in-game to conserve storage and RAM.'
    ];
  }

  res.json({
    deviceTier,
    settings: {
      graphics,
      fps,
      antiAliasing,
      shadows,
      style
    },
    sensitivity: {
      camera: cameraSens,
      ads: adsSens,
      gyroscope: gyroSens
    },
    recommendations
  });
});

// 4. Save feedback/contact message
app.post('/api/feedback', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide Name, Email, and Message.' });
  }

  const db = readDb();
  const newFeedback = {
    id: Date.now(),
    name,
    email,
    subject: subject || 'General Query',
    message,
    timestamp: new Date().toISOString()
  };

  db.feedback.push(newFeedback);
  const success = writeDb(db);

  if (success) {
    res.json({ success: true, message: 'Thank you for your message! Our team will get back to you.' });
  } else {
    res.status(500).json({ error: 'Failed to write to database.' });
  }
});

// 5. Get download link counts
app.get('/api/downloads', (req, res) => {
  const db = readDb();
  res.json(db.downloadStats);
});

// 6. Track click on download and return URL
app.post('/api/downloads/:type', (req, res) => {
  const { type } = req.params;
  const db = readDb();

  const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.pubg.imobile';
  const APK_DOWNLOAD_URL = 'https://www.battlegroundsmobileindia.com/'; // Redirects to direct APK download portal
  
  let targetUrl = PLAY_STORE_URL;

  if (type === 'playstore') {
    db.downloadStats.playstore = (db.downloadStats.playstore || 0) + 1;
    targetUrl = PLAY_STORE_URL;
  } else if (type === 'apk') {
    db.downloadStats.apk = (db.downloadStats.apk || 0) + 1;
    targetUrl = APK_DOWNLOAD_URL;
  } else {
    return res.status(400).json({ error: 'Invalid download type.' });
  }

  const success = writeDb(db);
  if (success) {
    res.json({ success: true, url: targetUrl });
  } else {
    res.json({ success: true, url: targetUrl, warning: 'Failed to update database stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`BGMI Server is running on http://localhost:${PORT}`);
});

// ==================== TIMEZONE DATA ====================
const TIMEZONES = [
    // Americas
    { name: 'New York', timezone: 'America/New_York', offset: 'UTC-5' },
    { name: 'Los Angeles', timezone: 'America/Los_Angeles', offset: 'UTC-8' },
    { name: 'Chicago', timezone: 'America/Chicago', offset: 'UTC-6' },
    { name: 'Denver', timezone: 'America/Denver', offset: 'UTC-7' },
    { name: 'Toronto', timezone: 'America/Toronto', offset: 'UTC-5' },
    { name: 'Mexico City', timezone: 'America/Mexico_City', offset: 'UTC-6' },
    { name: 'São Paulo', timezone: 'America/Sao_Paulo', offset: 'UTC-3' },
    { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', offset: 'UTC-3' },

    // Europe
    { name: 'London', timezone: 'Europe/London', offset: 'UTC+0' },
    { name: 'Paris', timezone: 'Europe/Paris', offset: 'UTC+1' },
    { name: 'Berlin', timezone: 'Europe/Berlin', offset: 'UTC+1' },
    { name: 'Amsterdam', timezone: 'Europe/Amsterdam', offset: 'UTC+1' },
    { name: 'Rome', timezone: 'Europe/Rome', offset: 'UTC+1' },
    { name: 'Madrid', timezone: 'Europe/Madrid', offset: 'UTC+1' },
    { name: 'Moscow', timezone: 'Europe/Moscow', offset: 'UTC+3' },
    { name: 'Istanbul', timezone: 'Europe/Istanbul', offset: 'UTC+3' },

    // Asia
    { name: 'Dubai', timezone: 'Asia/Dubai', offset: 'UTC+4' },
    { name: 'India', timezone: 'Asia/Kolkata', offset: 'UTC+5:30' },
    { name: 'Bangkok', timezone: 'Asia/Bangkok', offset: 'UTC+7' },
    { name: 'Singapore', timezone: 'Asia/Singapore', offset: 'UTC+8' },
    { name: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 'UTC+8' },
    { name: 'Tokyo', timezone: 'Asia/Tokyo', offset: 'UTC+9' },
    { name: 'Seoul', timezone: 'Asia/Seoul', offset: 'UTC+9' },
    { name: 'Shanghai', timezone: 'Asia/Shanghai', offset: 'UTC+8' },
    { name: 'Manila', timezone: 'Asia/Manila', offset: 'UTC+8' },

    // Australia & Pacific
    { name: 'Sydney', timezone: 'Australia/Sydney', offset: 'UTC+10' },
    { name: 'Melbourne', timezone: 'Australia/Melbourne', offset: 'UTC+10' },
    { name: 'Auckland', timezone: 'Pacific/Auckland', offset: 'UTC+12' },
    { name: 'Fiji', timezone: 'Pacific/Fiji', offset: 'UTC+12' },

    // Africa
    { name: 'Cairo', timezone: 'Africa/Cairo', offset: 'UTC+2' },
    { name: 'Johannesburg', timezone: 'Africa/Johannesburg', offset: 'UTC+2' },
    { name: 'Lagos', timezone: 'Africa/Lagos', offset: 'UTC+1' },
];

// ==================== GLOBAL STATE ====================
let clocks = [];
let is24HourFormat = localStorage.getItem('is24HourFormat') !== 'false';
let isDarkMode = localStorage.getItem('isDarkMode') !== 'false';

// ==================== DOM ELEMENTS ====================
const clocksGrid = document.getElementById('clocksGrid');
const emptyState = document.getElementById('emptyState');
const addClockBtn = document.getElementById('addClockBtn');
const resetBtn = document.getElementById('resetBtn');
const modal = document.getElementById('timezoneModal');
const closeBtn = document.querySelector('.close');
const timezoneSearch = document.getElementById('timezoneSearch');
const timezoneList = document.getElementById('timezoneList');
const format24Toggle = document.getElementById('format24Toggle');
const darkModeToggle = document.getElementById('darkModeToggle');
const totalClocksDisplay = document.getElementById('totalClocks');
const utcTimeDisplay = document.getElementById('utcTime');
const localTimeDisplay = document.getElementById('localTime');

// ==================== INITIALIZATION ====================
function init() {
    // Load saved clocks from localStorage
    const savedClocks = localStorage.getItem('clocks');
    if (savedClocks) {
        clocks = JSON.parse(savedClocks);
        renderClocks();
    } else {
        // Set default clocks
        setDefaultClocks();
    }

    // Set initial toggle states
    format24Toggle.checked = is24HourFormat;
    darkModeToggle.checked = isDarkMode;

    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Initialize timezone list
    populateTimezoneList(TIMEZONES);

    // Start updating time
    updateAllTimes();
    setInterval(updateAllTimes, 1000);

    // Event listeners
    addClockBtn.addEventListener('click', openModal);
    resetBtn.addEventListener('click', resetToDefault);
    closeBtn.addEventListener('click', closeModal);
    format24Toggle.addEventListener('change', toggleFormat);
    darkModeToggle.addEventListener('change', toggleDarkMode);
    timezoneSearch.addEventListener('input', filterTimezones);
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ==================== DEFAULT CLOCKS ====================
function setDefaultClocks() {
    clocks = [
        { name: 'New York', timezone: 'America/New_York' },
        { name: 'London', timezone: 'Europe/London' },
        { name: 'Tokyo', timezone: 'Asia/Tokyo' },
        { name: 'Sydney', timezone: 'Australia/Sydney' },
    ];
    saveClocks();
    renderClocks();
}

// ==================== LOCAL STORAGE ====================
function saveClocks() {
    localStorage.setItem('clocks', JSON.stringify(clocks));
}

function saveTzSettings(format, darkMode) {
    localStorage.setItem('is24HourFormat', format);
    localStorage.setItem('isDarkMode', darkMode);
}

// ==================== MODAL FUNCTIONS ====================
function openModal() {
    modal.classList.add('show');
    timezoneSearch.focus();
}

function closeModal() {
    modal.classList.remove('show');
    timezoneSearch.value = '';
    populateTimezoneList(TIMEZONES);
}

function populateTimezoneList(items) {
    timezoneList.innerHTML = '';
    items.forEach(tz => {
        const btn = document.createElement('button');
        btn.className = 'timezone-item';
        btn.innerHTML = `<div>${tz.name}</div><div style="font-size: 11px; opacity: 0.7;">${tz.offset}</div>`;
        btn.addEventListener('click', () => addTimezone(tz));
        timezoneList.appendChild(btn);
    });
}

function filterTimezones(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = TIMEZONES.filter(tz =>
        tz.name.toLowerCase().includes(searchTerm) ||
        tz.timezone.toLowerCase().includes(searchTerm) ||
        tz.offset.toLowerCase().includes(searchTerm)
    );
    populateTimezoneList(filtered);
}

function addTimezone(tzData) {
    // Check if already exists
    if (clocks.some(c => c.timezone === tzData.timezone)) {
        alert(`${tzData.name} is already added!`);
        return;
    }

    clocks.push({
        name: tzData.name,
        timezone: tzData.timezone,
        id: Date.now() // Unique ID for this clock instance
    });

    saveClocks();
    renderClocks();
    closeModal();
}

// ==================== RENDER CLOCKS ====================
function renderClocks() {
    clocksGrid.innerHTML = '';
    
    if (clocks.length === 0) {
        emptyState.classList.remove('hidden');
        totalClocksDisplay.textContent = '0';
        return;
    }

    emptyState.classList.add('hidden');
    totalClocksDisplay.textContent = clocks.length;

    clocks.forEach(clock => {
        const clockCard = createClockCard(clock);
        clocksGrid.appendChild(clockCard);
    });
}

function createClockCard(clock) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.id = `clock-${clock.id}`;

    const offset = getTimezoneOffset(clock.timezone);

    card.innerHTML = `
        <div class="timezone-name">${clock.timezone.replace('_', ' ')}</div>
        <div class="timezone-city">${clock.name}</div>
        <div class="digital-time" id="time-${clock.id}">00:00:00</div>
        <div class="time-period" id="period-${clock.id}">AM</div>
        <div class="offset-info">UTC Offset: ${offset}</div>
        <div class="clock-actions">
            <button class="clock-btn" onclick="copyTime('${clock.id}')">📋 Copy</button>
            <button class="clock-btn danger" onclick="removeClock(${clock.id})">🗑️ Remove</button>
        </div>
    `;

    return card;
}

// ==================== TIME FUNCTIONS ====================
function updateAllTimes() {
    clocks.forEach(clock => {
        updateClockTime(clock);
    });

    // Update UTC and Local times
    updateUTCTime();
    updateLocalTime();
}

function updateClockTime(clock) {
    const timeElement = document.getElementById(`time-${clock.id}`);
    const periodElement = document.getElementById(`period-${clock.id}`);

    if (!timeElement) return;

    try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: clock.timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24HourFormat
        });

        const parts = formatter.formatToParts(now);
        let hour = parts.find(p => p.type === 'hour').value;
        let minute = parts.find(p => p.type === 'minute').value;
        let second = parts.find(p => p.type === 'second').value;
        let period = parts.find(p => p.type === 'dayPeriod');

        // Format for 24-hour or 12-hour
        if (is24HourFormat) {
            const hourNum = parseInt(hour);
            hour = String(hourNum).padStart(2, '0');
            if (periodElement) periodElement.textContent = '';
        } else {
            if (periodElement) periodElement.textContent = period ? period.value : '';
        }

        const time = `${hour}:${minute}:${second}`;
        timeElement.textContent = time;
    } catch (error) {
        console.error(`Error updating time for ${clock.timezone}:`, error);
        timeElement.textContent = '--:--:--';
    }
}

function updateUTCTime() {
    const now = new Date();
    const utcHours = String(now.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(now.getUTCMinutes()).padStart(2, '0');
    const utcSeconds = String(now.getUTCSeconds()).padStart(2, '0');
    utcTimeDisplay.textContent = `${utcHours}:${utcMinutes}:${utcSeconds}`;
}

function updateLocalTime() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24HourFormat
    });

    const parts = formatter.formatToParts(now);
    let hour = parts.find(p => p.type === 'hour').value;
    let minute = parts.find(p => p.type === 'minute').value;
    let second = parts.find(p => p.type === 'second').value;

    if (is24HourFormat) {
        const hourNum = parseInt(hour);
        hour = String(hourNum).padStart(2, '0');
    }

    localTimeDisplay.textContent = `${hour}:${minute}:${second}`;
}

function getTimezoneOffset(timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short'
    });

    const parts = formatter.formatToParts(new Date());
    const timeZoneName = parts.find(p => p.type === 'timeZoneName');
    return timeZoneName ? timeZoneName.value : 'UTC';
}

// ==================== TOGGLE FUNCTIONS ====================
function toggleFormat() {
    is24HourFormat = format24Toggle.checked;
    saveTzSettings(is24HourFormat, isDarkMode);
    updateAllTimes();
}

function toggleDarkMode() {
    isDarkMode = darkModeToggle.checked;
    saveTzSettings(is24HourFormat, isDarkMode);

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ==================== CLOCK MANAGEMENT ====================
function removeClock(id) {
    if (confirm('Are you sure you want to remove this clock?')) {
        clocks = clocks.filter(c => c.id !== id);
        saveClocks();
        renderClocks();
    }
}

function copyTime(id) {
    const timeElement = document.getElementById(`time-${id}`);
    const time = timeElement.textContent;

    navigator.clipboard.writeText(time).then(() => {
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.background = '#10b981';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function resetToDefault() {
    if (confirm('This will reset all clocks to default. Continue?')) {
        clocks = [];
        saveClocks();
        setDefaultClocks();
    }
}

// ==================== START APPLICATION ====================
document.addEventListener('DOMContentLoaded', init);

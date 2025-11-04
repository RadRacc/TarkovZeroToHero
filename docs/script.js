// --- 1. INITIALIZATION AND DATA LOADING ---
const ROUBLES_KEY = 'eftZthRoubles';
const LICENSES_KEY = 'eftZthLicenses';

// Default starting values
let roubles = 0;
let licenses = 0;

// DOM Elements
const roublesDisplay = document.getElementById('roubles-display');
const licensesDisplay = document.getElementById('licenses-display');
const navButtons = document.querySelectorAll('.nav-btn');
const pageContents = document.querySelectorAll('.page-content');
const completeButtons = document.querySelectorAll('.complete-btn');
const saveButton = document.getElementById('save-btn');

function loadProgress() {
    // Load from browser's local storage or use default 0
    roubles = parseInt(localStorage.getItem(ROUBLES_KEY) || '0');
    licenses = parseInt(localStorage.getItem(LICENSES_KEY) || '0');
    updateDisplay();
}

function updateDisplay() {
    roublesDisplay.textContent = roubles.toLocaleString(); // Format with commas
    licensesDisplay.textContent = licenses.toLocaleString();
}

// --- 2. NAVIGATION LOGIC ---
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPageId = button.getAttribute('data-page');

        // Hide all pages
        pageContents.forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        });

        // Show the selected page
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
            targetPage.classList.remove('hidden-page');
        }
    });
});

// --- 3. TASK COMPLETION & CURRENCY TRACKING ---
completeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const rblReward = parseInt(button.getAttribute('data-reward-roubles') || '0');
        const licReward = parseInt(button.getAttribute('data-reward-licenses') || '0');

        // 1. Grant Rewards
        roubles += rblReward;
        licenses += licReward;

        // 2. Mark task as completed visually
        const taskCard = event.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.add('task-completed');
            // Optional: Remove button so it can't be clicked again
            event.target.remove(); 
        }

        // 3. Update the display and save
        updateDisplay();
        saveProgress();
    });
});

// --- 4. SAVING SYSTEM ---
function saveProgress() {
    localStorage.setItem(ROUBLES_KEY, roubles);
    localStorage.setItem(LICENSES_KEY, licenses);
    alert('Progress saved to your browser!'); // Simple confirmation
}

saveButton.addEventListener('click', saveProgress);

// Load progress when the page first loads
loadProgress();

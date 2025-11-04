// --- 1. INITIALIZATION AND DATA KEYS ---
const ROUBLES_KEY = 'eftZthRoubles';
const DEBT_KEY = 'eftZthDebt';
const TAXES_KEY = 'eftZthTaxes'; 

// Default starting values
let roubles = 0;
let debt = 0;
let taxesPaid = 0;

// DOM Elements
const roublesDisplay = document.getElementById('roubles-display');
const debtDisplay = document.getElementById('debt-display');
const taxesPaidDisplay = document.getElementById('taxes-paid-display'); 

const navButtons = document.querySelectorAll('.nav-btn');
const pageContents = document.querySelectorAll('.page-content');
const completeButtons = document.querySelectorAll('.complete-btn');
const saveButton = document.getElementById('save-btn');
const expandableCards = document.querySelectorAll('.task-card.expandable'); 

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    // Load from browser's local storage or use default 0
    roubles = parseInt(localStorage.getItem(ROUBLES_KEY) || '0');
    debt = parseInt(localStorage.getItem(DEBT_KEY) || '0');
    taxesPaid = parseInt(localStorage.getItem(TAXES_KEY) || '0');
    updateDisplay();
}

function updateDisplay() {
    // Format with commas for better readability
    roublesDisplay.textContent = roubles.toLocaleString(); 
    debtDisplay.textContent = debt.toLocaleString();
    taxesPaidDisplay.textContent = taxesPaid.toLocaleString();
}

function saveProgress() {
    localStorage.setItem(ROUBLES_KEY, roubles);
    localStorage.setItem(DEBT_KEY, debt);
    localStorage.setItem(TAXES_KEY, taxesPaid);
    console.log('Progress saved.'); 
    alert('Progress saved to your browser!');
}

// --- 3. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Stop the collapse action if the user clicks the "Mark as Complete" button
        if (event.target.classList.contains('complete-btn')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        // Toggle the visibility of the expanded section
        if (expandedView) {
            // Check current computed display style for reliable toggle
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'block' : 'none';
        }
    });
});

// --- 4. NAVIGATION LOGIC ---
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPageId = button.getAttribute('data-page');

        // Remove active class from all pages and buttons
        pageContents.forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        });

        // Show the selected page and set the button as active (optional styling needed)
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
            targetPage.classList.remove('hidden-page');
        }
    });
});

// --- 5. TASK COMPLETION & CURRENCY TRACKING ---
completeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const rblReward = parseInt(button.getAttribute('data-reward-roubles') || '0');
        
        // 1. Grant Roubles Reward
        roubles += rblReward;

        // 2. Mark task as completed visually
        const taskCard = event.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.add('task-completed');
            // Remove button so it can't be clicked again
            event.target.remove(); 
        }

        // 3. Update the display and save
        updateDisplay();
        saveProgress();
    });
});

// Attach save function to button
saveButton.addEventListener('click', saveProgress);

// Load progress when the page first loads
loadProgress();

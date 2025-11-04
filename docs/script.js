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
const completeButtons = document.querySelectorAll('.complete-btn');
const saveButton = document.getElementById('save-btn');
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const currencyActionButtons = document.querySelectorAll('.action-btn'); // NEW ELEMENT

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    // Load from browser's local storage or use default 0
    roubles = parseInt(localStorage.getItem(ROUBLES_KEY) || '0');
    debt = parseInt(localStorage.getItem(DEBT_KEY) || '0');
    taxesPaid = parseInt(localStorage.getItem(TAXES_KEY) || '0');
    updateDisplay();
}

function updateDisplay() {
    // Format with commas and include the ₽ symbol in the JS for consistency
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

// --- 3. CUSTOM CURRENCY ACTION LOGIC (NEW) ---
function handleCurrencyAction(event) {
    const currency = event.target.getAttribute('data-currency');
    const action = event.target.getAttribute('data-action');
    
    // Get the input element specific to the currency being acted upon
    const inputId = `${currency}-amount`;
    const inputElement = document.getElementById(inputId);
    
    // Get the value, convert it to an integer, and reset the field
    const amount = parseInt(inputElement.value || '0');
    inputElement.value = '';

    if (amount <= 0 || isNaN(amount)) {
        alert("Please enter a valid amount greater than 0.");
        return;
    }

    if (currency === 'roubles') {
        if (action === 'add') {
            roubles += amount;
        } else if (action === 'subtract') {
            // Prevent roubles from going below zero
            roubles = Math.max(0, roubles - amount); 
        }
    } else if (currency === 'debt') {
        // Debt INCREASES (bad) when 'add' is clicked, and DECREASES (good) when 'subtract' is clicked
        if (action === 'add') {
            debt += amount;
        } else if (action === 'subtract') {
            // Subtracting debt means repaying it. Prevent debt from going below zero.
            debt = Math.max(0, debt - amount); 
        }
    }

    updateDisplay();
    saveProgress();
}

// Attach the new action handler to all currency buttons
currencyActionButtons.forEach(button => {
    button.addEventListener('click', handleCurrencyAction);
});

// --- 4. EXPAND/COLLAPSE TASK LOGIC (NO CHANGES) ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        if (event.target.classList.contains('complete-btn') || event.target.closest('.currency-input-group')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'block' : 'none';
        }
    });
});

// --- 5. NAVIGATION & TASK COMPLETION (NO CHANGES) ---
// (Navigation logic is omitted here for brevity, but remains the same as your previous full file)
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        const targetPageId = button.getAttribute('data-page');
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active-page');
            page.classList.add('hidden-page');
        });
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.add('active-page');
            targetPage.classList.remove('hidden-page');
        }
    });
});

completeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const rblReward = parseInt(button.getAttribute('data-reward-roubles') || '0');
        roubles += rblReward;

        const taskCard = event.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.add('task-completed');
            event.target.remove(); 
        }

        updateDisplay();
        saveProgress();
    });
});

// Attach save function to button
saveButton.addEventListener('click', saveProgress);

// Load progress when the page first loads
loadProgress();

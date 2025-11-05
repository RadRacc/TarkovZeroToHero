// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 
const STAT_TRACKER_KEY = 'eftZthStatTracker'; 
const VIRTUAL_STASH_KEY = 'eftZthVirtualStash'; 
const HIDEOUT_KEY = 'eftZthHideoutPerks'; 
const HIDE_LOCKED_KEY = 'eftZthHideLocked'; // NEW KEY for the filter

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 
let statTracker = {}; 
let virtualStash = []; 
let hideoutPerks = {}; 
let hideLockedTasks = false; // NEW variable

// DOM Elements
let expandableCards = []; 
const traderFilter = document.getElementById('trader-filter');
const mapFilter = document.getElementById('map-filter'); 
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); 

// NEW DOM Elements
const tabButtons = document.querySelectorAll('#tab-navigation button');
const pages = document.querySelectorAll('.page-content');
const streakSurvivedBtn = document.getElementById('streak-survived');
const streakKiaBtn = document.getElementById('streak-kia');
const stashAddItemBtn = document.getElementById('add-stash-item');
const stashItemNameInput = document.getElementById('stash-item-name');
const stashItemCountInput = document.getElementById('stash-item-count');
const virtualStashList = document.getElementById('virtual-stash-list');
const calculateTaxBtn = document.getElementById('calculate-tax');
const inputBasePrice = document.getElementById('input-base-price');
const inputSellPrice = document.getElementById('input-sell-price');
const taxResults = document.getElementById('tax-results');
const hideLockedCheckbox = document.getElementById('hide-locked-tasks'); // NEW CHECKBOX

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    hideLockedTasks = JSON.parse(localStorage.getItem(HIDE_LOCKED_KEY) || 'false'); // LOAD NEW STATE

    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },    
        Ragman: { 1: false, 2: false, 3: false, 4: false },    
        Jaeger: { 1: false, 2: false, 3: false, 4: false }     
    };
    // NEW: Default stats object with tax variables
    const defaultStats = {
        roubles: 0,
        dollars: 0,
        euros: 0,
        streak: 0,
        salesTaxRate: 6, // New: Initial sales tax rate (2 to 10)
        survivalStreakMultiplier: 1 // New: Initial multiplier (0 to 2)
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); 
    statTracker = JSON.parse(localStorage.getItem(STAT_TRACKER_KEY) || JSON.stringify(defaultStats)); 
    virtualStash = JSON.parse(localStorage.getItem(VIRTUAL_STASH_KEY) || '[]'); 
    hideoutPerks = JSON.parse(localStorage.getItem(HIDEOUT_KEY) || '{}'); 

    // Sync LL checkboxes with loaded data
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
        const ll = checkbox.getAttribute('data-ll');
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        }
    });
    
    // Sync Hide Locked Tasks checkbox
    if (hideLockedCheckbox) {
        hideLockedCheckbox.checked = hideLockedTasks;
        hideLockedCheckbox.addEventListener('change', handleHideLockedToggle);
    }

    if (typeof TASKS_DATA === 'undefined') {
          tasksSection.innerHTML = '<h2>🎯 Task Progression</h2><p style="color:red;">FATAL ERROR: TASKS_DATA is missing. Ensure `tasksData.js` is loaded before `script.js` in your index.html file.</p>';
          console.error("FATAL ERROR: TASKS_DATA is undefined. Ensure tasksData.js is loaded before script.js.");
          return;
    }
    
    generateTaskCards();
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    addEventListeners(); 

    updateStatsDisplay(); 
    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); 
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); 
    localStorage.setItem(STAT_TRACKER_KEY, JSON.stringify(statTracker)); 
    localStorage.setItem(VIRTUAL_STASH_KEY, JSON.stringify(virtualStash)); 
    localStorage.setItem(HIDEOUT_KEY, JSON.stringify(hideoutPerks)); 
    localStorage.setItem(HIDE_LOCKED_KEY, JSON.stringify(hideLockedTasks)); // SAVE NEW STATE
    console.log('Task, objective, stats, and stash status saved.'); 
}

// --- NEW: HIDE LOCKED TASK HANDLER ---
function handleHideLockedToggle(event) {
    hideLockedTasks = event.target.checked;
    saveProgress();
    filterTasks();
}

// (generateTaskCards and helper functions remain the same)

function addEventListeners() {
    // LL Tracker (already on static elements)
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLToggle);
    });
    
    // Filters and Search (already on static elements)
    traderFilter.addEventListener('change', filterTasks);
    mapFilter.addEventListener('change', filterTasks); 
    taskSearch.addEventListener('keyup', filterTasks);
    // Hide Locked Tasks checkbox listener is added in loadProgress

    // NEW: Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabToggle);
    });
    
    // NEW: Stats Tracker Buttons
    if (streakSurvivedBtn) streakSurvivedBtn.addEventListener('click', () => handleStreakButton('survived'));
    if (streakKiaBtn) streakKiaBtn.addEventListener('click', () => handleStreakButton('kia'));

    // NEW: Stash Buttons
    if (stashAddItemBtn) stashAddItemBtn.addEventListener('click', handleAddItem);

    // NEW: Tax Calculator Button
    if (calculateTaxBtn) calculateTaxBtn.addEventListener('click', calculateFleaTax);

    // Buttons and Task Clicks (on dynamically created elements)
    document.querySelectorAll('.task-toggle-btn').forEach(button => {
        button.addEventListener('click', handleTaskToggle);
    });
    document.querySelectorAll('.quick-slot-btn').forEach(button => {
        button.addEventListener('click', handleQuickSlotToggle);
    });
    document.querySelectorAll('.guide-toggle-btn').forEach(button => { 
        button.addEventListener('click', handleGuideToggle);
    });
    
    // Expand/Collapse Listener (Re-attaching to new cards)
    document.querySelectorAll('.task-card.expandable').forEach(card => {
        card.addEventListener('click', (event) => {
            // Check if the click target is any interactive element
            if (event.target.classList.contains('task-toggle-btn') || 
                event.target.closest('.task-toggle-btn') || 
                event.target.closest('.quick-slot-btn') || 
                event.target.closest('.guide-toggle-btn') || 
                event.target.type === 'checkbox' || 
                event.target.closest('.objective-item') || 
                event.target.closest('.collapsed-requirements')) {
                return;
            }

            const expandedView = card.querySelector('.expanded-view');
            
            if (expandedView) {
                const isHidden = window.getComputedStyle(expandedView).display === 'none';
                // Only allow expansion if the task is not hidden by the 'hide locked' filter
                if (card.style.display !== 'none') {
                    expandedView.style.display = isHidden ? 'grid' : 'none'; 
                }
            }
        });
    });
}

// (handleLLToggle and checkRequirementsAndGenerateList remain the same)

// --- FILTERING AND SEARCHING LOGIC (UPDATED) ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const selectedMap = mapFilter.value; 
    const searchTerm = taskSearch.value.toLowerCase().trim();

    const currentCards = document.querySelectorAll('.task-card.expandable'); 

    currentCards.forEach(card => {
        const isLocked = card.classList.contains('task-locked');

        // 1. HIDE LOCKED TASKS LOGIC
        if (hideLockedTasks && isLocked) {
            card.style.display = 'none';
            return; // Skip other checks if hidden by the locked filter
        }
        
        // 2. Apply Filters (Trader/Map/Search)
        const trader = card.getAttribute('data-trader');
        const map = card.getAttribute('data-map'); 
        
        const titleElement = card.querySelector('.task-title');
        const objectiveElement = card.querySelector('.task-objective');

        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const objective = objectiveElement ? objectiveElement.textContent.toLowerCase() : '';

        let matchesTrader = (selectedTrader === 'all' || trader === selectedTrader);
        let matchesMap = (selectedMap === 'all' || map === selectedMap || map === 'Any'); 
        let matchesSearch = true;

        if (searchTerm.length > 0) {
            matchesSearch = title.includes(searchTerm) || objective.includes(searchTerm);
        }

        if (matchesTrader && matchesMap && matchesSearch) { 
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// (updateTaskStatus and updateAllTaskStatuses remain the same)

// (handleTaskToggle and handleQuickSlotToggle remain the same)

// (sortTasks remains the same)

// --- STATS TRACKER LOGIC (UPDATED with new tax mechanics) ---

function updateStatsDisplay() {
    document.getElementById('stat-roubles').textContent = statTracker.roubles.toLocaleString();
    document.getElementById('stat-dollars').textContent = statTracker.dollars.toLocaleString();
    document.getElementById('stat-euros').textContent = statTracker.euros.toLocaleString();
    document.getElementById('streak-count').textContent = statTracker.streak;
    
    // NEW: Update Sales Tax Rate Display
    const salesTaxRateElement = document.getElementById('current-sales-tax-rate');
    if (salesTaxRateElement) {
        salesTaxRateElement.textContent = `${statTracker.salesTaxRate.toFixed(2)}% (x${statTracker.survivalStreakMultiplier.toFixed(1)} multiplier)`;
    }
}

function handleStreakButton(result) {
    if (result === 'survived') {
        statTracker.streak += 1;
        
        // Decrease sales tax by 0.5 * multiplier (min 2)
        const taxDecrease = 0.5 * statTracker.survivalStreakMultiplier;
        statTracker.salesTaxRate = Math.max(2, statTracker.salesTaxRate - taxDecrease);
        
        // Increase multiplier by 0.1 (max 2)
        statTracker.survivalStreakMultiplier = Math.min(2, statTracker.survivalStreakMultiplier + 0.1);

    } else if (result === 'kia') {
        
        // Increase sales tax by 1 * multiplier (max 10)
        const taxIncrease = 1 * statTracker.survivalStreakMultiplier;
        statTracker.salesTaxRate = Math.min(10, statTracker.salesTaxRate + taxIncrease);
        
        // Reset multiplier and streak
        statTracker.survivalStreakMultiplier = 0;
        statTracker.streak = 0;
    }
    
    // Ensure tax rate is rounded for display/storage
    statTracker.salesTaxRate = Math.round(statTracker.salesTaxRate * 100) / 100;

    updateStatsDisplay();
    saveProgress();
}


// (Virtual Stash logic remains the same)


// --- TAX CALCULATOR LOGIC (UPDATED with new tax tiers) ---

function calculateFleaTax() {
    const V = parseFloat(inputBasePrice.value); // Item Base Price (V) - not used in new formula
    const P = parseFloat(inputSellPrice.value); // Proposed Sale Price (P)
    
    if (isNaN(P) || P <= 0) {
        taxResults.innerHTML = '<p style="color:red;">Please enter a valid positive Sale Price (P).</p>';
        return;
    }
    
    // 1. Calculate SALES TAX
    const salesTaxRate = statTracker.salesTaxRate / 100;
    const salesTaxAmount = P * salesTaxRate;
    const incomeBeforeIncomeTax = P - salesTaxAmount;
    
    // 2. Determine INCOME TAX TIER
    let incomeTaxRate = 0;
    
    if (incomeBeforeIncomeTax <= 100000) {
        incomeTaxRate = 0.65; // 65%
    } else if (incomeBeforeIncomeTax <= 200000) {
        incomeTaxRate = 0.75; // 75%
    } else if (incomeBeforeIncomeTax <= 400000) {
        incomeTaxRate = 0.80; // 80%
    } else if (incomeBeforeIncomeTax <= 800000) {
        incomeTaxRate = 0.85; // 85%
    } else {
        incomeTaxRate = 0.90; // 90%
    }
    
    // 3. Calculate INCOME TAX and FINAL PROFIT
    const incomeTaxAmount = incomeBeforeIncomeTax * incomeTaxRate;
    const netProfit = incomeBeforeIncomeTax - incomeTaxAmount;
    
    taxResults.innerHTML = `
        <p>Sale Price (P): <span class="currency-rouble">${P.toLocaleString()}₽</span></p>
        <p>Dynamic Sales Fee (${(salesTaxRate * 100).toFixed(2)}%): <span class="currency-rouble">- ${Math.round(salesTaxAmount).toLocaleString()}₽</span></p>
        <p>Income Before Tax: <span class="currency-rouble">${Math.round(incomeBeforeIncomeTax).toLocaleString()}₽</span></p>
        <hr style="border-color:#444;">
        <p>Income Tax (${(incomeTaxRate * 100).toFixed(0)}%): <span class="currency-rouble">- ${Math.round(incomeTaxAmount).toLocaleString()}₽</span></p>
        <p class="result-net">Net Profit (Take Home): <span class="currency-rouble">${Math.round(netProfit).toLocaleString()}₽</span></p>
    `;
}


// Load progress when the page first loads
loadProgress();

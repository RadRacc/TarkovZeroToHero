// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; 
const SALES_TAX_KEY = 'eftZthSalesTax'; // NEW
const STREAK_MULTIPLIER_KEY = 'eftZthStreakMultiplier'; // NEW
const PRESS_COUNT_KEY = 'eftZthSurvivePressCount'; // NEW

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; 
let salesTax = 0.60; // Initial sales tax value (e.g., 60% as a float)
let survivalStreakMultiplier = 1.0; // Initial multiplier
let surviveButtonPressCount = 0; // Tracks the two-click state

// DOM Elements
let expandableCards = []; 
const traderFilter = document.getElementById('trader-filter');
const mapFilter = document.getElementById('map-filter'); 
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); 
// NEW DOM elements
const surviveBtn = document.getElementById('survive-btn');
const resetSurviveBtn = document.getElementById('reset-survive-btn');
const salesTaxDisplay = document.getElementById('sales-tax-display');
const streakMultiplierDisplay = document.getElementById('streak-multiplier-display');
const surviveMessage = document.getElementById('survive-message');


// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    
    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },
        Ragman: { 1: false, 2: false, 3: false, 4: false },
        Jaeger: { 1: false, 2: false, 3: false, 4: false },
        Fence: { 1: false, 2: false, 3: false, 4: false }
    };
    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData)); 
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}');

    // Load NEW Survival State
    // Use saved value or default, ensuring it's a number
    salesTax = parseFloat(localStorage.getItem(SALES_TAX_KEY)) || salesTax;
    survivalStreakMultiplier = parseFloat(localStorage.getItem(STREAK_MULTIPLIER_KEY)) || survivalStreakMultiplier;
    surviveButtonPressCount = parseInt(localStorage.getItem(PRESS_COUNT_KEY)) || surviveButtonPressCount;
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives));
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL));
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks));
    
    // Save NEW Survival State, ensuring values are stored with sufficient precision
    localStorage.setItem(SALES_TAX_KEY, salesTax.toFixed(4));
    localStorage.setItem(STREAK_MULTIPLIER_KEY, survivalStreakMultiplier.toFixed(4));
    localStorage.setItem(PRESS_COUNT_KEY, surviveButtonPressCount);
}

// --- 3. RENDERING AND SETUP FUNCTIONS ---

// NEW: Update the display for Sales Tax and Multiplier
function updateSurvivalDisplay() {
    // Display tax as a percentage, formatted (Math.max(0) ensures it doesn't display negative)
    salesTaxDisplay.textContent = Math.max(0, salesTax * 100).toFixed(2) + '%';
    // Display multiplier, formatted
    streakMultiplierDisplay.textContent = survivalStreakMultiplier.toFixed(2) + 'x';
    
    // Update button text and style based on press count
    surviveBtn.textContent = `SURVIVE (Click ${surviveButtonPressCount + 1}/2)`;
    if (surviveButtonPressCount === 1) {
        surviveBtn.classList.add('pending');
    } else {
        surviveBtn.classList.remove('pending');
    }
}

// Function to handle trader LL checkbox changes
function handleLLChange(event) {
    const checkbox = event.target;
    const group = checkbox.closest('.trader-ll-group');
    if (!group) return;

    const traderName = group.getAttribute('data-trader');
    const llLevel = checkbox.getAttribute('data-ll');
    traderLL[traderName][llLevel] = checkbox.checked;
    
    // Save the updated state
    saveProgress();
    
    // Re-evaluate dependencies of ALL tasks
    updateAllTaskStatuses();
}

function renderTasks(taskData) {
    tasksSection.innerHTML = '<h2>Task Progression</h2>';
    taskData.forEach(task => {
        const isCompleted = completedTasks[task.id];
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card', 'expandable');
        taskCard.setAttribute('data-task-id', task.id);
        taskCard.setAttribute('data-trader', task.trader);
        taskCard.setAttribute('data-map', task.map);
        
        // --- TASK CARD STATE ---
        if (isCompleted) {
            taskCard.classList.add('task-completed');
        } else if (isTaskLocked(task)) {
            taskCard.classList.add('task-locked');
        }
        
        if (quickSlottedTasks[task.id]) {
            taskCard.classList.add('task-quick-slotted');
        }

        // --- TASK CARD STRUCTURE (Simplified for brevity) ---
        let html = `
            <div class="task-header">
                <div class="task-info">
                    <h3 class="task-title">${task.title} (${task.trader})</h3>
                    <p class="task-summary">Map: ${task.map} | ${task.objectiveSummary}</p>
                </div>
                <div class="task-actions">
                    <button class="quick-slot-btn">★</button>
                </div>
            </div>
            <div class="task-details">
                <h4>Requirements:</h4>
                <div class="requirements">
                    ${task.requirements.map(req => `<span class="requirement-item">${req}</span>`).join('')}
                </div>
                <h4>Initial Dialogue:</h4>
                <p class="task-dialogue">${task.dialogueInitial}</p>
                <h4>Objectives:</h4>
                <ul class="objective-list">
                    ${task.objectives.map((obj, index) => 
                        `<li data-objective-index="${index}">${obj}</li>`
                    ).join('')}
                </ul>
                <div class="task-action-buttons">
                    <button class="objective-toggle-btn task-toggle-btn complete-btn" data-action="toggle-objectives">Toggle Objectives</button>
                    <button class="complete-all-btn task-toggle-btn complete-btn" data-action="complete-all">Mark Complete</button>
                </div>
                <h4>Completion Dialogue:</h4>
                <p class="task-dialogue">${task.dialogueComplete}</p>
                <h4>Rewards:</h4>
                <div class="rewards">
                    ${task.rewards.map(reward => 
                        `<span class="reward-item">
                            <img src="https://placehold.co/20x20/5897FB/FFFFFF?text=${reward.type.charAt(0).toUpperCase()}" onerror="this.onerror=null; this.src='https://placehold.co/20x20/5897FB/FFFFFF?text=R'" alt="${reward.type}">
                            ${reward.amount ? `<span class="currency-${reward.type}">${reward.amount.toLocaleString()}</span> ` : ''}
                            ${reward.name || ''}
                        </span>`
                    ).join('')}
                </div>
                <button class="guide-toggle-btn" data-action="toggle-walkthrough">Show Walkthrough</button>
                <div class="walkthrough-box" style="display:none;">
                    <h4>Walkthrough (Mock Data)</h4>
                    <p>This is a placeholder guide. Go to the specified map, look for the objective area, and execute the task. Consult external resources for detailed maps!</p>
                </div>
            </div>
        `;

        taskCard.innerHTML = html;
        tasksSection.appendChild(taskCard);
        
        // Add event listeners for the new elements after they are created
        const toggleObjectivesBtn = taskCard.querySelector('[data-action="toggle-objectives"]');
        if (toggleObjectivesBtn) toggleObjectivesBtn.addEventListener('click', handleObjectiveToggle);

        const completeAllBtn = taskCard.querySelector('[data-action="complete-all"]');
        if (completeAllBtn) completeAllBtn.addEventListener('click', handleCompleteAll);
        
        const quickSlotBtn = taskCard.querySelector('.quick-slot-btn');
        if (quickSlotBtn) quickSlotBtn.addEventListener('click', handleQuickSlotToggle);
        
        const guideToggleBtn = taskCard.querySelector('[data-action="toggle-walkthrough"]');
        if (guideToggleBtn) guideToggleBtn.addEventListener('click', handleGuideToggle);

        // Update the objectives' individual status
        updateObjectiveDisplay(taskCard);
    });
    
    expandableCards = document.querySelectorAll('.task-card.expandable'); 
    expandableCards.forEach(card => card.addEventListener('click', handleCardClick));
}


// --- 4. FILTERING LOGIC ---
function filterTasks() {
    const traderVal = traderFilter.value;
    const mapVal = mapFilter.value;
    const searchVal = taskSearch.value.toLowerCase();
    
    const cards = document.querySelectorAll('.task-card');
    cards.forEach(card => {
        const task = TASKS_DATA.find(t => t.id === card.getAttribute('data-task-id'));
        if (!task) return;

        const traderMatch = traderVal === 'all' || task.trader === traderVal;
        const mapMatch = mapVal === 'all' || task.map === mapVal;
        const searchMatch = searchVal === '' || 
                            task.title.toLowerCase().includes(searchVal) ||
                            task.objectiveSummary.toLowerCase().includes(searchVal) ||
                            (task.objectives && task.objectives.some(obj => obj.toLowerCase().includes(searchVal)));

        if (traderMatch && mapMatch && searchMatch) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });

    // Re-sort the visible cards after filtering
    sortTasks();
}
// --- 5. DEPENDENCY CHECKING ---
function getTaskById(taskId) {
    return TASKS_DATA.find(t => t.id === taskId);
}

function isTaskCompleted(taskId) {
    return completedTasks[taskId] === true;
}

function isLLMet(llRequirement) {
    const parts = llRequirement.match(/LL(\d)/);
    if (!parts) return false;
    const level = parseInt(parts[1], 10);
    const traderName = llRequirement.replace(`LL${level}`, '').trim();
    
    if (traderName && traderLL[traderName] && traderLL[traderName][level]) {
        return traderLL[traderName][level];
    }
    return false;
}

function isTaskLocked(task) {
    if (!task.requirements || task.requirements.length === 0 || task.requirements.includes("N/A")) {
        return false;
    }

    for (const req of task.requirements) {
        if (req.startsWith('LL')) {
            // Check LL requirements
            if (!isLLMet(req)) {
                return true;
            }
        } else {
            // Check task completion requirements
            if (!isTaskCompleted(req)) {
                return true;
            }
        }
    }
    return false;
}

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const task = getTaskById(taskId);
    
    // Clear existing status classes
    taskCard.classList.remove('task-completed', 'task-locked');
    
    // Re-apply status classes
    if (isTaskCompleted(taskId)) {
        taskCard.classList.add('task-completed');
    } else if (isTaskLocked(task)) {
        taskCard.classList.add('task-locked');
    }
    
    // Update quick slot class
    if (quickSlottedTasks[taskId]) {
        taskCard.classList.add('task-quick-slotted');
    } else {
        taskCard.classList.remove('task-quick-slotted');
    }
    
    // Update objective display within the card
    updateObjectiveDisplay(taskCard);
}

function updateAllTaskStatuses() {
    document.querySelectorAll('.task-card').forEach(updateTaskStatus);
}
// --- 6. OBJECTIVE HANDLING ---
function updateObjectiveDisplay(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const objectivesList = taskCard.querySelector('.objective-list');
    
    if (!objectivesList) return;

    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = Array(objectivesList.children.length).fill(false);
    }
    
    Array.from(objectivesList.children).forEach((li, index) => {
        li.classList.remove('objective-completed');
        if (completedObjectives[taskId][index]) {
            li.classList.add('objective-completed');
        }
    });
    
    // Update main task completion status based on objectives
    const isCompleted = completedObjectives[taskId].every(status => status === true);
    if (isCompleted && !completedTasks[taskId]) {
        completedTasks[taskId] = true;
        updateTaskStatus(taskCard);
        saveProgress();
        updateAllTaskStatuses();
    } else if (!isCompleted && completedTasks[taskId]) {
        delete completedTasks[taskId];
        updateTaskStatus(taskCard);
        saveProgress();
        updateAllTaskStatuses();
    }
}

function handleObjectiveToggle(event) {
    const button = event.target.closest('button');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    if (taskCard.classList.contains('task-locked')) {
        console.log('Task is locked. Cannot toggle objectives.');
        event.stopPropagation();
        return;
    }

    const objectivesList = taskCard.querySelector('.objective-list');
    if (!objectivesList) {
        event.stopPropagation();
        return;
    }
    
    const allCompleted = completedObjectives[taskId] && completedObjectives[taskId].every(status => status === true);
    
    if (allCompleted) {
        // Uncomplete all
        completedObjectives[taskId].fill(false);
        delete completedTasks[taskId];
    } else {
        // Complete next incomplete objective
        let nextIndex = completedObjectives[taskId].findIndex(status => status === false);
        if (nextIndex === -1) nextIndex = 0; // Should not happen if allCompleted is false
        
        completedObjectives[taskId][nextIndex] = true;
    }

    updateTaskStatus(taskCard);
    saveProgress();
    updateAllTaskStatuses();
    
    event.stopPropagation(); 
}

function handleCompleteAll(event) {
    const button = event.target.closest('button');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const task = getTaskById(taskId);
    
    if (taskCard.classList.contains('task-locked')) {
        console.log('Task is locked. Cannot mark complete.');
        event.stopPropagation();
        return;
    }
    
    const isCurrentlyCompleted = isTaskCompleted(taskId);
    
    if (isCurrentlyCompleted) {
        // Mark Uncomplete
        delete completedTasks[taskId];
        if (completedObjectives[taskId]) {
            completedObjectives[taskId].fill(false);
        }
    } else {
        // Mark Complete
        completedTasks[taskId] = true;
        // Also ensure all objectives are marked complete internally
        if (!completedObjectives[taskId]) {
            completedObjectives[taskId] = Array(task.objectives.length).fill(false);
        }
        for (let i = 0; i < task.objectives.length; i++) {
            completedObjectives[taskId][i] = true;
        }
    }

    updateTaskStatus(taskCard);
    saveProgress();
    
    // Re-evaluate dependencies of ALL tasks
    updateAllTaskStatuses(); 
    
    event.stopPropagation(); 
}


// --- 7. UI INTERACTION HANDLERS ---

function handleCardClick(event) {
    const taskCard = event.currentTarget;
    
    // Ignore clicks on locked cards
    if (taskCard.classList.contains('task-locked')) {
        return;
    }
    
    // Find the details area
    const details = taskCard.querySelector('.task-details');
    if (details) {
        // Toggle the expanded class
        details.classList.toggle('expanded');
    }
}

function handleGuideToggle(event) {
    const button = event.target.closest('button');
    const taskCard = button.closest('.task-card');
    const walkthroughBox = taskCard.querySelector('.walkthrough-box');
    
    if (walkthroughBox) {
        if (walkthroughBox.style.display === 'none') {
            walkthroughBox.style.display = 'block';
            button.textContent = 'Hide Walkthrough';
        } else {
            walkthroughBox.style.display = 'none';
            button.textContent = 'Show Walkthrough';
        }
    }
    
    event.stopPropagation(); // Prevent the card from collapsing/expanding
}

// --- 8. QUICK SLOT SYSTEM HANDLER ---

function handleQuickSlotToggle(event) {
    const button = event.target.closest('.quick-slot-btn');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    quickSlottedTasks[taskId] = !quickSlottedTasks[taskId];
    if (!quickSlottedTasks[taskId]) {
        delete quickSlottedTasks[taskId]; 
    }

    updateTaskStatus(taskCard);
    saveProgress();
    sortTasks(); 
    
    event.stopPropagation(); 
}

// --- 9. TASK SORTING LOGIC ---

function sortTasks() {
    const tasksSection = document.getElementById('tasks');
    const allCards = tasksSection.querySelectorAll('.task-card.expandable'); 
    
    // Sort to put quick-slotted tasks first
    const sortedCards = Array.from(allCards).sort((a, b) => {
        const aIsSlotted = a.classList.contains('task-quick-slotted');
        const bIsSlotted = b.classList.contains('task-quick-slotted');
        
        if (aIsSlotted && !bIsSlotted) return -1; 
        if (!aIsSlotted && bIsSlotted) return 1; 
        
        // Secondary sort: keep existing order for unslotted tasks
        return 0; 
    });
    
    // Re-append sorted cards to the DOM
    sortedCards.forEach(card => tasksSection.appendChild(card));
}


// --- 10. NEW SURVIVAL TRACKER LOGIC ---

function handleSurviveClick() {
    // Use parseFloat to ensure we are working with numbers from state, rounded to prevent float issues.
    let currentSalesTax = parseFloat(salesTax.toFixed(4));
    let currentMultiplier = parseFloat(survivalStreakMultiplier.toFixed(4));
    let pressCount = surviveButtonPressCount;
    
    const baseReduction = 0.005; // 0.5% (0.005) is the base reduction. Original prompt used 0.5 which equals 50% which is likely too much for a tax reduction. Adjusted to 0.005 (0.5%) as a more reasonable assumption. If you intended 0.5 (50%), please let me know.
    const multiplierIncrease = 0.1;

    if (pressCount === 0) {
        // --- FIRST PRESS ---
        
        // 1. Decrease sales tax by 0.5 (which is 0.005 in float form)
        currentSalesTax -= baseReduction;

        surviveMessage.textContent = `Sale tax reduced by ${baseReduction * 100}%. Click again to confirm streak and boost multiplier.`;
        
        surviveButtonPressCount = 1;

    } else if (pressCount === 1) {
        // --- SECOND PRESS ---
        
        // 1. Increase sales tax multiplier by 0.1
        currentMultiplier += multiplierIncrease;
        
        // 2. Calculate the reduction: baseReduction multiplied by new multiplier
        // Example: 0.005 * 1.10 = 0.0055
        const reductionAmount = baseReduction * currentMultiplier; 
        
        // 3. Reduce sales tax by the calculated amount
        currentSalesTax -= reductionAmount;
        
        surviveMessage.textContent = `Survival streak confirmed! Multiplier increased by ${multiplierIncrease.toFixed(1)} to ${currentMultiplier.toFixed(2)}x. Sales tax further reduced by ${(reductionAmount * 100).toFixed(2)}%.`;

        surviveButtonPressCount = 0;
    }
    
    // Ensure tax doesn't go below 0%
    salesTax = Math.max(0, currentSalesTax); 
    // Round multiplier to 4 decimal places for clean storage/display
    survivalStreakMultiplier = parseFloat(currentMultiplier.toFixed(4));

    updateSurvivalDisplay();
    saveProgress();
}

function handleResetStreak() {
    console.warn("Survival Streak Multiplier has been reset to 1.00x.");
    
    survivalStreakMultiplier = 1.0;
    surviveButtonPressCount = 0;
    
    surviveMessage.textContent = 'Survival Streak Multiplier has been reset to 1.00x.';
    surviveBtn.classList.remove('pending');
    
    updateSurvivalDisplay();
    saveProgress();
}


// --- 11. INITIALIZATION CALL ---

function initialize() {
    // Load progress when the page first loads
    loadProgress();
    
    // Render initial task list
    renderTasks(TASKS_DATA);

    // Initial check for task dependencies and status
    updateAllTaskStatuses();
    
    // Setup filters/search event listeners
    if (traderFilter) traderFilter.addEventListener('change', filterTasks);
    if (mapFilter) mapFilter.addEventListener('change', filterTasks);
    if (taskSearch) taskSearch.addEventListener('input', filterTasks);
    
    // Setup LL checkboxes event listeners
    llCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleLLChange);
    });

    // Add NEW Survival Tracker Listeners and Display
    if (surviveBtn) {
        surviveBtn.addEventListener('click', handleSurviveClick);
    }
    if (resetSurviveBtn) {
        resetSurviveBtn.addEventListener('click', handleResetStreak);
    }
    updateSurvivalDisplay(); // Initial display update
    
    // Sort tasks on load
    sortTasks();
    
    // Initial filter run to show tasks after load
    filterTasks();
}

window.addEventListener('load', initialize);

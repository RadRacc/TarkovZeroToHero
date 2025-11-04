// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 
const QUICK_SLOT_KEY = 'eftZthQuickSlotTasks'; // <-- NEW KEY

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 
let quickSlottedTasks = {}; // <-- NEW DATA STRUCTURE

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const traderFilter = document.getElementById('trader-filter');
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');
const tasksSection = document.getElementById('tasks'); // <-- New reference for sorting

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 
    
    // Initialize all 7 traders in the default data structure (FIXED)
    const defaultData = { 
        Prapor: { 1: false, 2: false, 3: false, 4: false }, 
        Skier: { 1: false, 2: false, 3: false, 4: false },
        Therapist: { 1: false, 2: false, 3: false, 4: false },
        Peacekeeper: { 1: false, 2: false, 3: false, 4: false },
        Mechanic: { 1: false, 2: false, 3: false, 4: false },    
        Ragman: { 1: false, 2: false, 3: false, 4: false },    
        Jaeger: { 1: false, 2: false, 3: false, 4: false }      
    };

    traderLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || JSON.stringify(defaultData));
    quickSlottedTasks = JSON.parse(localStorage.getItem(QUICK_SLOT_KEY) || '{}'); // <-- NEW LOAD

    // Ensure newly added traders exist if old data was loaded (FIXED)
    const defaultLL = { 1: false, 2: false, 3: false, 4: false };
    if (!traderLL.Peacekeeper) traderLL.Peacekeeper = {...defaultLL};
    if (!traderLL.Mechanic) traderLL.Mechanic = {...defaultLL};
    if (!traderLL.Ragman) traderLL.Ragman = {...defaultLL};
    if (!traderLL.Jaeger) traderLL.Jaeger = {...defaultLL};


    // Apply saved LL status to checkboxes
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
        const ll = checkbox.getAttribute('data-ll');
        if (traderLL[trader] && traderLL[trader][ll]) {
            checkbox.checked = true;
        }
    });

    updateAllTaskStatuses(); 
    filterTasks(); 
    sortTasks(); // <-- NEW: Sort after loading and status update
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    localStorage.setItem(QUICK_SLOT_KEY, JSON.stringify(quickSlottedTasks)); // <-- NEW SAVE
    console.log('Task and objective status saved.'); 
}

// ... sections 3, 4, 5, 6 (handleLLToggle, checkRequirementsAndGenerateList, generateChecklist, handleObjectiveToggle, filterTasks) remain the same

// --- 7. TASK STATUS MANAGEMENT ---

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const isQuickSlotted = quickSlottedTasks[taskId] === true; // <-- NEW: Check quick slot status

    // Safety checks for missing elements (FIXED)
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); 
    const quickSlotButton = taskCard.querySelector('.quick-slot-btn'); // <-- NEW: Get quick slot button
    
    if (!toggleButton || !dialogueTextElement) return; // Exit if critical elements are missing

    // 1. Check Requirements
    const isUnlocked = checkRequirementsAndGenerateList(taskCard);
    
    // 2. Manage Visual Status
    if (!isUnlocked) {
        taskCard.classList.add('task-locked'); 
        toggleButton.style.display = 'none'; 
    } else {
        taskCard.classList.remove('task-locked');
        toggleButton.style.display = 'block'; 
    }

    // 3. Manage Complete/Incomplete State (only if unlocked)
    if (completedTasks[taskId] && isUnlocked) {
        // MARKED AS COMPLETE
        taskCard.classList.add('task-completed');
        toggleButton.textContent = 'Mark as Uncomplete';
        toggleButton.classList.remove('complete-btn'); 
        toggleButton.classList.add('uncomplete-btn');
        dialogueTextElement.textContent = taskCard.getAttribute('data-dialogue-complete'); 
    } else {
        // MARKED AS INCOMPLETE or UNLOCKED
        taskCard.classList.remove('task-completed');
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
        dialogueTextElement.textContent = taskCard.getAttribute('data-dialogue-initial'); 
    }
    
    // 4. Manage Quick Slot State (NEW)
    if (quickSlotButton) {
        if (isQuickSlotted) {
            taskCard.classList.add('task-quick-slotted');
            quickSlotButton.classList.add('slotted-active');
            quickSlotButton.innerHTML = '★'; // Solid star
        } else {
            taskCard.classList.remove('task-quick-slotted');
            quickSlotButton.classList.remove('slotted-active');
            quickSlotButton.innerHTML = '☆'; // Hollow star
        }
    }

    // 5. Update Checklist
    generateChecklist(taskCard);
}

function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
    sortTasks(); // <-- NEW: Sort after all statuses are applied
}


function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    // ... existing logic ...

    updateTaskStatus(taskCard);
    saveProgress();
    
    event.stopPropagation(); 
}

document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});

// --- 8. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Don't toggle expansion if clicking on a button, checkbox, or related element
        if (event.target.classList.contains('task-toggle-btn') || 
            event.target.closest('.task-toggle-btn') || 
            event.target.closest('.quick-slot-btn') || // <-- NEW: Ignore quick slot button
            event.target.type === 'checkbox' || 
            event.target.closest('.objective-item') || 
            event.target.closest('.collapsed-requirements')) {
            return;
        }

        // ... rest of logic ...
    });
});

// --- 9. QUICK SLOT SYSTEM HANDLER (NEW SECTION) ---

function handleQuickSlotToggle(event) {
    const button = event.target.closest('.quick-slot-btn');
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    // Toggle the state
    quickSlottedTasks[taskId] = !quickSlottedTasks[taskId];
    if (!quickSlottedTasks[taskId]) {
        delete quickSlottedTasks[taskId]; // Clean up if unslotted
    }

    // Update UI and save
    updateTaskStatus(taskCard);
    saveProgress();
    sortTasks(); // <-- NEW: Sort immediately after toggling
    
    event.stopPropagation(); // Prevent the card from expanding/collapsing
}

document.querySelectorAll('.quick-slot-btn').forEach(button => {
    button.addEventListener('click', handleQuickSlotToggle);
});

// --- 10. TASK SORTING LOGIC (NEW SECTION) ---

function sortTasks() {
    const sortedCards = Array.from(expandableCards).sort((a, b) => {
        const aIsSlotted = a.classList.contains('task-quick-slotted');
        const bIsSlotted = b.classList.contains('task-quick-slotted');
        
        if (aIsSlotted && !bIsSlotted) return -1; // a goes before b
        if (!aIsSlotted && bIsSlotted) return 1; // b goes before a
        
        // Secondary sort: keep the original order if neither/both are slotted
        // This is implicitly handled by the DOM order if we don't return 0 here,
        // but adding them back to the parent preserves the original order.
        return 0; 
    });

    sortedCards.forEach(card => {
        tasksSection.appendChild(card);
    });
}


// Load progress when the page first loads
loadProgress();

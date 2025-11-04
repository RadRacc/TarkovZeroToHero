// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 
const TRADER_LL_KEY = 'eftZthTraderLL'; 

let completedTasks = {}; 
let completedObjectives = {}; 
let traderLL = {}; 

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const traderFilter = document.getElementById('trader-filter');
const taskSearch = document.getElementById('task-search');
const llCheckboxes = document.querySelectorAll('#ll-tracker input[type="checkbox"]');

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
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL)); 
    console.log('Task and objective status saved.'); 
}

// --- 3. LOYALTY LEVEL TRACKER HANDLER ---

function handleLLToggle(event) {
    const checkbox = event.target;
    const trader = checkbox.closest('.trader-ll-group').getAttribute('data-trader');
    const ll = checkbox.getAttribute('data-ll');
    const isChecked = checkbox.checked;
    
    // 1. Update the data model
    traderLL[trader][ll] = isChecked;

    // 2. Enforce LL Hierarchy: If LL_X is checked, all lower levels must be checked. 
    // If LL_X is unchecked, all higher levels must be unchecked.
    const allLLCheckboxes = checkbox.closest('.ll-checkbox-group').querySelectorAll('input[type="checkbox"]');
    
    allLLCheckboxes.forEach(cb => {
        const cbLL = parseInt(cb.getAttribute('data-ll'));

        if (isChecked && cbLL < parseInt(ll)) {
            // Check lower levels
            cb.checked = true;
            traderLL[trader][cbLL] = true;
        } else if (!isChecked && cbLL > parseInt(ll)) {
            // Uncheck higher levels
            cb.checked = false;
            traderLL[trader][cbLL] = false;
        }
    });

    saveProgress();
    updateAllTaskStatuses(); // Re-check task requirements after LL change
}

llCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleLLToggle);
});


// --- 4. REQUIREMENTS CHECK AND GENERATION (UPDATED) ---

/**
 * Checks all prerequisites for a task and updates the requirements list display.
 * @param {HTMLElement} taskCard - The task card element.
 * @returns {boolean} True if ALL requirements are met, false otherwise.
 */
function checkRequirementsAndGenerateList(taskCard) {
    const requirementsAttribute = taskCard.getAttribute('data-task-requirements');
    const requirementsContainer = taskCard.querySelector('.task-requirements-list');
    
    // Safety check for null/missing elements (FIXED)
    if (!requirementsContainer) return true; 

    requirementsContainer.innerHTML = ''; 
    let allRequirementsMet = true;
    const traderName = taskCard.getAttribute('data-trader');

    if (requirementsAttribute === 'None' || !requirementsAttribute) {
        requirementsContainer.innerHTML = '<div class="requirement-item met">No prerequisites.</div>';
        return true;
    }

    const requirements = requirementsAttribute.split(';');

    requirements.forEach(req => {
        const reqText = req.trim();
        let isMet = true;
        
        if (reqText.startsWith('Complete task-')) {
            // Task Dependency: 'Complete task-X'
            const requiredTaskId = reqText.replace('Complete ', '').trim();
            isMet = completedTasks[requiredTaskId] === true;
        } else if (reqText.startsWith('LL')) {
            // Loyalty Level Requirement: 'LL1', 'LL2', etc.
            const requiredLL = reqText.replace('LL', '');
            // Check the new LL data model
            isMet = traderLL[traderName] && traderLL[traderName][requiredLL] === true;
        } else {
            isMet = true; 
        }

        if (!isMet) {
            allRequirementsMet = false;
        }

        const statusClass = isMet ? 'met' : 'unmet';
        
        const requirementItem = document.createElement('div');
        requirementItem.classList.add('requirement-item', statusClass);
        requirementItem.textContent = reqText;
        requirementsContainer.appendChild(requirementItem);
    });
    
    return allRequirementsMet;
}


// --- 5. CHECKLIST GENERATION AND MANAGEMENT ---
function generateChecklist(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const objectivesList = taskCard.getAttribute('data-objective-list');
    const checklistContainer = taskCard.querySelector('.objective-checklist');
    
    // Safety check for null/missing elements (FIXED)
    if (!checklistContainer) return; 

    checklistContainer.innerHTML = ''; 

    if (!objectivesList) return;

    const objectives = objectivesList.split(';');

    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    objectives.forEach((objectiveText, index) => {
        const uniqueId = `${taskId}-${index}`;
        const isCompleted = completedObjectives[taskId][index] || false;

        const objectiveItem = document.createElement('div');
        objectiveItem.classList.add('objective-item');

        objectiveItem.innerHTML = `
            <input type="checkbox" id="${uniqueId}" data-objective-index="${index}" ${isCompleted ? 'checked' : ''}>
            <label for="${uniqueId}">${objectiveText}</label>
        `;
        
        checklistContainer.appendChild(objectiveItem);
    });
    
    checklistContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleObjectiveToggle);
    });
}

function handleObjectiveToggle(event) {
    const checkbox = event.target;
    const taskCard = checkbox.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    const index = checkbox.getAttribute('data-objective-index');
    
    completedObjectives[taskId][index] = checkbox.checked;
    
    if (checkbox.checked) {
        const allCheckboxes = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
        let allCompleted = true;
        allCheckboxes.forEach(cb => {
            if (!cb.checked) {
                allCompleted = false;
            }
        });

        if (allCompleted) {
            completedTasks[taskId] = true;
        }
    } else {
        if (completedTasks[taskId]) {
             completedTasks[taskId] = false;
        }
    }

    updateTaskStatus(taskCard); 
    saveProgress();
}


// --- 6. FILTERING AND SEARCHING LOGIC ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const searchTerm = taskSearch.value.toLowerCase().trim();

    expandableCards.forEach(card => {
        const trader = card.getAttribute('data-trader');
        // Safety checks for missing elements (FIXED)
        const titleElement = card.querySelector('.task-title');
        const objectiveElement = card.querySelector('.task-objective');

        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const objective = objectiveElement ? objectiveElement.textContent.toLowerCase() : '';

        let matchesTrader = (selectedTrader === 'all' || trader === selectedTrader);
        let matchesSearch = true;

        if (searchTerm.length > 0) {
            matchesSearch = title.includes(searchTerm) || objective.includes(searchTerm);
        }

        if (matchesTrader && matchesSearch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

traderFilter.addEventListener('change', filterTasks);
taskSearch.addEventListener('keyup', filterTasks);


// --- 7. TASK STATUS MANAGEMENT ---

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    
    // Safety checks for missing elements (FIXED)
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); 
    
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
    
    // 4. Update Checklist
    generateChecklist(taskCard);
}

function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
}


function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    if (taskCard.classList.contains('task-locked')) {
        event.stopPropagation();
        return;
    }
    
    completedTasks[taskId] = !completedTasks[taskId];

    if (!completedTasks[taskId] && completedObjectives[taskId]) {
        // If uncompleting task, uncheck all objectives
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = false;
        });
    }

    if (completedTasks[taskId] && completedObjectives[taskId]) {
        // If completing task, check all objectives
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = true;
        });
    }

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
        if (event.target.classList.contains('task-toggle-btn') || event.target.closest('.task-toggle-btn') || event.target.type === 'checkbox' || event.target.closest('.objective-item') || event.target.closest('.collapsed-requirements')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'grid' : 'none'; 
        }
    });
});

// Load progress when the page first loads
loadProgress();

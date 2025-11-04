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
const mapFilter = document.getElementById('map-filter'); // NEW MAP FILTER
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

    const loadedLL = JSON.parse(localStorage.getItem(TRADER_LL_KEY) || '{}');
    // Merge loaded data with default to ensure all keys are present
    for (const trader in defaultData) {
        traderLL[trader] = loadedLL[trader] ? { ...defaultData[trader], ...loadedLL[trader] } : defaultData[trader];
    }
    
    // Initialize task-0 as complete if not found (Bootstrap)
    if (!completedTasks['task-0']) {
        completedTasks['task-0'] = true;
    }

    applyLLProgressToUI();
    updateAllTaskCards();
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives));
    localStorage.setItem(TRADER_LL_KEY, JSON.stringify(traderLL));
}

function applyLLProgressToUI() {
    llCheckboxes.forEach(checkbox => {
        const trader = checkbox.closest('.trader-ll-group').dataset.trader;
        const ll = checkbox.dataset.ll;
        
        // Ensure that if a higher LL is checked, all lower LLs are also checked
        if (traderLL[trader] && ll) {
            checkbox.checked = traderLL[trader][ll];
            checkbox.disabled = false; // Enable all checkboxes
            
            if (checkbox.checked) {
                // Check all lower levels
                for (let i = 1; i < parseInt(ll); i++) {
                    const lowerLLCheckbox = checkbox.closest('.trader-ll-group').querySelector(`input[data-ll="${i}"]`);
                    if (lowerLLCheckbox) lowerLLCheckbox.checked = true;
                }
            }
        }
    });

    // Ensure state reflects UI checks for LL
    for (const trader in traderLL) {
        for (let ll = 1; ll <= 4; ll++) {
            const checkbox = document.querySelector(`[data-trader="${trader}"] input[data-ll="${ll}"]`);
            if (checkbox) {
                traderLL[trader][ll] = checkbox.checked;
            }
        }
    }
}

// --- 3. FILTERING AND SEARCH ---
function filterAndSearchTasks() {
    const selectedTrader = traderFilter.value.toLowerCase();
    const selectedMap = mapFilter.value.toLowerCase(); // Get selected map
    const searchTerm = taskSearch.value.toLowerCase();

    expandableCards.forEach(card => {
        const trader = card.dataset.trader.toLowerCase();
        const map = card.dataset.map.toLowerCase(); // Get task map
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        
        // Trader Filter
        const traderMatch = selectedTrader === '' || trader === selectedTrader;

        // Map Filter (NEW)
        const mapMatch = selectedMap === '' || map === selectedMap;
        
        // Search Filter
        const searchMatch = title.includes(searchTerm);

        if (traderMatch && searchMatch && mapMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Attach event listeners for filtering
traderFilter.addEventListener('change', filterAndSearchTasks);
mapFilter.addEventListener('change', filterAndSearchTasks); // NEW MAP LISTENER
taskSearch.addEventListener('input', filterAndSearchTasks);


// --- 4. TASK AVAILABILITY AND STATUS CHECK ---
function checkTaskAvailability(card) {
    const taskId = card.dataset.taskId;
    const trader = card.dataset.trader;

    // Check if complete
    if (completedTasks[taskId]) {
        return { isAvailable: false, requirementsMet: true, reason: 'Complete' };
    }
    
    // Check if global task-0 is complete (unlocks initial LL1 tasks)
    if (taskId !== 'task-0' && !completedTasks['task-0']) {
        return { isAvailable: false, requirementsMet: false, reason: 'Initial Setup Required' };
    }

    const requirements = card.dataset.taskRequirements.split(';');
    let requirementsMet = true;

    for (const req of requirements) {
        const trimmedReq = req.trim();

        // LL Requirement
        if (trimmedReq.startsWith('LL')) {
            const requiredLL = parseInt(trimmedReq.substring(2));
            if (traderLL[trader] && !traderLL[trader][requiredLL]) {
                requirementsMet = false;
                break;
            }
        }

        // Predecessor Task Requirement
        if (trimmedReq.startsWith('Complete task-')) {
            const requiredTaskID = trimmedReq.substring(9);
            if (!completedTasks[requiredTaskID]) {
                requirementsMet = false;
                break;
            }
        }
    }

    return { isAvailable: requirementsMet, requirementsMet: requirementsMet, reason: requirementsMet ? 'Available' : 'Requirements Not Met' };
}

function updateTaskStatus(card) {
    const taskId = card.dataset.taskId;
    const isComplete = completedTasks[taskId];
    const availability = checkTaskAvailability(card);
    const requirementsList = card.querySelector('.task-requirements-list');
    const completeBtn = card.querySelector('.task-toggle-btn');
    const collapsedStatusBox = card.querySelector('.collapsed-status-box');

    // 1. Completion Status
    if (isComplete) {
        card.classList.add('complete');
        completeBtn.textContent = 'Unmark as Complete';
        completeBtn.classList.remove('complete-btn', 'disabled');
        completeBtn.classList.add('uncomplete-btn');
        if(collapsedStatusBox) collapsedStatusBox.querySelector('.collapsed-requirements').textContent = 'STATUS: Complete';
    } else {
        card.classList.remove('complete');
        completeBtn.textContent = 'Mark as Complete';
        completeBtn.classList.remove('uncomplete-btn', 'disabled');
        completeBtn.classList.add('complete-btn');
    }

    // 2. Availability / Requirement Status
    if (!isComplete) {
        if (!availability.requirementsMet) {
            completeBtn.classList.add('disabled');
        } else {
            completeBtn.classList.remove('disabled');
        }
        
        // Update expanded view requirements display
        requirementsList.innerHTML = '';
        const requirements = card.dataset.taskRequirements.split(';');
        
        let reqSummaryText = [];
        
        for (const req of requirements) {
            const trimmedReq = req.trim();
            let reqMet = true;

            // LL Requirement Display
            if (trimmedReq.startsWith('LL')) {
                const requiredLL = parseInt(trimmedReq.substring(2));
                const trader = card.dataset.trader;
                reqMet = traderLL[trader] && traderLL[trader][requiredLL];

                if (reqMet) {
                    requirementsList.innerHTML += `<p class="text-success">${card.dataset.trader} LL${requiredLL} (Met)</p>`;
                } else {
                    requirementsList.innerHTML += `<p class="text-error">${card.dataset.trader} LL${requiredLL} (Required)</p>`;
                }
                reqSummaryText.push(`LL: ${requiredLL}`);
            }

            // Predecessor Task Requirement Display
            if (trimmedReq.startsWith('Complete task-')) {
                const requiredTaskID = trimmedReq.substring(9);
                reqMet = completedTasks[requiredTaskID];
                const requiredTaskCard = document.querySelector(`[data-task-id="${requiredTaskID}"]`);
                const requiredTaskTitle = requiredTaskCard ? requiredTaskCard.querySelector('.task-title').textContent : 'Previous Task';

                if (reqMet) {
                    requirementsList.innerHTML += `<p class="text-success">Complete "${requiredTaskTitle}" (Met)</p>`;
                } else {
                    requirementsList.innerHTML += `<p class="text-error">Complete "${requiredTaskTitle}" (Required)</p>`;
                }
                reqSummaryText.push(`Task Required: ${requiredTaskTitle}`);
            }
        }
        // Update collapsed view requirement text
        if(collapsedStatusBox) {
            collapsedStatusBox.querySelector('.collapsed-requirements').textContent = reqSummaryText.join(' | ');
        }
    }


    // 3. Dialogue
    const dialogueText = card.querySelector('.dialogue-text');
    const initialDialogue = card.dataset.dialogueInitial;
    const completeDialogue = card.dataset.dialogueComplete;
    dialogueText.textContent = isComplete ? completeDialogue : initialDialogue;

    // 4. Objectives (Checkboxes)
    createCheckboxes(card, taskId, isComplete);
    
    // 5. Sort Tasks (Completed to Bottom)
    sortTasks();
}

function updateAllTaskCards() {
    expandableCards.forEach(updateTaskStatus);
}


// --- 5. OBJECTIVE CHECKBOX LOGIC ---
function createCheckboxes(taskCard, taskId, isTaskComplete) {
    const objectiveListElement = taskCard.querySelector('.objective-checklist');
    objectiveListElement.innerHTML = ''; 

    // Initialize objectives for this task if they don't exist
    if (!completedObjectives[taskId]) {
        completedObjectives[taskId] = {};
    }

    const objectiveItems = taskCard.dataset.objectiveList.split(';');

    objectiveItems.forEach((objective, index) => {
        const id = `${taskId}-obj-${index}`;
        
        // Ensure objective state is initialized (defaults to false if not completed)
        if (completedObjectives[taskId][id] === undefined) {
            completedObjectives[taskId][id] = false;
        }

        const label = document.createElement('label');
        label.classList.add('objective-item');
        label.setAttribute('for', id);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.name = id;
        checkbox.checked = completedObjectives[taskId][id];

        const span = document.createElement('span');
        span.textContent = objective;

        label.appendChild(checkbox);
        label.appendChild(span);
        objectiveListElement.appendChild(label);
        
        // Objectives cannot be unchecked if the task is marked complete
        checkbox.disabled = isTaskComplete;
        
        checkbox.addEventListener('change', (e) => {
            completedObjectives[taskId][id] = e.target.checked;
            saveProgress();
            
            // Check if all objectives are met to potentially enable the 'complete' button
            updateTaskStatus(taskCard); 
        });
        
        // If task is complete, ensure the span has line-through style regardless of checked state
        if (isTaskComplete) {
            span.style.textDecoration = 'line-through';
            span.style.color = '#777';
        } else if (checkbox.checked) {
             span.style.textDecoration = 'line-through';
             span.style.color = '#B0B0B0';
        } else {
             span.style.textDecoration = 'none';
             span.style.color = '#E0E0E0';
        }
    });
}


// --- 6. LOYALTY LEVEL HANDLER ---
llCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        const trader = checkbox.closest('.trader-ll-group').dataset.trader;
        const ll = parseInt(checkbox.dataset.ll);
        const isChecked = event.target.checked;

        if (isChecked) {
            // Check all lower levels
            for (let i = 1; i <= ll; i++) {
                traderLL[trader][i] = true;
            }
        } else {
            // Uncheck all higher levels
            for (let i = ll; i <= 4; i++) {
                traderLL[trader][i] = false;
            }
        }

        // Manually update the UI state to reflect dependencies
        applyLLProgressToUI(); 
        
        // Update all tasks as LL changes can affect availability
        updateAllTaskCards();
        saveProgress();
    });
});


// --- 7. TASK COMPLETION HANDLER ---
function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.dataset.taskId;

    // Check availability only if marking as complete (not uncompleting)
    if (button.classList.contains('complete-btn') && button.classList.contains('disabled')) {
        // If button is disabled and they try to complete, prevent action
        event.stopPropagation();
        return;
    }

    const isCurrentlyComplete = completedTasks[taskId];

    if (!isCurrentlyComplete) {
        // MARK AS COMPLETE
        const objectives = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
        let allChecked = true;
        objectives.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });
        
        if (!allChecked) {
            alert('Please check all objectives before completing the task!');
            event.stopPropagation();
            return;
        }

        completedTasks[taskId] = true;
    } else {
        // UNMARK AS COMPLETE
        completedTasks[taskId] = false;
    }

    // Update objective status in local state when toggling completion
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
    updateAllTaskCards(); // Necessary to check downstream tasks
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

// --- 9. SORTING LOGIC ---
function sortTasks() {
    const taskList = document.getElementById('task-list');
    const tasksArray = Array.from(taskList.children);

    tasksArray.sort((a, b) => {
        const aId = a.dataset.taskId;
        const bId = b.dataset.taskId;
        const aComplete = completedTasks[aId];
        const bComplete = completedTasks[bId];

        // Primary sort: Completed tasks go to the bottom
        if (aComplete !== bComplete) {
            return aComplete ? 1 : -1;
        }
        
        // Secondary sort (for uncompleted tasks): Sort by trader and then by ID (natural order)
        if (!aComplete && !bComplete) {
            const aTrader = a.dataset.trader;
            const bTrader = b.dataset.trader;
            
            if (aTrader !== bTrader) {
                return aTrader.localeCompare(bTrader);
            }
            
            // Tertiary sort: by task ID (task-1 < task-10)
            return parseInt(aId.split('-')[1]) - parseInt(bId.split('-')[1]);
        }
        
        // Default (for completed tasks): keep original order
        return 0;
    }).forEach(taskCard => taskList.appendChild(taskCard));
}

// Load progress when the page first loads
loadProgress();

// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal';
const COMPLETED_OBJECTIVES_KEY = 'eftZthCompletedObjectives'; 

let completedTasks = {}; 
let completedObjectives = {}; 

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 
const traderFilter = document.getElementById('trader-filter');
const taskSearch = document.getElementById('task-search');

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    completedObjectives = JSON.parse(localStorage.getItem(COMPLETED_OBJECTIVES_KEY) || '{}'); 

    updateAllTaskStatuses(); 
    filterTasks(); 
}

function saveProgress() {
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    localStorage.setItem(COMPLETED_OBJECTIVES_KEY, JSON.stringify(completedObjectives)); 
    console.log('Task and objective status saved.'); 
}

// --- 3. REQUIREMENTS CHECK AND GENERATION (NEW) ---

// Placeholder for future Loyalty Level logic (currently just checks LL1)
function isLLRequirementMet(requirement) {
    // Basic logic: if it mentions LL1, assume it's met for now, or you can add a global LL tracker later.
    // For this example, we'll assume LL1 is met by default until a LL tracker is built.
    // If we wanted to lock LL1 tasks, this would return false until a Rep value is hit.
    return !requirement.includes('LL'); 
}

function checkRequirementsAndGenerateList(taskCard) {
    const requirementsAttribute = taskCard.getAttribute('data-task-requirements');
    const requirementsContainer = taskCard.querySelector('.task-requirements-list');
    
    requirementsContainer.innerHTML = ''; // Clear previous list
    let allRequirementsMet = true;

    if (requirementsAttribute === 'None') {
        requirementsContainer.innerHTML = '<div class="requirement-item met">No prerequisites.</div>';
        return true;
    }

    const requirements = requirementsAttribute ? requirementsAttribute.split(';') : [];

    requirements.forEach(req => {
        const reqText = req.trim();
        let isMet = true;
        
        if (reqText.startsWith('Complete ')) {
            // Task Dependency: 'Complete task-X'
            const requiredTaskId = reqText.replace('Complete ', '').trim();
            isMet = completedTasks[requiredTaskId] === true;
        } else if (reqText.includes('LL')) {
            // Loyalty Level Requirement: 'Prapor LL1'
            isMet = isLLRequirementMet(reqText);
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


// --- 4. CHECKLIST GENERATION AND MANAGEMENT ---

function generateChecklist(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const objectivesList = taskCard.getAttribute('data-objective-list');
    const checklistContainer = taskCard.querySelector('.objective-checklist');
    
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

    updateTaskStatus(taskCard); // Re-run status update to ensure dialogue/button reflect change
    saveProgress();
}


// --- 5. FILTERING AND SEARCHING LOGIC ---
function filterTasks() {
    const selectedTrader = traderFilter.value;
    const searchTerm = taskSearch.value.toLowerCase().trim();

    expandableCards.forEach(card => {
        const trader = card.getAttribute('data-trader');
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const objective = card.querySelector('.task-objective').textContent.toLowerCase();

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

// Attach filter/search listeners
traderFilter.addEventListener('change', filterTasks);
taskSearch.addEventListener('keyup', filterTasks);


// --- 6. TASK STATUS MANAGEMENT ---

function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');
    const dialogueTextElement = taskCard.querySelector('.dialogue-text'); 
    
    // 1. Check Requirements (NEW)
    const isUnlocked = checkRequirementsAndGenerateList(taskCard);
    
    // 2. Manage Visual Status
    if (!isUnlocked) {
        taskCard.classList.add('task-locked'); // NEW CLASS
        // Hide/Disable the complete button
        toggleButton.style.display = 'none'; 
    } else {
        taskCard.classList.remove('task-locked');
        toggleButton.style.display = 'block'; // Show the button when unlocked
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
    
    // Prevent toggling if the task is visually locked (safety check)
    if (taskCard.classList.contains('task-locked')) {
        event.stopPropagation();
        return;
    }
    
    // Toggle the main task status
    completedTasks[taskId] = !completedTasks[taskId];

    // If task is UNMARKED, reset sub-objectives
    if (!completedTasks[taskId] && completedObjectives[taskId]) {
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = false;
        });
    }

    // If task is MARKED, ensure all sub-objectives are marked (manual override)
    if (completedTasks[taskId] && completedObjectives[taskId]) {
        Object.keys(completedObjectives[taskId]).forEach(key => {
            completedObjectives[taskId][key] = true;
        });
    }


    updateTaskStatus(taskCard);
    saveProgress();
    
    event.stopPropagation(); 
}

// Attach the toggle handler to all task buttons
document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});


// --- 7. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        if (event.target.classList.contains('task-toggle-btn') || event.target.closest('.task-toggle-btn') || event.target.type === 'checkbox') {
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

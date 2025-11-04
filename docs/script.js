// --- 1. INITIALIZATION AND DATA KEYS ---
const COMPLETED_TASKS_KEY = 'eftZthCompletedTasksMinimal'; // Use a new key to avoid conflicts

let completedTasks = {}; // Store task completion status by ID

// DOM Elements
const expandableCards = document.querySelectorAll('.task-card.expandable'); 

// --- 2. CORE LOGIC FUNCTIONS ---
function loadProgress() {
    // Load completed tasks status from local storage
    completedTasks = JSON.parse(localStorage.getItem(COMPLETED_TASKS_KEY) || '{}');
    updateAllTaskStatuses(); // Update visual state on load
}

function saveProgress() {
    // Save completed tasks status
    localStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(completedTasks));
    console.log('Task status saved.'); 
}

// --- 3. TASK COMPLETION / UNMARK LOGIC ---

// Updates a single task card's visual state and button
function updateTaskStatus(taskCard) {
    const taskId = taskCard.getAttribute('data-task-id');
    const toggleButton = taskCard.querySelector('.task-toggle-btn');

    if (!toggleButton) return; 

    if (completedTasks[taskId]) {
        // MARKED AS COMPLETE
        taskCard.classList.add('task-completed');
        toggleButton.textContent = 'Mark as Uncomplete';
        toggleButton.classList.remove('complete-btn'); 
        toggleButton.classList.add('uncomplete-btn');
    } else {
        // MARKED AS INCOMPLETE
        taskCard.classList.remove('task-completed');
        toggleButton.textContent = 'Mark as Complete';
        toggleButton.classList.remove('uncomplete-btn');
        toggleButton.classList.add('complete-btn');
    }
}

// Update all task statuses on page load
function updateAllTaskStatuses() {
    expandableCards.forEach(updateTaskStatus);
}


function handleTaskToggle(event) {
    const button = event.target;
    const taskCard = button.closest('.task-card');
    const taskId = taskCard.getAttribute('data-task-id');
    
    // Toggle the status
    completedTasks[taskId] = !completedTasks[taskId];

    updateTaskStatus(taskCard);
    saveProgress();
    
    // Prevents the click from bubbling up and collapsing the card immediately
    event.stopPropagation(); 
}

// Attach the toggle handler to all task buttons
document.querySelectorAll('.task-toggle-btn').forEach(button => {
    button.addEventListener('click', handleTaskToggle);
});


// --- 4. EXPAND/COLLAPSE TASK LOGIC ---
expandableCards.forEach(card => {
    card.addEventListener('click', (event) => {
        // Prevent action if the user clicks the button
        if (event.target.classList.contains('task-toggle-btn')) {
            return;
        }

        const expandedView = card.querySelector('.expanded-view');
        
        if (expandedView) {
            const isHidden = window.getComputedStyle(expandedView).display === 'none';
            expandedView.style.display = isHidden ? 'block' : 'none';
        }
    });
});

// Load progress when the page first loads
loadProgress();

document.addEventListener('DOMContentLoaded', () => {
    const tasks = document.querySelectorAll('.task-card');

    // --- Game State (Initial Data) ---
    let gameState = {
        completedTasks: new Set(['task-0']), // Start with the global task complete
        traderLevels: {
            Prapor: 1,
            Skier: 1,
            Therapist: 1,
            Peacekeeper: 1,
            Mechanic: 1,
            Ragman: 1,
            Jaeger: 1
        }
    };

    // Helper function to check if a task is available
    const isTaskAvailable = (taskCard) => {
        const requiredLL = parseInt(taskCard.dataset.taskRequirements.match(/LL(\d+)/)?.[1] || 1);
        const traderName = taskCard.dataset.trader;
        const requiredTaskID = taskCard.dataset.taskRequirements.match(/Complete task-(\d+)/)?.[0];
        
        // 1. Check if the required predecessor task is complete
        if (requiredTaskID && !gameState.completedTasks.has(requiredTaskID.replace('Complete ', ''))) {
            return false;
        }
        
        // 2. Check if the trader's level is high enough
        if (gameState.traderLevels[traderName] < requiredLL) {
            return false;
        }
        
        // 3. Task must not already be complete
        if (gameState.completedTasks.has(taskCard.dataset.taskId)) {
            return false;
        }

        // If task-0 is not complete, only task-0 is available
        if (!gameState.completedTasks.has('task-0') && taskCard.dataset.taskId !== 'task-0') {
            return false;
        }

        return true;
    };

    // Helper function to update the visible state of a task card
    const updateTaskCardState = (taskCard) => {
        const taskId = taskCard.dataset.taskId;
        const isComplete = gameState.completedTasks.has(taskId);
        const isAvailable = isTaskAvailable(taskCard);

        // Update 'complete' state
        if (isComplete) {
            taskCard.classList.add('complete');
            taskCard.querySelector('.complete-btn').textContent = 'Completed';
            taskCard.querySelector('.complete-btn').classList.add('disabled');
            taskCard.querySelector('.collapsed-requirements').textContent = 'STATUS: Complete';
            taskCard.style.order = 1000; // Push to bottom
            taskCard.setAttribute('draggable', 'false');

        } else {
            taskCard.classList.remove('complete');
            taskCard.querySelector('.complete-btn').textContent = 'Mark as Complete';
            taskCard.querySelector('.complete-btn').classList.remove('disabled');
            taskCard.style.order = 0; // Keep at top

            // Update availability state
            const requirementsList = taskCard.querySelector('.task-requirements-list');
            requirementsList.innerHTML = '';
            let requirementsMet = true;

            // Display LL Requirement
            const requiredLLMatch = taskCard.dataset.taskRequirements.match(/LL(\d+)/);
            if (requiredLLMatch) {
                const requiredLL = parseInt(requiredLLMatch[1]);
                const traderName = taskCard.dataset.trader;
                const currentLL = gameState.traderLevels[traderName];
                if (currentLL < requiredLL) {
                    requirementsList.innerHTML += `<p class="text-error">Required: ${traderName} Loyalty Level ${requiredLL}</p>`;
                    requirementsMet = false;
                } else {
                    requirementsList.innerHTML += `<p>Required: ${traderName} Loyalty Level ${requiredLL} (Met)</p>`;
                }
            }

            // Display Predecessor Task Requirement
            const requiredTaskMatch = taskCard.dataset.taskRequirements.match(/Complete (task-\d+)/);
            if (requiredTaskMatch) {
                const requiredTaskID = requiredTaskMatch[1];
                const requiredTaskCard = document.querySelector(`[data-task-id="${requiredTaskID}"]`);
                const requiredTaskTitle = requiredTaskCard ? requiredTaskCard.querySelector('.task-title').textContent : 'Previous Task';
                
                if (!gameState.completedTasks.has(requiredTaskID)) {
                    requirementsList.innerHTML += `<p class="text-error">Required: Complete "${requiredTaskTitle}"</p>`;
                    requirementsMet = false;
                } else {
                    requirementsList.innerHTML += `<p>Required: Complete "${requiredTaskTitle}" (Met)</p>`;
                }
            }

            // Disable/Enable the button based on requirements
            const completeBtn = taskCard.querySelector('.complete-btn');
            if (!isAvailable || !requirementsMet) {
                completeBtn.classList.add('disabled');
            } else {
                completeBtn.classList.remove('disabled');
            }
            
            // Update the collapsed view requirements line
            const reqText = taskCard.dataset.taskRequirements.replace(/Complete task-(\d+)/, (match, id) => {
                const prevTaskCard = document.querySelector(`[data-task-id="task-${id}"]`);
                return `Task Required: ${prevTaskCard ? prevTaskCard.querySelector('.task-title').textContent : 'Previous Task'}`;
            }).replace('LL', 'Loyalty Level ');

            taskCard.querySelector('.collapsed-requirements').textContent = reqText;
        }

        // Update the dialogue box
        const dialogueText = taskCard.querySelector('.dialogue-text');
        const initialDialogue = taskCard.dataset.dialogueInitial;
        const completeDialogue = taskCard.dataset.dialogueComplete;
        dialogueText.textContent = isComplete ? completeDialogue : initialDialogue;

        // Create Checkboxes on first load or refresh
        if (taskCard.querySelector('.objective-checklist').children.length === 0) {
            createCheckboxes(taskCard);
        }
    };

    // Function to create objectives/checkboxes
    const createCheckboxes = (taskCard) => {
        const objectiveListElement = taskCard.querySelector('.objective-checklist');
        objectiveListElement.innerHTML = ''; // Clear previous content

        const objectiveItems = taskCard.dataset.objectiveList.split(';');

        objectiveItems.forEach((objective, index) => {
            const id = `${taskCard.dataset.taskId}-obj-${index}`;
            const label = document.createElement('label');
            label.setAttribute('for', id);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = id;
            checkbox.name = id;
            checkbox.checked = gameState[id] || false; // Load state from gameState (if it existed)

            const span = document.createElement('span');
            span.textContent = objective;

            label.appendChild(checkbox);
            label.appendChild(span);
            objectiveListElement.appendChild(label);
            
            // Save state on change
            checkbox.addEventListener('change', (e) => {
                gameState[id] = e.target.checked;
                saveGameState();
            });
        });
    };

    // Event listener for expanding/collapsing
    tasks.forEach(taskCard => {
        const collapsedView = taskCard.querySelector('.collapsed-view');
        const expandedView = taskCard.querySelector('.expanded-view');
        
        collapsedView.addEventListener('click', () => {
            // Check if it's the global task-0, if so, ignore the click
            if (taskCard.dataset.taskId === 'task-0') {
                return; 
            }
            expandedView.classList.toggle('hidden-detail');
        });

        // Initial load: create checkboxes and update state
        updateTaskCardState(taskCard);

        // Event listener for marking complete
        taskCard.querySelector('.complete-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card from collapsing

            const taskId = taskCard.dataset.taskId;
            const completeBtn = e.target;
            
            if (completeBtn.classList.contains('disabled')) return;

            // Check all objectives are checked (except for task-0 which is special)
            if (taskId !== 'task-0') {
                const objectives = taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]');
                let allChecked = true;
                objectives.forEach(checkbox => {
                    if (!checkbox.checked) {
                        allChecked = false;
                    }
                });
                
                if (!allChecked) {
                    alert('All objectives must be checked to complete the task!');
                    return;
                }
            }

            // --- Complete Task Logic ---
            gameState.completedTasks.add(taskId);
            
            // Manually grant LL2 to a trader for a complete example after their first task
            if (taskId === 'task-1') { gameState.traderLevels.Prapor = 2; }
            if (taskId === 'task-3') { gameState.traderLevels.Skier = 2; }
            if (taskId === 'task-2') { gameState.traderLevels.Mechanic = 2; }
            
            // Unlock all LL1 tasks after task-0 (Initial Setup)
            if (taskId === 'task-0') {
                // This task just acts as a global unlock condition
            }

            // Clear objective states for completed task
            taskCard.querySelectorAll('.objective-checklist input[type="checkbox"]').forEach(checkbox => {
                delete gameState[checkbox.id];
            });

            // Update all tasks now that state has changed
            saveGameState();
            tasks.forEach(t => updateTaskCardState(t));

            // Collapse the card after completion
            expandedView.classList.add('hidden-detail');
        });
    });

    // Function to save game state to local storage
    const saveGameState = () => {
        localStorage.setItem('eftTaskTrackerState', JSON.stringify({
            completedTasks: Array.from(gameState.completedTasks),
            traderLevels: gameState.traderLevels
        }));
    };

    // Function to load game state from local storage
    const loadGameState = () => {
        const savedState = localStorage.getItem('eftTaskTrackerState');
        if (savedState) {
            const loadedState = JSON.parse(savedState);
            gameState.completedTasks = new Set(loadedState.completedTasks);
            gameState.traderLevels = loadedState.traderLevels;
        }
    };

    // Initial load and update of all tasks
    loadGameState();
    tasks.forEach(t => updateTaskCardState(t));
    
    // Re-sort the task list (complete tasks at bottom)
    const taskList = document.getElementById('task-list');
    Array.from(tasks)
        .sort((a, b) => {
            const aComplete = gameState.completedTasks.has(a.dataset.taskId);
            const bComplete = gameState.completedTasks.has(b.dataset.taskId);
            if (aComplete === bComplete) return 0;
            return aComplete ? 1 : -1;
        })
        .forEach(taskCard => taskList.appendChild(taskCard));
});

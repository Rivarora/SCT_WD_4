document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const pendingTasksSpan = document.getElementById('pendingTasks');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';

    // Initialize the app
    function init() {
        renderTasks();
        updateStats();
        
        // Set default datetime to now
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        taskDateTime.value = formattedDateTime;
    }

    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        const dateTime = taskDateTime.value;
        
        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const newTask = {
            id: Date.now(),
            text,
            completed: false,
            dateTime: dateTime || null,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        updateStats();
        
        // Reset input
        taskInput.value = '';
        taskInput.focus();
        
        // Reset datetime to now
        const now = new Date();
        const formattedDateTime = formatDateTimeForInput(now);
        taskDateTime.value = formattedDateTime;
    }

    // Format date for datetime-local input
    function formatDateTimeForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Format date for display
    function formatDateForDisplay(dateTimeString) {
        if (!dateTimeString) return '';
        
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleString(undefined, options);
    }

    // Render tasks based on current filter
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found. Add a new task!</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <span class="task-date">${formatDateForDisplay(task.dateTime)}</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
        
        // Add event listeners to new elements
        addTaskEventListeners();
    }

    // Add event listeners to task elements
    function addTaskEventListeners() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskStatus);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', editTask);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', deleteTask);
        });
    }

    // Toggle task completion status
    function toggleTaskStatus(e) {
        const taskId = parseInt(e.target.closest('.task-item').dataset.id);
        const task = tasks.find(task => task.id === taskId);
        
        task.completed = e.target.checked;
        saveTasks();
        renderTasks();
        updateStats();
    }

    // Edit task
    function editTask(e) {
        const taskItem = e.target.closest('.task-item');
        const taskId = parseInt(taskItem.dataset.id);
        const task = tasks.find(task => task.id === taskId);
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            const newDateTime = prompt('Edit date/time (YYYY-MM-DD HH:MM):', 
                task.dateTime ? formatDateForDisplay(task.dateTime) : '');
            
            if (newDateTime !== null) {
                try {
                    if (newDateTime) {
                        const date = new Date(newDateTime);
                        if (!isNaN(date)) {
                            const formattedDateTime = formatDateTimeForInput(date);
                            task.dateTime = formattedDateTime;
                        } else {
                            alert('Invalid date format. Task date not changed.');
                        }
                    } else {
                        task.dateTime = null;
                    }
                } catch (e) {
                    alert('Error parsing date. Task date not changed.');
                }
            }
            
            saveTasks();
            renderTasks();
        }
    }

    // Delete task
    function deleteTask(e) {
        if (confirm('Are you sure you want to delete this task?')) {
            const taskId = parseInt(e.target.closest('.task-item').dataset.id);
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateStats();
        }
    }

    // Update task statistics
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksSpan.textContent = `Total: ${total}`;
        completedTasksSpan.textContent = `Completed: ${completed}`;
        pendingTasksSpan.textContent = `Pending: ${pending}`;
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Filter tasks
    function filterTasks(e) {
        currentFilter = e.target.dataset.filter;
        
        // Update active button
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === currentFilter) {
                btn.classList.add('active');
            }
        });
        
        renderTasks();
    }

    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', filterTasks);
    });

    // Initialize the app
    init();
});
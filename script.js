// Plain JavaScript Jamps Task Tracker
// Run with `node server.js` and open `http://localhost:3000` in a BROWSER.
// Do NOT run `node script.js` directly, as it requires a browser DOM for UI rendering.

let tasks = [];
let filter = 'all';

// Load tasks from server
fetch('/api/tasks')
    .then(response => response.json())
    .then(data => {
        tasks = data || [];
        renderTasks();
    })
    .catch(err => console.warn('Error fetching tasks:', err));

// DOM elements
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskList = document.getElementById('task-list');
const filterAll = document.getElementById('filter-all');
const filterActive = document.getElementById('filter-active');
const filterCompleted = document.getElementById('filter-completed');
const clearCompleted = document.getElementById('clear-completed');

// Check if running in a browser environment
if (!document || !taskForm) {
    console.error('This script requires a browser DOM. Run it by executing `node server.js` and accessing http://localhost:3000.');
} else {
    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="text-center text-gray-500">No tasks to show</li>';
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-gray-50 p-4 rounded-lg task-card';
            li.innerHTML = `
                <div class="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        ${task.completed ? 'checked' : ''}
                        class="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        onchange="toggleTask(${task.id})"
                    />
                    <div>
                        <h3 class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} text-lg">
                            ${task.title}
                        </h3>
                        ${task.description ? `<p class="text-sm text-gray-600">${task.description}</p>` : ''}
                    </div>
                </div>
                <button
                    class="text-red-600 hover:text-red-800"
                    onclick="deleteTask(${task.id})"
                >
                    ✕
                </button>
            `;
            taskList.appendChild(li);
        });

        // Save tasks to server
        fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tasks)
        }).catch(err => console.warn('Error saving tasks:', err));
    }

    // Add task
    function addTask(e) {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;
        const description = taskDescriptionInput.value.trim();
        const newTask = {
            id: Date.now(),
            title,
            description,
            completed: false,
        };
        tasks.push(newTask);
        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        renderTasks();
    }

    // Toggle task completion
    function toggleTask(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        renderTasks();
    }

    // Delete task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    }

    // Clear completed tasks
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
    }

    // Set filter
    function setFilter(newFilter) {
        filter = newFilter;
        [filterAll, filterActive, filterCompleted].forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white', 'active');
            btn.classList.add('bg-gray-200', 'text-gray-800');
        });
        document.getElementById(`filter-${newFilter}`).classList.add('bg-blue-600', 'text-white', 'active');
        renderTasks();
    }

    // Event listeners
    taskForm.addEventListener('submit', addTask);
    filterAll.addEventListener('click', () => setFilter('all'));
    filterActive.addEventListener('click', () => setFilter('active'));
    filterCompleted.addEventListener('click', () => setFilter('completed'));
    clearCompleted.addEventListener('click', clearCompletedTasks);

    // Initial render
    renderTasks();
}
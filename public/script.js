const API_URL = "/api"; // Backend API URL

let authToken = ""; // Store the JWT token here

document.getElementById("loginForm").addEventListener("submit", loginUser);
document.getElementById("registerButton").addEventListener("click", showRegisterForm);
document.getElementById("registerForm").addEventListener("submit", registerUser);
document.getElementById("addTaskButton").addEventListener("click", showTaskForm);
document.getElementById("saveTaskButton").addEventListener("click", saveTask);
document.getElementById("logoutButton").addEventListener("click", logoutUser);
document.getElementById("applyFilters").addEventListener("click", applyFilters);

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Login error:", errorData);
            document.getElementById("authError").textContent = errorData.message || "Login failed";
            return;
        }

        const data = await response.json();
        authToken = data.token;
        localStorage.setItem("authToken", authToken);
        showTaskSection();
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("authError").textContent = "Something went wrong!";
    }
}

function showRegisterForm() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "block";
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful! You can now log in.");
            document.getElementById("registerForm").reset();
            showLoginForm();
        } else {
            document.getElementById("regError").textContent = data.message;
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

function showLoginForm() {
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

function showTaskSection() {
    document.getElementById("authSection").style.display = "none";
    document.getElementById("taskSection").style.display = "block";
    fetchTasks();
}

async function fetchTasks(filters = {}) {
    try {
        let url = `${API_URL}/tasks`;

        const queryParams = new URLSearchParams(filters).toString();
        if (queryParams) {
            url += `?${queryParams}`;
        }

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Fetch tasks error:", errorData);
            return;
        }

        const tasks = await response.json();
        const taskListContainer = document.getElementById("tasksList");
        taskListContainer.innerHTML = "";

        tasks.forEach((task) => {
            const taskItem = document.createElement("div");
            taskItem.classList.add("task-item");
            taskItem.innerHTML = `
                <h4>${task.title}</h4>
                <p>${task.description}</p>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
                <button onclick="deleteTask('${task._id}')">Delete</button>
            `;
            taskListContainer.appendChild(taskItem);
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

function logoutUser() {
    localStorage.removeItem("authToken");
    authToken = "";
    document.getElementById("taskSection").style.display = "none";
    document.getElementById("authSection").style.display = "block";
}

// ✅ API URL
const API_URL = "https://demo2.z-bit.ee";
let taskList, addTask;

// ✅ Kontrollime, kas kasutaja on sisse logitud
window.addEventListener("load", async () => {
    const token = localStorage.getItem("token"); // Kasutaja token

    if (!token) {
        showLoginForm(); // Kui token puudub, näita sisselogimise vormi
        return;
    }

    // ✅ Kui kasutaja on sisse logitud, lae ülesanded
    taskList = document.querySelector("#task-list");
    addTask = document.querySelector("#add-task");

    if (!taskList || !addTask) {
        console.error("HTML elemendid puuduvad!");
        return;
    }

    document.querySelector("#logout").addEventListener("click", logout); // Seome väljalogimise nupu

    await loadTasks();

    addTask.addEventListener("click", async () => {
        const newTask = { title: `Task ${taskList.children.length + 1}`, desc: "", marked_as_done: false };
        await createTask(newTask);
    });
});

// ✅ **Sisselogimine**
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/users/get-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Sisselogimine ebaõnnestus! Staatus: ${response.status}, Vastus: ${errorText}`);
        }

        const data = await response.json();
        
        // ✅ Salvesta saadud access_token
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);

        console.log("Sisselogimine õnnestus! Kasutaja:", data.username);
        location.reload(); // Laadime lehe uuesti, et kuvada ülesanded
    } catch (error) {
        console.error("Viga sisselogimisel:", error);
        alert("Sisselogimine ebaõnnestus! Kontrolli oma kasutajanime ja parooli.");
    }
}

// ✅ **Väljalogimine**
function logout() {
    localStorage.removeItem("token"); // Eemalda token
    location.reload();
}

// ✅ **Lae ülesanded serverist**
async function loadTasks() {
    const token = localStorage.getItem("token");
    if (!token) return showLoginForm();

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ülesannete laadimine ebaõnnestus: ${response.status}`);
        }

        const tasks = await response.json();
        taskList.innerHTML = "";
        tasks.forEach(renderTask);
    } catch (error) {
        console.error("Viga ülesannete laadimisel:", error);
    }
}

// ✅ **Lisa uus ülesanne serverisse**
async function createTask(task) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error(`Ülesande loomine ebaõnnestus: ${response.status}`);
        }

        const newTask = await response.json();
        renderTask(newTask);
    } catch (error) {
        console.error("Viga ülesande loomisel:", error);
    }
}

// ✅ **Kustuta ülesanne serverist**
async function deleteTask(taskId) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ülesande kustutamine ebaõnnestus: ${response.status}`);
        }
    } catch (error) {
        console.error("Viga ülesande kustutamisel:", error);
    }
}

// ✅ **Parandatud ülesannete kuvamine Ant Design stiilis**
function renderTask(task) {
    const taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute("data-template");
    taskRow.style.display = "block";
    taskRow.setAttribute("data-id", task.id);

    // ✅ Sisestame ülesande nime
    const nameInput = taskRow.querySelector("[name='name']");
    nameInput.value = task.title;

    nameInput.addEventListener("input", async () => {
        task.title = nameInput.value;
        await updateTask(task);
    });

    // ✅ Märkimine tehtuks
    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.marked_as_done;

    checkbox.addEventListener("change", async () => {
        task.marked_as_done = checkbox.checked;
        await updateTask(task);
    });

    // ✅ Kustutamise nupp
    const deleteButton = taskRow.querySelector(".delete-task");
    deleteButton.addEventListener("click", async () => {
        await deleteTask(task.id);
        taskRow.remove();
    });

    taskList.appendChild(taskRow);
}

// ✅ **Kui kasutaja pole sisse logitud, kuvame sisselogimise vormi**
function showLoginForm() {
    document.body.innerHTML = `
        <h2>Logi sisse</h2>
        <input type="text" id="username" placeholder="Kasutajanimi">
        <input type="password" id="password" placeholder="Parool">
        <button onclick="submitLogin()">Logi sisse</button>
    `;
}

// ✅ **Käivita sisselogimine, kui vajutatakse nuppu**
function submitLogin() {
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;
    login(username, password);
}

// ✅ **Uuenda ülesannet serveris**
async function updateTask(task) {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${API_URL}/tasks/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error(`Ülesande uuendamine ebaõnnestus: ${response.status}`);
        }
    } catch (error) {
        console.error("Viga ülesande uuendamisel:", error);
    }
}


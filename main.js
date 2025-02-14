// API URL ja kasutaja token
const API_URL = "https://demo2.z-bit.ee/tasks";
const TOKEN = "JHrfPxZr9pPvjCGcccuJseGjMNpr6H88"; // Asenda oma tokeniga

// Globaalne muutujate deklaratsioon
let tasks = [];
let taskList;
let addTask;

// Kui leht on täielikult laaditud, alustame andmete laadimist
window.addEventListener("load", async () => {
    taskList = document.querySelector("#task-list");
    addTask = document.querySelector("#add-task");

    if (!taskList || !addTask) {
        console.error("HTML elemendid puuduvad!");
        return;
    }

    // Laeme ülesanded serverist
    await loadTasks();

    // Kui vajutatakse "Add Task" nuppu, lisame uue ülesande
    addTask.addEventListener("click", async () => {
        const newTask = {
            title: `Task ${tasks.length + 1}`,
            desc: "",
            marked_as_done: false
        };
        await createTask(newTask);
    });
});

// ✅ **1. Funktsioon ülesannete laadimiseks serverist**
async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ülesannete laadimine ebaõnnestus: ${response.status}`);
        }

        tasks = await response.json();
        taskList.innerHTML = ""; // Tühjendame nimekirja enne kuvamist
        tasks.forEach(renderTask);
    } catch (error) {
        console.error("Viga ülesannete laadimisel:", error);
    }
}

// ✅ **2. Funktsioon ühe ülesande lisamiseks serverisse**
async function createTask(task) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error(`Ülesande loomine ebaõnnestus: ${response.status}`);
        }

        const newTask = await response.json();
        tasks.push(newTask);
        renderTask(newTask);
    } catch (error) {
        console.error("Viga ülesande loomisel:", error);
    }
}

// ✅ **3. Funktsioon ülesande uuendamiseks serveris**
async function updateTask(task) {
    try {
        const response = await fetch(`${API_URL}/${task.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
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

// ✅ **4. Funktsioon ülesande kustutamiseks serverist**
async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Ülesande kustutamine ebaõnnestus: ${response.status}`);
        }
    } catch (error) {
        console.error("Viga ülesande kustutamisel:", error);
    }
}

// ✅ **5. Funktsioon ülesande HTML-rea loomiseks**
function createTaskRow(task) {
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute("data-template");
    taskRow.style.display = "block";
    taskRow.setAttribute("data-id", task.id);

    const nameInput = taskRow.querySelector("[name='name']");
    nameInput.value = task.title;

    nameInput.addEventListener("input", async () => {
        task.title = nameInput.value;
        await updateTask(task);
    });

    const checkbox = taskRow.querySelector("[name='completed']");
    checkbox.checked = task.marked_as_done;

    checkbox.addEventListener("change", async () => {
        task.marked_as_done = checkbox.checked;
        await updateTask(task);
    });

    const deleteButton = taskRow.querySelector(".delete-task");
    deleteButton.addEventListener("click", async () => {
        await deleteTask(task.id);
        taskRow.remove();
    });

    return taskRow;
}

// ✅ **6. Funktsioon ülesande kuvamiseks lehel**
function renderTask(task) {
    const taskRow = createTaskRow(task);
    taskList.appendChild(taskRow);
}

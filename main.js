// Laeme ülesanded LocalStorage'st või algväärtusega, kui LocalStorage on tühi
const tasks = JSON.parse(localStorage.getItem('tasks')) || [
    {
        id: 1,
        name: 'Task 1',
        completed: false // Märgib, kas ülesanne on tehtud või mitte
    },
    {
        id: 2,
        name: 'Task 2',
        completed: true // See ülesanne on märgitud tehtuks
    }
];

// Leiame viimase ülesande ID; see aitab uutele ülesannetele ID-d määrata
let lastTaskId = tasks.length ? tasks[tasks.length - 1].id : 0;

// Defineerime hiljem kasutatavad elemendid
let taskList;
let addTask;

// Kui leht on täielikult laetud, alustame ülesannete kuvamist
window.addEventListener('load', () => {
    // Viited HTML-i elementidele
    taskList = document.querySelector('#task-list'); // Nimekiri ülesannete kuvamiseks
    addTask = document.querySelector('#add-task'); // Nupp uue ülesande lisamiseks

    // Kuvame kõik olemasolevad ülesanded (nt LocalStorage'st)
    tasks.forEach(renderTask);

    // Lisame event listeneri, et lisada uus ülesanne, kui nuppu vajutatakse
    addTask.addEventListener('click', () => {
        const task = createTask(); // Loome uue ülesande andmestikku
        const taskRow = createTaskRow(task); // Loome ülesande jaoks HTML-elemendi
        taskList.appendChild(taskRow); // Lisame uue ülesande HTML-i listi
        saveTasks(); // Salvestame muudatused LocalStorage'i
    });
});

// Funktsioon ühe ülesande kuvamiseks lehel
function renderTask(task) {
    const taskRow = createTaskRow(task); // Loome HTML-i elemendi ülesandele
    taskList.appendChild(taskRow); // Lisame selle listi
}

// Loob uue ülesande ja lisab selle `tasks` massiivi
function createTask() {
    lastTaskId++; // Suurendame viimase ID väärtust, et tagada unikaalsus
    const task = {
        id: lastTaskId, // Määrame ülesandele ID
        name: 'Task ' + lastTaskId, // Määrame ülesande nime
        completed: false // Vaikimisi pole ülesanne tehtud
    };
    tasks.push(task); // Lisame ülesande massiivi
    return task; // Tagastame loodud ülesande
}

// Loob ülesande jaoks HTML-elemendi
function createTaskRow(task) {
    // Kasutame malli (`data-template="task-row"`) ülesande rida loomiseks
    let taskRow = document.querySelector('[data-template="task-row"]').cloneNode(true);
    taskRow.removeAttribute('data-template'); // Eemaldame malli atribuudid

    // Täidame vormiväljad andmetega
    const name = taskRow.querySelector("[name='name']"); // Viide nime sisestusväljale
    name.value = task.name; // Määrame sisestusvälja väärtuseks ülesande nime

    const checkbox = taskRow.querySelector("[name='completed']"); // Viide checkboxile
    checkbox.checked = task.completed; // Märgime, kas ülesanne on tehtud

    // Lisame checkboxile sündmuse, et uuendada `completed` olekut
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked; // Uuendame ülesande staatust
        saveTasks(); // Salvestame muudatused LocalStorage'i
    });

    // Lisame kustutamise nupu sündmuse
    const deleteButton = taskRow.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => {
        taskList.removeChild(taskRow); // Eemaldame ülesande HTML-st
        tasks.splice(tasks.findIndex(t => t.id === task.id), 1); // Eemaldame ülesande massiivist
        saveTasks(); // Salvestame muudatused LocalStorage'i
    });

    // Rakendame checkboxi kujunduse (kasutatakse malli põhjal)
    hydrateAntCheckboxes(taskRow);
    return taskRow; // Tagastame loodud HTML-elemendi
}

// Salvestab ülesanded LocalStorage'i
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Teisendame massiivi JSON-formaati ja salvestame
}

// Loob spetsiaalse checkboxi malli põhjal
function createAntCheckbox() {
    const checkbox = document.querySelector('[data-template="ant-checkbox"]').cloneNode(true); // Kasutame checkboxi malli
    checkbox.removeAttribute('data-template'); // Eemaldame malli atribuudi
    hydrateAntCheckboxes(checkbox); // Lisame checkboxile vajalikud sündmused
    return checkbox; // Tagastame loodud checkboxi
}

/**
 * Lisab eridisainiga checkboxile vajalikud sündmused
 * @param {HTMLElement} element Checkboxi wrapper või konteiner
 */
function hydrateAntCheckboxes(element) {
    const elements = element.querySelectorAll('.ant-checkbox-wrapper'); // Leia kõik checkboxid konteineris
    for (let i = 0; i < elements.length; i++) {
        let wrapper = elements[i];

        // Kui element on juba töödeldud, siis jätame selle vahele
        if (wrapper.__hydrated) continue;
        wrapper.__hydrated = true; // Märgime, et element on töödeldud

        const checkbox = wrapper.querySelector('.ant-checkbox'); // Leia checkboxi elemendid
        const input = wrapper.querySelector('.ant-checkbox-input'); // Leia sisendväli

        // Kui sisend on märgitud, lisame klassi `ant-checkbox-checked`
        if (input.checked) {
            checkbox.classList.add('ant-checkbox-checked');
        }

        // Lisame sündmuse sisendi muutmiseks
        input.addEventListener('change', () => {
            checkbox.classList.toggle('ant-checkbox-checked'); // Lülitame `checked` klassi
        });
    }
}

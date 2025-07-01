// Utilidades para fechas
function getNextDailyReset() {
    const now = new Date();
    let next = new Date(now);
    next.setHours(2, 0, 0, 0);
    if (now >= next) {
        next.setDate(next.getDate() + 1);
    }
    return next.getTime();
}

function getNextWeeklyReset() {
    const now = new Date();
    let next = new Date(now);
    next.setHours(2, 0, 0, 0);
    // 4 = jueves
    const day = now.getDay();
    let daysUntilThursday = (4 - day + 7) % 7;
    if (daysUntilThursday === 0 && now >= next) {
        daysUntilThursday = 7;
    }
    next.setDate(next.getDate() + daysUntilThursday);
    return next.getTime();
}

function saveState(type) {
    const checkboxes = document.querySelectorAll('input.' + type);
    const state = Array.from(checkboxes).map(cb => cb.checked);
    localStorage.setItem('estado_' + type, JSON.stringify(state));
}

function loadState(type) {
    const checkboxes = document.querySelectorAll('input.' + type);
    const state = JSON.parse(localStorage.getItem('estado_' + type) || '[]');
    checkboxes.forEach((cb, i) => {
        cb.checked = !!state[i];
    });
}

function resetState(type) {
    const checkboxes = document.querySelectorAll('input.' + type);
    checkboxes.forEach(cb => cb.checked = false);
    saveState(type);
}

function setupCheckboxes(type) {
    const checkboxes = document.querySelectorAll('input.' + type);
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => saveState(type));
    });
}

function setupResets() {
    // Diarias
    let nextDaily = parseInt(localStorage.getItem('nextDailyReset') || '0', 10);
    const now = Date.now();
    if (now > nextDaily) {
        resetState('diaria');
        nextDaily = getNextDailyReset();
        localStorage.setItem('nextDailyReset', nextDaily);
    }
    // Semanales
    let nextWeekly = parseInt(localStorage.getItem('nextWeeklyReset') || '0', 10);
    if (now > nextWeekly) {
        resetState('semanal');
        nextWeekly = getNextWeeklyReset();
        localStorage.setItem('nextWeeklyReset', nextWeekly);
    }
    // Programar siguiente chequeo
    setTimeout(setupResets, 60 * 1000); // Chequea cada minuto
}

document.addEventListener('DOMContentLoaded', () => {
    loadState('diaria');
    loadState('semanal');
    loadState('estatica');
    setupCheckboxes('diaria');
    setupCheckboxes('semanal');
    setupCheckboxes('estatica');
    setupResets();
});

// --- Gestión de tareas dinámicas ---
const btnGestionar = document.getElementById('gestionar-tareas-btn');
const modal = document.getElementById('modal-tarea');
const cerrarModal = document.getElementById('cerrar-modal');
const formTarea = document.getElementById('form-tarea');
const selectApartado = document.getElementById('apartado');
const radioAgregar = document.getElementById('agregar');
const radioQuitar = document.getElementById('quitar');
const campoNombre = document.getElementById('campo-nombre');
const campoQuitar = document.getElementById('campo-quitar');
const inputNombre = document.getElementById('nombre-tarea');
const selectQuitar = document.getElementById('tarea-existente');

// Guardar y cargar tareas personalizadas
function getCustomTasks(type) {
    return JSON.parse(localStorage.getItem('custom_' + type) || '[]');
}
function setCustomTasks(type, arr) {
    localStorage.setItem('custom_' + type, JSON.stringify(arr));
}

function renderCustomTasks(type) {
    const ul = document.getElementById(type + 's-list');
    // Elimina tareas personalizadas previas
    ul.querySelectorAll('li.custom').forEach(li => li.remove());
    const custom = getCustomTasks(type);
    custom.forEach((nombre, idx) => {
        const li = document.createElement('li');
        li.classList.add('custom');
        li.innerHTML = `<label><input type="checkbox" class="${type}"> ${nombre}</label>`;
        ul.appendChild(li);
    });
    // Recargar eventos y estado
    loadState(type);
    setupCheckboxes(type);
}

function updateQuitarSelect() {
    const type = selectApartado.value;
    const ul = document.getElementById(type + 's-list');
    // Tareas base
    const baseTasks = Array.from(ul.querySelectorAll('li:not(.custom) label')).map(lab => lab.textContent.trim());
    // Tareas custom
    const customTasks = getCustomTasks(type);
    selectQuitar.innerHTML = '';
    [...baseTasks, ...customTasks].forEach((nombre, i) => {
        const opt = document.createElement('option');
        opt.value = i < baseTasks.length ? 'base-' + i : 'custom-' + (i - baseTasks.length);
        opt.textContent = nombre;
        selectQuitar.appendChild(opt);
    });
}

btnGestionar.onclick = () => {
    modal.style.display = 'block';
    radioAgregar.checked = true;
    campoNombre.style.display = '';
    campoQuitar.style.display = 'none';
    inputNombre.value = '';
    updateQuitarSelect();
};
cerrarModal.onclick = () => {
    modal.style.display = 'none';
};
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
};
selectApartado.onchange = updateQuitarSelect;
radioAgregar.onchange = () => {
    campoNombre.style.display = '';
    campoQuitar.style.display = 'none';
};
radioQuitar.onchange = () => {
    campoNombre.style.display = 'none';
    campoQuitar.style.display = '';
    updateQuitarSelect();
};

formTarea.onsubmit = function(e) {
    e.preventDefault();
    const type = selectApartado.value;
    if (radioAgregar.checked) {
        const nombre = inputNombre.value.trim();
        if (!nombre) return;
        const custom = getCustomTasks(type);
        custom.push(nombre);
        setCustomTasks(type, custom);
        renderCustomTasks(type);
    } else {
        // Quitar
        const val = selectQuitar.value;
        if (val.startsWith('base-')) {
            // No se puede quitar tarea base
            alert('No puedes quitar tareas base.');
            return;
        } else {
            const idx = parseInt(val.replace('custom-', ''), 10);
            const custom = getCustomTasks(type);
            custom.splice(idx, 1);
            setCustomTasks(type, custom);
            renderCustomTasks(type);
        }
    }
    modal.style.display = 'none';
};

// Renderizar tareas personalizadas al cargar
['diaria','semanal','estatica'].forEach(renderCustomTasks); 
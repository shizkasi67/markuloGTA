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
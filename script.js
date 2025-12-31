let lastPoint = null;
let currentResults = [];
const canvas = document.getElementById("coordinate-plane");
const ctx = canvas.getContext("2d");

function drawCoordinatePlane(r) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#D1D5C8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    console.log("Перерисовываем план");
    const centerx = canvas.width / 2;
    const centery = canvas.height / 2;
    const radius = r * 30;
    const k = 30;
    ctx.strokeStyle = "#2A3E33";
    ctx.moveTo(0, centery);
    ctx.lineTo(canvas.width, centery);
    ctx.stroke();
    ctx.moveTo(centerx, 0);
    ctx.lineTo(centerx, canvas.height);
    ctx.stroke();
    ctx.fillStyle = '#546B51';
    ctx.fillRect(centerx - (r * k), centery, r * k, r * k * 0.5);
    ctx.beginPath();
    ctx.moveTo(centerx - (r * k * 0.5), centery)
    ctx.lineTo(centerx, centery - (r * k * 0.5))
    ctx.lineTo(centerx, centery);
    ctx.closePath();
    ctx.fillStyle = '#546B51';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerx, centery, radius, -90 * Math.PI / 180, 0);
    ctx.lineTo(centerx, centery);
    ctx.closePath();

    ctx.fillStyle = '#546B51';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width - 10, centery - 5);
    ctx.lineTo(canvas.width, centery);
    ctx.lineTo(canvas.width - 10, centery + 5);
    ctx.fillStyle = '#2A3E33';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerx - 5, 10);
    ctx.lineTo(centerx, 0);
    ctx.lineTo(centerx + 5, 10);
    ctx.fillStyle = '#2A3E33';
    ctx.fill();

    for (let i = 1; i <= 6; i++) {
        ctx.fillText(i.toString(), centerx + i * k, centery + 20);
        ctx.fillText((-i).toString(), centerx - i * k, centery + 20);
    }

    for (let i = 1; i <= 6; i++) {
        ctx.fillText(i.toString(), centerx + 10, centery - i * k);
        ctx.fillText((-i).toString(), centerx + 10, centery + i * k);
    }

    ctx.beginPath();

    for (let i = 1; i <= 6; i++) {
        ctx.moveTo(centerx + i * k, centery - 5);
        ctx.lineTo(centerx + i * k, centery + 5);
        ctx.moveTo(centerx - i * k, centery - 5);
        ctx.lineTo(centerx - i * k, centery + 5);
    }

    for (let i = 1; i <= 6; i++) {
        ctx.moveTo(centerx - 5, centery - i * k);
        ctx.lineTo(centerx + 5, centery - i * k);
        ctx.moveTo(centerx - 5, centery + i * k);
        ctx.lineTo(centerx + 5, centery + i * k);
    }

    ctx.stroke();

    ctx.fillStyle = "black";
    ctx.fillText("x", canvas.width - 10, centery - 10);

    ctx.fillText("y", centerx + 10, 10);
}

function drawPoint(x, y, r) {
    console.log("Рисуем:" + x + " " + y);
    const centerx = canvas.width / 2;
    const centery = canvas.height / 2;
    const k = 30;
    ctx.beginPath();
    ctx.moveTo(centerx + (x * k), centery - (y * k));
    ctx.arc(centerx + (x * k), centery - (y * k), 3, 0, Math.PI * 2);
    ctx.fillStyle = '#E2CA76';
    ctx.stroke();
    ctx.fill();
}

function validateNumericInput(event, min, max, isRadius = false) {
    const input = event.target;
    let value = input.value;
    const key = event.key;
    if (!/[\d\.\-]/.test(key) &&
        key !== 'Backspace' &&
        key !== 'Delete' &&
        key !== 'Tab' &&
        key !== 'ArrowLeft' &&
        key !== 'ArrowRight' &&
        key !== 'ArrowUp' &&
        key !== 'ArrowDown') {
        event.preventDefault();
        return;
    }
    if (isRadius && key === '-') {
        event.preventDefault();
        return;
    }
    setTimeout(() => {
        let testValue = input.value;
        if (testValue === '-' || testValue === '.' || testValue === '-.') {
            return;
        }

        const numValue = parseFloat(testValue);
        if (testValue && (isNaN(numValue) || numValue <= min || numValue >= max)) {
            input.classList.add('error');
            showError(input.id + 'Error', `Значение должно быть от ${min} до ${max}`);
        } else {
            input.classList.remove('error');
            clearError(input.id + 'Error');
        }
    }, 10);
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function clearError(elementId) {
    document.getElementById(elementId).textContent = '';
}

function redirectToIndex2() {
    window.location.href = 'index2.html';
}

document.addEventListener('DOMContentLoaded', function () {
    const headerImage = document.querySelector('.header-image');
    if (headerImage) {
        headerImage.addEventListener('click', redirectToIndex2);
    }
});

function validateForm() {
    const errors = [];

    // Проверка координаты X
    const xValue = document.getElementById('x').value;
    if (!xValue) {
        errors.push('Координата X не выбрана');
    }

    // Проверка координаты Y
    const yValue = document.getElementById('y').value;
    if (!yValue) {
        errors.push('Координата Y не введена');
    } else if (isNaN(yValue) || yValue < -3 || yValue > 3) {
        errors.push('Координата Y должна быть числом от -3 до 3');
    }

    // Проверка радиуса R
    const rValue = document.querySelector('input[name="r"]:checked');
    if (!rValue) {
        errors.push('Радиус R не выбран');
    }

    return errors;
}

// Функция для показа уведомления (аналог showNotification из примера)
function showNotification(message, isError = true) {
    const statusBar = document.getElementById('status');
    
    if (isError) {
        statusBar.textContent = message;
        statusBar.style.backgroundColor = '#ffeaea';
        statusBar.style.borderTopColor = '#e74c3c';
        statusBar.style.color = '#c0392b';
    } else {
        // Успешные сообщения не показываем, как вы просили
        return;
    }
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        statusBar.textContent = 'Готов к работе. Введите координаты точки и радиус для проверки.';
        statusBar.style.backgroundColor = '';
        statusBar.style.borderTopColor = '';
        statusBar.style.color = '';
    }, 5000);
}

// Функция для скрытия уведомления
function hideNotification() {
    const statusBar = document.getElementById('status');
    statusBar.textContent = 'Готов к работе. Введите координаты точки и радиус для проверки.';
    statusBar.style.backgroundColor = '';
    statusBar.style.borderTopColor = '';
    statusBar.style.color = '';
}

// Упрощенная функция showStatus (только для ошибок)
function showStatus(message, type = 'info') {
    if (type === 'error') {
        showNotification(message, true);
    }
    // success и loading не показываем
}

async function submitForm(event) {
    event.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
        showNotification(errors.join('. '), true);
        return;
    }

    const xValue = document.getElementById('x').value;
    const yValue = document.getElementById('y').value;
    const rValue = document.querySelector('input[name="r"]:checked').value;

    console.log('Form data:', { x: xValue, y: yValue, r: rValue });

    const formData = new URLSearchParams();
    formData.append('x', xValue);
    formData.append('y', yValue);
    formData.append('r', rValue);

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    
    const x = parseFloat(xValue);
    const y = parseFloat(yValue);
    const currentR = parseFloat(rValue);

    drawCoordinatePlane(currentR);

    try {
        const response = await fetch('fcgi-bin/web.jar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        let data;

        try {
            data = JSON.parse(responseText);
            console.log('Parsed data:', data);
        } catch (jsonError) {
            console.error('JSON parse error:', jsonError);
            data = {
                results: [{
                    x: x,
                    y: y,
                    r: currentR,
                    result: "Ошибка данных",
                    time: new Date().toLocaleString(),
                    scriptTime: 0
                }]
            };
        }

        if (data.error) {
            showStatus(`Ошибка: ${data.error}`, 'error');
        } else {
            const lastResult = data.results && data.results.length > 0
                ? data.results[0]
                : null;

            lastPoint = {
                x: x,
                y: y,
                r: currentR,
                result: lastResult.result,
                time: lastResult.time,
                scriptTime: lastResult.scriptTime
            };

            console.log('Last point to draw:', lastPoint);

            updateResultsTable(data.results || []);

            drawCoordinatePlane(currentR);
            drawPoint(x, y, currentR);
        }

    } catch (error) {
        console.error('Error:', error);
        showStatus('Ошибка связи с сервером', 'error');

        const currentR = parseFloat(rValue);
        lastPoint = {
            x: parseFloat(xValue),
            y: parseFloat(yValue),
            r: currentR
        };

        drawCoordinatePlane(currentR);
        drawPoint(x, y, currentR);

    } finally {
        submitBtn.disabled = false;
    }
}

function updateResultsTable(results) {
    const tableBody = document.getElementById('resultsTable');

    if (!results || results.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">Нет данных</td></tr>';
        return;
    }

    let html = '';
    results.forEach(point => {
        if (!point) return;

        const isHit = point.result === "Попадание";

        html += `
            <tr>
                <td>${point.x !== undefined ? point.x.toFixed(2) : '-'}</td>
                <td>${point.y !== undefined ? point.y.toFixed(2) : '-'}</td>
                <td>${point.r !== undefined ? point.r.toFixed(2) : '-'}</td>
                <td class="${isHit ? 'hit' : 'miss'}">${point.result || '-'}</td>
                <td>${point.time || '-'}</td>
                <td>${point.scriptTime || 0} мкс</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html || '<tr><td colspan="6">Нет данных</td></tr>';
}

function loadHistory() {
    fetch('fcgi-bin/web.jar', {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Получены данные:", data);
            if (data.results) {
                updateResultsTable(data.results);
            } else {
                console.warn("Нет данных results в ответе");
            }
        })
        .catch(error => {
            console.error('Ошибка при загрузке истории: ', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.x-button').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.x-button').forEach(btn => {
                btn.classList.remove('selected');
            });

            this.classList.add('selected');

            document.getElementById('x').value = this.getAttribute('data-value');
        });
    });

    document.getElementById('y').addEventListener('keypress', (e) =>
        validateNumericInput(e, -5, 5));

    document.querySelectorAll('.radio-option').forEach(option => {
        option.addEventListener('click', function () {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            document.querySelectorAll('.radio-option').forEach(opt => {
                opt.classList.remove('selected');
            });

            this.classList.add('selected');
        });
    });

    document.getElementById('y').addEventListener('keypress', (e) =>
        validateNumericInput(e, -3, 3));
        
    document.getElementById('pointForm').addEventListener('submit', submitForm);

    document.getElementById('y').addEventListener('blur', function() {
        const errors = validateForm();
        if (errors.length > 0) {
            showNotification(errors.join('. '), true);
        }
    });

    loadHistory();
});
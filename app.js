// Variables globales
let players = [];
let winningNumbers = [];
let selectedFile = null;
const PREMIO_POR_JUGADA = 30; // 30 BS por jugada

// Elementos del DOM
const playersListBody = document.getElementById('players-list');
const generateWinnersBtn = document.getElementById('generate-winners');
const selectFileBtn = document.getElementById('select-file');
const excelFileInput = document.getElementById('excel-file');
const fileNameSpan = document.getElementById('file-name');
const importDataBtn = document.getElementById('import-data');
const clearDataBtn = document.getElementById('clear-data');
const numbersGrid = document.getElementById('numbers-grid');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadDataFromStorage();
});

function initializeApp() {
    createNumbersGrid();
    
    // Event listeners
    selectFileBtn.addEventListener('click', () => excelFileInput.click());
    excelFileInput.addEventListener('change', handleFileSelect);
    importDataBtn.addEventListener('click', importExcelData);
    clearDataBtn.addEventListener('click', clearAllData);
    generateWinnersBtn.addEventListener('click', generateWinningNumbers);
    

}

function createNumbersGrid() {
    numbersGrid.innerHTML = '';
    const allNumbers = Array.from({length: 37}, (_, i) => i).concat(['00']);
    
    // Ajustar el orden para que coincida con la imagen
    const orderedNumbers = [
        1, 2, 4, 5, 6, 8, 10, 11, 13, '', '', '',
        14, 15, 17, 18, 19, 20, 21, 22, 24, 25, 26, '',
        27, 28, 29, 30, 31, 33, 35, 36, 0, '00', ''
    ];

    allNumbers.forEach(number => {
        const numberItem = document.createElement('div');
        numberItem.className = 'number-item';
        numberItem.textContent = number;
        numberItem.dataset.number = number;
        numbersGrid.appendChild(numberItem);
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        // Verificar el tipo de archivo
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
            'text/csv', // .csv
            'application/csv'
        ];
        
        if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alert('Por favor selecciona un archivo Excel válido (.xlsx, .xls) o CSV (.csv)');
            excelFileInput.value = '';
            return;
        }
        
        selectedFile = file;
        fileNameSpan.textContent = file.name;
        importDataBtn.disabled = false;
        
        // Mostrar información del archivo
        console.log('Archivo seleccionado:', file.name, 'Tamaño:', file.size, 'bytes');
    }
}

function importExcelData() {
    if (!selectedFile) {
        alert('Por favor selecciona un archivo Excel primero');
        return;
    }

    // Mostrar indicador de carga
    importDataBtn.textContent = 'Importando...';
    importDataBtn.disabled = true;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            console.log('Iniciando lectura del archivo...');
            const data = new Uint8Array(e.target.result);
            console.log('Datos leídos, tamaño:', data.length);
            
            let jsonData;
            
            // Verificar si es un archivo CSV
            if (selectedFile.name.toLowerCase().endsWith('.csv')) {
                console.log('Procesando archivo CSV...');
                const csvText = new TextDecoder().decode(data);
                jsonData = processCSVData(csvText);
            } else {
                console.log('Procesando archivo Excel...');
                const workbook = XLSX.read(data, { type: 'array' });
                console.log('Workbook creado, hojas disponibles:', workbook.SheetNames);
                
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            }
            
            console.log('Datos JSON extraídos, filas:', jsonData.length);
            console.log('Primeras 3 filas:', jsonData.slice(0, 3));
            
            processExcelData(jsonData);
            
        } catch (error) {
            console.error('Error detallado al leer el archivo:', error);
            alert(`Error al leer el archivo: ${error.message}\n\nVerifica que el archivo no esté corrupto y tenga el formato correcto.\n\nTipos de archivo soportados: .xlsx, .xls, .csv`);
        } finally {
            // Restaurar el botón
            importDataBtn.textContent = 'Importar Datos';
            importDataBtn.disabled = false;
        }
    };
    
    reader.onerror = function() {
        console.error('Error al leer el archivo');
        alert('Error al leer el archivo. Intenta con otro archivo.');
        importDataBtn.textContent = 'Importar Datos';
        importDataBtn.disabled = false;
    };
    
    reader.readAsArrayBuffer(selectedFile);
}

function processCSVData(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    for (let line of lines) {
        line = line.trim();
        if (line) {
            // Dividir por comas, pero manejar comas dentro de comillas
            const row = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    row.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            row.push(current.trim()); // Agregar el último campo
            
            result.push(row);
        }
    }
    
    return result;
}

function processExcelData(jsonData) {
    console.log('Procesando datos Excel...');
    console.log('Total de filas:', jsonData.length);
    
    players = [];
    let processedRows = 0;
    let skippedRows = 0;
    let errors = [];
    
    // Determinar la fila de inicio (saltar encabezados si existen)
    let startRow = 0;
    if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        if (firstRow && firstRow.length > 0) {
            const firstCell = String(firstRow[0] || '').toLowerCase();
            if (firstCell.includes('nombre') || firstCell.includes('jugador') || firstCell.includes('#')) {
                startRow = 1;
                console.log('Saltando encabezado, comenzando desde fila 1');
            }
        }
    }
    
    for (let i = startRow; i < jsonData.length; i++) {
        const row = jsonData[i];
        processedRows++;
        
        // Verificar que la fila tenga datos
        if (!row || row.length < 2) {
            skippedRows++;
            continue;
        }
        
        // Extraer número de jugador y nombre
        const playerNumber = parseInt(row[0]);
        const playerName = String(row[1] || '').trim();
        
        // Validar datos básicos
        if (isNaN(playerNumber) || !playerName) {
            skippedRows++;
            errors.push(`Fila ${i + 1}: Número de jugador inválido o nombre vacío`);
            continue;
        }
        
        // Extraer números de animales (columnas 2-7)
        const animals = [];
        for (let j = 2; j <= 7; j++) {
            if (row[j] !== undefined && row[j] !== null && row[j] !== '') {
                let animal = String(row[j]).trim();
                
                // Validar que sea un número válido (0-36 o 00)
                if (animal === '00') {
                    animals.push(animal);
                } else {
                    const numAnimal = parseInt(animal);
                    if (!isNaN(numAnimal) && numAnimal >= 0 && numAnimal <= 36) {
                        animals.push(animal);
                    } else {
                        console.log(`Número inválido en fila ${i + 1}, columna ${j + 1}: ${animal}`);
                    }
                }
            }
        }
        
        // Solo agregar jugador si tiene al menos un animal válido
        if (animals.length > 0) {
            players.push({
                number: playerNumber,
                name: playerName,
                animals: animals,
                timestamp: new Date().toISOString()
            });
        } else {
            skippedRows++;
            errors.push(`Fila ${i + 1}: No se encontraron números válidos de animales`);
        }
    }
    
    console.log(`Procesamiento completado:`);
    console.log(`- Filas procesadas: ${processedRows}`);
    console.log(`- Filas omitidas: ${skippedRows}`);
    console.log(`- Jugadores válidos: ${players.length}`);
    console.log(`- Errores encontrados: ${errors.length}`);
    
    if (errors.length > 0) {
        console.log('Errores:', errors);
    }
    
    renderPlayers();
    updateStats();
    saveDataToStorage();
    
    // Mostrar resumen al usuario
    let message = `${players.length} jugadores importados exitosamente`;
    if (skippedRows > 0) {
        message += `\n${skippedRows} filas omitidas (datos inválidos)`;
    }
    if (errors.length > 0) {
        message += `\n${errors.length} errores encontrados`;
    }
    
    alert(message);
    
    // Limpiar estado del archivo
    selectedFile = null;
    fileNameSpan.textContent = '';
    importDataBtn.disabled = true;
    excelFileInput.value = '';
}

function renderPlayers() {
    playersListBody.innerHTML = '';
    
    if (players.length === 0) {
        playersListBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">No hay jugadores. Importa un archivo Excel.</td></tr>';
        return;
    }
    
    // Crear una copia de los jugadores para ordenar
    let playersToRender = [...players];
    
    // Si hay números ganadores, ordenar por número de aciertos
    if (winningNumbers.length > 0) {
        playersToRender.sort((a, b) => {
            const aHits = a.animals.filter(animal => winningNumbers.includes(String(animal))).length;
            const bHits = b.animals.filter(animal => winningNumbers.includes(String(animal))).length;
            
            // Primero los ganadores completos (todos los números)
            const aIsCompleteWinner = aHits === winningNumbers.length;
            const bIsCompleteWinner = bHits === winningNumbers.length;
            
            if (aIsCompleteWinner && !bIsCompleteWinner) return -1;
            if (!aIsCompleteWinner && bIsCompleteWinner) return 1;
            
            // Si ambos son ganadores completos o ambos no, ordenar por aciertos
            if (aHits !== bHits) {
                return bHits - aHits; // Más aciertos primero
            } else {
                return a.name.localeCompare(b.name); // Alfabético si tienen los mismos aciertos
            }
        });
    }
    
    playersToRender.forEach((player, index) => {
        const row = document.createElement('tr');
        
        const hits = winningNumbers.length > 0 
            ? player.animals.filter(animal => winningNumbers.includes(String(animal))).length 
            : 0;
        
        // Solo es ganador si tiene TODOS los números ganadores
        const isWinner = hits === winningNumbers.length && hits > 0;
        if (isWinner) {
            row.classList.add('winner-row');
        }
        
        // Agregar información de aciertos
        let cells = `<td>${player.number}</td><td>${player.name}`;
        if (hits > 0) {
            cells += ` <span class="hits-badge">(${hits}/${winningNumbers.length} acierto${hits > 1 ? 's' : ''})</span>`;
        }
        cells += `</td>`;
        
        // Agregar indicador de posición solo para ganadores completos
        if (winningNumbers.length > 0 && isWinner) {
            const winners = playersToRender.filter(p => {
                const pHits = p.animals.filter(animal => winningNumbers.includes(String(animal))).length;
                return pHits === winningNumbers.length;
            });
            
            const position = winners.indexOf(player) + 1;
            
            if (position <= 3) { // Solo mostrar para los primeros 3 lugares
                const positionClass = position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze';
                cells = `<td class="position-cell ${positionClass}">${position}°</td>` + cells;
            } else {
                cells = `<td></td>` + cells;
            }
        } else {
            cells = `<td></td>` + cells;
        }
        
        for (let i = 0; i < 6; i++) {
            const animal = player.animals[i] || '';
            const isWinningAnimal = winningNumbers.includes(String(animal));
            cells += `<td class="${isWinningAnimal ? 'winning-animal-cell' : ''}">${animal}</td>`;
        }
        
        row.innerHTML = cells;
        playersListBody.appendChild(row);
    });
}

function generateWinningNumbers() {
    // Crear modal para selección manual de números
    showNumberSelectionModal();
}

function showNumberSelectionModal() {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'number-selection-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Selecciona los números ganadores</h3>
            <div class="number-count-section">
                <label for="number-count">Cantidad de números ganadores:</label>
                <input type="number" id="number-count" min="1" max="10" value="6" class="number-input">
                <button id="update-count" class="btn">Actualizar</button>
            </div>
            <p>Haz clic en los números que quieres que sean ganadores:</p>
            <div class="modal-numbers-grid" id="modal-numbers-grid"></div>
            <div class="modal-controls">
                <button id="confirm-numbers" class="btn">Confirmar Números</button>
                <button id="cancel-selection" class="btn">Cancelar</button>
            </div>
            <div class="selected-numbers-display">
                <p>Números seleccionados: <span id="selected-numbers-list">Ninguno</span></p>
                <p>Máximo permitido: <span id="max-numbers">6</span></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Crear grilla de números en el modal
    const modalGrid = document.getElementById('modal-numbers-grid');
    const allNumbers = Array.from({length: 37}, (_, i) => String(i)).concat(['00']);
    
    allNumbers.forEach(number => {
        const numberItem = document.createElement('div');
        numberItem.className = 'modal-number-item';
        numberItem.textContent = number;
        numberItem.dataset.number = number;
        
        // Si ya hay números ganadores, marcarlos como seleccionados
        if (winningNumbers.includes(number)) {
            numberItem.classList.add('selected');
        }
        
        numberItem.addEventListener('click', () => toggleNumberSelection(numberItem));
        modalGrid.appendChild(numberItem);
    });
    
    // Event listeners para los botones
    document.getElementById('confirm-numbers').addEventListener('click', confirmNumberSelection);
    document.getElementById('cancel-selection').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Event listener para actualizar la cantidad
    document.getElementById('update-count').addEventListener('click', updateNumberCount);
    
    updateSelectedNumbersDisplay();
    updateNumberCount();
}

function toggleNumberSelection(numberItem) {
    const maxNumbers = parseInt(document.getElementById('number-count').value) || 6;
    const selectedNumbers = document.querySelectorAll('.modal-number-item.selected');
    
    if (numberItem.classList.contains('selected')) {
        // Deseleccionar
        numberItem.classList.remove('selected');
    } else {
        // Seleccionar (máximo según la cantidad configurada)
        if (selectedNumbers.length < maxNumbers) {
            numberItem.classList.add('selected');
        } else {
            alert(`Ya has seleccionado ${maxNumbers} números. Deselecciona uno para seleccionar otro.`);
        }
    }
    
    updateSelectedNumbersDisplay();
}

function updateNumberCount() {
    const maxNumbers = parseInt(document.getElementById('number-count').value) || 6;
    const selectedNumbers = document.querySelectorAll('.modal-number-item.selected');
    const maxNumbersSpan = document.getElementById('max-numbers');
    
    maxNumbersSpan.textContent = maxNumbers;
    
    // Si hay más números seleccionados que el máximo, deseleccionar los extras
    if (selectedNumbers.length > maxNumbers) {
        const numbersToRemove = selectedNumbers.length - maxNumbers;
        for (let i = 0; i < numbersToRemove; i++) {
            selectedNumbers[selectedNumbers.length - 1 - i].classList.remove('selected');
        }
    }
    
    updateSelectedNumbersDisplay();
}

function updateSelectedNumbersDisplay() {
    const selectedItems = document.querySelectorAll('.modal-number-item.selected');
    const selectedNumbersList = document.getElementById('selected-numbers-list');
    
    if (selectedItems.length === 0) {
        selectedNumbersList.textContent = 'Ninguno';
    } else {
        const numbers = Array.from(selectedItems).map(item => item.textContent);
        selectedNumbersList.textContent = numbers.join(', ');
    }
}

function confirmNumberSelection() {
    const selectedItems = document.querySelectorAll('.modal-number-item.selected');
    
    if (selectedItems.length === 0) {
        alert('Debes seleccionar al menos un número ganador.');
        return;
    }
    
    // Obtener los números seleccionados
    winningNumbers = Array.from(selectedItems).map(item => item.textContent);
    
    // Cerrar modal
    const modal = document.querySelector('.number-selection-modal');
    document.body.removeChild(modal);
    
    // Actualizar la interfaz
    displayWinningNumbers();
    renderPlayers();
    updateStats();
    saveDataToStorage();
    
    alert(`Números ganadores seleccionados: ${winningNumbers.join(', ')}`);
}

function displayWinningNumbers() {
    // Limpiar ganadores anteriores
    document.querySelectorAll('.number-item.winner').forEach(item => {
        item.classList.remove('winner');
    });

    // Marcar nuevos ganadores
    if (winningNumbers.length > 0) {
        winningNumbers.forEach(number => {
            const item = document.querySelector(`.number-item[data-number="${number}"]`);
            if (item) {
                item.classList.add('winner');
            }
        });
    }
}

function updateStats() {
    const winnersCountEl = document.getElementById('winners-count');
    const totalPrizeEl = document.getElementById('total-prize');
    const prizesToDistributeEl = document.getElementById('prizes-to-distribute');
    const totalBetsHeaderEl = document.getElementById('total-bets-header');
    
    const totalJugadas = players.length;
    const premioTotal = totalJugadas * PREMIO_POR_JUGADA;

    const winners = winningNumbers.length > 0 
        ? players.filter(p => p.animals.some(a => winningNumbers.includes(String(a))))
        : [];
    
    const winnerCount = new Set(winners.map(w => w.name)).size; // Contar ganadores únicos por nombre
    
    winnersCountEl.textContent = winnerCount;
    prizesToDistributeEl.textContent = winnerCount > 0 ? (premioTotal / winnerCount).toFixed(2) : '0';
    totalPrizeEl.textContent = premioTotal.toLocaleString('es-ES');
    totalBetsHeaderEl.textContent = totalJugadas;
}

function clearAllData() {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos?')) {
        players = [];
        winningNumbers = [];
        selectedFile = null;
        
        fileNameSpan.textContent = '';
        importDataBtn.disabled = true;
        excelFileInput.value = '';
        
        displayWinningNumbers();
        renderPlayers();
        updateStats();
        saveDataToStorage();
        
        alert('Todos los datos han sido limpiados');
    }
}

function saveDataToStorage() {
    const data = { players, winningNumbers };
    localStorage.setItem('animalesFenixData', JSON.stringify(data));
}



function loadDataFromStorage() {
    try {
        const savedData = localStorage.getItem('animalesFenixData');
        if (savedData) {
            const data = JSON.parse(savedData);
            players = data.players || [];
            winningNumbers = data.winningNumbers || [];
            
            displayWinningNumbers();
            renderPlayers();
            updateStats();
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        players = [];
        winningNumbers = [];
    } finally {
        // Asegurarse de que la interfaz se renderice incluso si no hay datos guardados
        renderPlayers();
        updateStats();
    }
}
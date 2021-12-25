// Загрузка статистики
function load() {
    if (localStorage.getItem('playerX')) document.querySelector('.playerX').textContent = localStorage.getItem('playerX');
    if (localStorage.getItem('playerO')) document.querySelector('.playerO').textContent = localStorage.getItem('playerO');
    if (localStorage.getItem('draw')) document.querySelector('.draw').textContent = localStorage.getItem('draw');
}

load();

// Функция рандомного числа
function random(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

// Функция установки изначального размера
function setSize() {
    let select = document.querySelector('.size');
    for (let i = 3; i <= 15; i++) {
        let option = new Option(i,i);
        select.append(option);
    }

    select.options[0].selected = true;
    let selected = select.value;

    let selectwin = document.querySelector('.win');
    let option = new Option(selected, selected);
    option.selected = true;
    selectwin.append(option);

    let savesize = localStorage.getItem('size');
    if (savesize) {
        select.value = savesize;
        changeSize();
        selectwin.value = localStorage.getItem('combination');
    }

    newgame();
}

setSize();

// Функция изменения размера
function changeSize() {
    let size = document.querySelector('.size').value
    let select = document.querySelector('.win');
    let length = select.options.length;
    
    if (size < 5) {
        while (length != 1) {
            select.options[length-1].remove();
            length = select.options.length;
        }
    } else if (size == 5) {
        if (length > 2) {
            while (length != 2) {
                select.options[length-1].remove();
                length = select.options.length;
            }
        } else if (length < 2) {
           let option = new Option(4, 4);
           select.append(option);
        }
    } else {
        while (length != 3) {
            let option = new Option(length+3, length+3);
           select.append(option);
           length = select.options.length;
        }
    }
}

// Функция игры
function newgame() {
    document.querySelector('.gamefield').classList.remove('end');
    let size = document.querySelector('.size').value;
    localStorage.setItem('size', size);
    localStorage.setItem('combination', document.querySelector('.win').value);
    let gamefield = document.querySelector('.gamefield');

    while(gamefield.firstChild) {
        gamefield.removeChild(gamefield.lastChild);
    }

    for (let i = 0; i < Math.pow(size, 2); i++) {
        let field = document.createElement('div');
        field.classList.add('field');
        field.classList.add('empty');
        field.textContent = ' ';
        gamefield.appendChild(field);
    }

    gamefield.style.gridTemplateRows =  "repeat(" + size + ", 1fr)";
    gamefield.style.gridTemplateColumns =  "repeat(" + size + ", 1fr)";
    gamefield.style.width = size*50 + "px";
    gamefield.style.height = size*50 + "px";

    let move = '';
    let lastgame = localStorage.getItem('lastgame');
    if (!lastgame || lastgame == 'draw') {
        if (!random(0,1)) move = 'X';
        else move = 'O';
    } else if (lastgame == 'X') move = 'O';
      else if (lastgame == 'O') move = 'X';


    document.querySelector('.move').textContent = move;

    let fields = document.querySelectorAll('.field');
    for (let field of fields) {
        field.onclick = function() {
            if (field.classList.contains('empty')) {
                field.textContent = move;
                field.classList.add(move);
                field.classList.remove('empty');
            
                if (move == 'X') move = 'O';
                else move = 'X';
    
                document.querySelector('.move').textContent = move;
    
                let winner = win();
                if (winner) {
                    alert("Поздравляем игрока " + winner + " с победой");
                    document.querySelector('.player'+winner).textContent++;
                    localStorage.setItem('player'+winner, document.querySelector('.player'+winner).textContent);
                    document.querySelector('.move').textContent = '';
                    localStorage.setItem('lastgame',winner);
                    for (let field of fields) field.classList.remove('empty');
                    document.querySelector('.gamefield').classList.add('end');
                    return;
                }
            }

            if(!document.querySelector('.empty') && !document.querySelector('.gamefield').classList.contains('end')) {
                alert("Ничья");
                document.querySelector('.draw').textContent++;
                localStorage.setItem('draw', document.querySelector('.draw').textContent);
                document.querySelector('.move').textContent = '';
                localStorage.setItem('lastgame','draw');
                document.querySelector('.gamefield').classList.add('end');
                return;
            }

            return false;
        }
        if (document.querySelector('.gamefield').classList.contains('end')) return;
    }
}

// Поиск выигрыша
function win() {
    let combination = document.querySelector('.win').value;
    let size = document.querySelector('.size').value;

    let m = [];
    let fields = document.querySelectorAll('.field');
    for (let i = 0; i < size; i++) {
        let row = [];
        for (let j = 0; j < size; j++) {
            if (fields[i*size + j].textContent == 'X') row.push(0);
            else if (fields[i*size + j].textContent == 'O') row.push(1);
            else row.push(-1);
        }
        m.push(row);
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (m[i][j] < 0) continue;

            let fix = m[i][j];
            let count = [1, 1, 1, 1];
            let go = [1, 1, 1, 1, 1, 1, 1, 1];

            for (let n = 1; n < combination; n++) {
                if ((i-n) >= 0 && go[0]) {
                    if (m[i-n][j] == fix) count[0]++;
                    else go[0] = 0;
                }
                if ((i+n) < size  && go[1]) {
                    if (m[i+n][j] == fix) count[0]++;
                    else go[1] = 0;
                }

                if ((j-n) >= 0 && go[2]) {
                    if (m[i][j-n] == fix) count[1]++;
                    else go[2] = 0;
                }
                if ((j+n) < size && go[3]) {
                    if (m[i][j+n] == fix) count[1]++;
                    else go[3] = 0;
                }

                if ((i-n) >=0 && (j-n) >= 0 && go[4]) {
                    if (m[i-n][j-n] == fix) count[2]++;
                    else go[4] = 0;
                }
                if ((i+n) < size && (j+n) < size && go[5]) {
                    if (m[i+n][j+n] == fix) count[2]++;
                    else go[5] = 0;
                }

                if ((i-n) >=0 && (j+n) < size && go[6]) {
                    if (m[i-n][j+n] == fix) count[3]++;
                    else go[6] = 0;
                }
                if ((i+n) < size && (j-n) >= 0 && go[7]) {
                    if (m[i+n][j-n] == fix) count[3]++;
                    else go[7] = 0;
                }
            }
            
            for (let n = 0; n < 4; n++) {
                if (count[n] == combination) {
                    let winner = '';
                    if (!fix) winner = 'X';
                    else winner = 'O';
                    return winner;
                }
            }
        }
    }

    return 0;
}

// Сброс статистики
function resetStat() {
    localStorage.removeItem('playerX'); 
    document.querySelector('.playerX').textContent = 0;
    localStorage.removeItem('playerO');
    document.querySelector('.playerO').textContent = 0;
    localStorage.removeItem('draw');
    document.querySelector('.draw').textContent = 0;   
    localStorage.removeItem('lastgame');
}

// Сброс игры
function resetGame() {
    localStorage.removeItem('lastgame');
    newgame();
}

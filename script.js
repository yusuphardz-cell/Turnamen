// Database sederhana di memori (Temporary)
let players = [];

// Fungsi untuk menambah pemain
function registerPlayer() {
    const nameInput = document.getElementById('playerName');
    const gradeInput = document.getElementById('playerGrade');
    
    if (nameInput.value === "") {
        alert("Nama pemain tidak boleh kosong!");
        return;
    }

    const newPlayer = {
        id: Date.now(),
        name: nameInput.value,
        grade: gradeInput.value
    };

    players.push(newPlayer);
    updatePlayerList();
    
    // Reset form
    nameInput.value = "";
}

// Fungsi memperbarui tampilan daftar pendaftar
function updatePlayerList() {
    const listElement = document.getElementById('playerList');
    listElement.innerHTML = "";

    players.forEach((p, index) => {
        listElement.innerHTML += `
            <div class="flex justify-between items-center bg-gray-700 p-2 rounded mb-2">
                <span>${index + 1}. <strong>${p.name}</strong> (${p.grade})</span>
                <button onclick="setMatch(${p.id})" class="text-xs bg-blue-500 px-2 py-1 rounded">Set ke Meja 1</button>
            </div>
        `;
    });
}

// Fungsi mengirim pemain ke Papan Skor (Live Match)
function setMatch(id) {
    const selectedPlayer = players.find(p => p.id === id);
    // Logika sederhana: isi Slot 1 jika kosong, jika tidak isi Slot 2
    const p1Name = document.getElementById('p1DisplayName');
    const p2Name = document.getElementById('p2DisplayName');

    if (p1Name.innerText === "Player 1") {
        p1Name.innerText = `${selectedPlayer.name} (${selectedPlayer.grade})`;
    } else {
        p2Name.innerText = `${selectedPlayer.name} (${selectedPlayer.grade})`;
    }
}
let timeLeft = 30;
let timerId = null;

function startTimer() {
    // Stop timer jika sedang berjalan sebelum mulai baru
    clearInterval(timerId);
    timeLeft = 30;
    updateTimerUI();

    timerId = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            playAlertSound(); // Opsional: Bunyi buzzer
            alert("WAKTU HABIS! FOUL!");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerId);
    timeLeft = 30;
    updateTimerUI();
}

function updateTimerUI() {
    const display = document.getElementById('timerDisplay');
    const container = document.getElementById('timerContainer');
    display.innerText = timeLeft;

    // Perubahan Warna Indikator
    if (timeLeft > 15) {
        container.style.borderColor = "#16a34a"; // Hijau
    } else if (timeLeft <= 15 && timeLeft > 5) {
        container.style.borderColor = "#ca8a04"; // Kuning
    } else {
        container.style.borderColor = "#dc2626"; // Merah
        // Efek kedip saat kritis
        display.classList.add("animate-pulse");
    }

    if (timeLeft > 5) display.classList.remove("animate-pulse");
}

function playAlertSound() {
    // Anda bisa menambahkan file audio buzzer di sini jika ingin
    console.log("Buzzer Sound!");
}
// 1. Fungsi untuk Memuat Data Saat Aplikasi Dibuka
window.onload = function() {
    const savedPlayers = localStorage.getItem('billiardPlayers');
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
        updatePlayerList();
    }
    
    // Memuat skor terakhir jika ada
    const savedScores = localStorage.getItem('lastScores');
    if (savedScores) {
        const scores = JSON.parse(savedScores);
        document.getElementById('score1').innerText = scores.s1;
        document.getElementById('score2').innerText = scores.s2;
    }
};

// 2. Fungsi Simpan Data (Dipanggil setiap ada perubahan)
function saveToDatabase() {
    localStorage.setItem('billiardPlayers', JSON.stringify(players));
    
    const currentScores = {
        s1: document.getElementById('score1').innerText,
        s2: document.getElementById('score2').innerText
    };
    localStorage.setItem('lastScores', JSON.stringify(currentScores));
}

// 3. Modifikasi fungsi yang sudah ada agar otomatis simpan
function registerPlayer() {
    const nameInput = document.getElementById('playerName');
    const gradeInput = document.getElementById('playerGrade');
    
    if (nameInput.value === "") return;

    const newPlayer = { id: Date.now(), name: nameInput.value, grade: gradeInput.value };
    players.push(newPlayer);
    
    updatePlayerList();
    saveToDatabase(); // <--- Simpan ke DB
    nameInput.value = "";
}

function updateScore(id, val) {
    const scoreElement = document.getElementById(id);
    let currentScore = parseInt(scoreElement.innerText);
    
    if (currentScore < 7) {
        scoreElement.innerText = currentScore + val;
        saveToDatabase(); // <--- Simpan skor terbaru
    }
}
function extension() {
    timeLeft += 30;
    updateTimerUI();
    alert("Extension Digunakan! +30 Detik");
}


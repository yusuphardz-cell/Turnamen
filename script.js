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
function exportToExcel() {
    if (players.length === 0) {
        alert("Tidak ada data pemain untuk diekspor!");
        return;
    }

    // Header Kolom
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "No,Nama Pemain,Grade,Status\r\n";

    // Isi Data dari Database LocalStorage
    players.forEach((p, index) => {
        let row = `${index + 1},${p.name},${p.grade},Terdaftar`;
        csvContent += row + "\r\n";
    });

    // Menambahkan info skor terakhir jika perlu
    const s1 = document.getElementById('score1').innerText;
    const s2 = document.getElementById('score2').innerText;
    const p1 = document.getElementById('p1DisplayName').innerText;
    const p2 = document.getElementById('p2DisplayName').innerText;

    csvContent += `\r\nSKOR PERTANDINGAN TERAKHIR\r\n`;
    csvContent += `${p1} vs ${p2}\r\n`;
    csvContent += `Skor: ${s1} - ${s2}\r\n`;

    // Proses Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Turnamen_Billiard.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}
// Tambahkan stats ke dalam objek pemain saat registrasi
function registerPlayer() {
    const name = document.getElementById('playerName');
    const grade = document.getElementById('playerGrade');
    if (!name.value) return alert("Masukkan nama!");

    players.push({ 
        id: Date.now(), 
        name: name.value, 
        grade: grade.value,
        played: 0,
        wins: 0,
        losses: 0,
        margin: 0,
        points: 0
    });
    
    name.value = "";
    updatePlayerList();
    updateLeagueTable(); // Update tabel klasemen
    saveToDatabase();
}

// Fungsi untuk mencatat hasil pertandingan ke klasemen
function finishMatch(winnerSlot) {
    const s1 = parseInt(document.getElementById('score1').innerText);
    const s2 = parseInt(document.getElementById('score2').innerText);
    const n1 = document.getElementById('p1DisplayName').innerText;
    const n2 = document.getElementById('p2DisplayName').innerText;

    // Logika pencarian pemain di array berdasarkan nama
    // (Dalam aplikasi nyata, sebaiknya gunakan ID)
    let player1 = players.find(p => n1.includes(p.name));
    let player2 = players.find(p => n2.includes(p.name));

    if (!player1 || !player2) return alert("Pilih pemain dari daftar terlebih dahulu!");

    if (winnerSlot === 1) {
        player1.wins++; player1.points += 3;
        player2.losses++;
        player1.margin += (s1 - s2);
        player2.margin += (s2 - s1);
    } else {
        player2.wins++; player2.points += 3;
        player1.losses++;
        player2.margin += (s2 - s1);
        player1.margin += (s1 - s2);
    }
    
    player1.played++;
    player2.played++;

    updateLeagueTable();
    saveToDatabase();
    alert("Hasil pertandingan telah disimpan ke klasemen!");
}

function updateLeagueTable() {
    const tbody = document.getElementById('leagueTableBody');
    
    // Urutkan berdasarkan Poin tertinggi, lalu Margin tertinggi
    const sortedPlayers = [...players].sort((a, b) => b.points - a.points || b.margin - a.margin);
    
    tbody.innerHTML = sortedPlayers.map((p, i) => `
        <tr class="border-b border-slate-700 hover:bg-slate-700/50 transition">
            <td class="p-3">${i + 1}</td>
            <td class="p-3 font-bold">${p.name} <span class="text-xs text-blue-400">(${p.grade})</span></td>
            <td class="p-3 text-center">${p.played}</td>
            <td class="p-3 text-center text-green-400">${p.wins}</td>
            <td class="p-3 text-center text-red-400">${p.losses}</td>
            <td class="p-3 text-center font-mono">${p.margin > 0 ? '+' : ''}${p.margin}</td>
            <td class="p-3 text-center font-black bg-yellow-900/10 text-yellow-500">${p.points}</td>
        </tr>
    `).join('');
}


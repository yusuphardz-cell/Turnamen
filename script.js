/**
 * BILLIARD PRO LEAGUE SYSTEM - CORE SCRIPT
 * Mengelola Logika Turnamen, Klasemen, dan Database Lokal
 */

// --- 1. INISIALISASI DATA ---
let players = [];
let matchLogs = [];
let timeLeft = 30;
let timerId = null;

// Memuat data dari LocalStorage saat halaman pertama kali dibuka
window.onload = function() {
    const savedPlayers = localStorage.getItem('bill_players');
    const savedLogs = localStorage.getItem('bill_logs');
    
    if (savedPlayers) {
        players = JSON.parse(savedPlayers);
    }
    if (savedLogs) {
        matchLogs = JSON.parse(savedLogs);
    }
    
    renderAll();
};

// --- 2. FUNGSI DATABASE (LOCAL STORAGE) ---
function saveAll() {
    localStorage.setItem('bill_players', JSON.stringify(players));
    localStorage.setItem('bill_logs', JSON.stringify(matchLogs));
}

function clearDatabase() {
    if (confirm("HAPUS SEMUA DATA? Tindakan ini akan menghapus klasemen dan riwayat permanen.")) {
        localStorage.clear();
        location.reload();
    }
}

// --- 3. MANAJEMEN PEMAIN ---
function registerPlayer() {
    const nameInput = document.getElementById('playerName');
    const gradeInput = document.getElementById('playerGrade');
    
    const name = nameInput.value.trim();
    const grade = gradeInput.value;

    if (!name) {
        alert("Nama pemain harus diisi!");
        return;
    }

    // Cek jika nama sudah ada
    if (players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Nama pemain sudah terdaftar!");
        return;
    }

    const newPlayer = {
        id: Date.now(),
        name: name,
        grade: grade,
        played: 0,
        wins: 0,
        losses: 0,
        margin: 0,
        points: 0
    };

    players.push(newPlayer);
    nameInput.value = "";
    
    renderAll();
    saveAll();
}

function setPlayer(name, grade, slot) {
    const displayName = `${name} (${grade})`;
    document.getElementById(`p${slot}DisplayName`).innerText = displayName;
}

// --- 4. SCOREBOARD & LOGIKA LIGA ---
function updateScore(id, val) {
    const el = document.getElementById(id);
    let currentScore = parseInt(el.innerText);
    el.innerText = currentScore + val;
    resetTimer(); // Reset shot clock setiap kali skor bertambah
}

function finishMatch() {
    const s1 = parseInt(document.getElementById('score1').innerText);
    const s2 = parseInt(document.getElementById('score2').innerText);
    const n1Raw = document.getElementById('p1DisplayName').innerText;
    const n2Raw = document.getElementById('p2DisplayName').innerText;

    if (n1Raw === "PLAYER 1" || n2Raw === "PLAYER 2") {
        alert("Silakan pilih pemain dari daftar (P1/P2) terlebih dahulu!");
        return;
    }

    if (!confirm(`Selesaikan pertandingan: ${n1Raw} vs ${n2Raw}?`)) return;

    // Ambil nama murni tanpa grade
    const name1 = n1Raw.split(' (')[0].trim();
    const name2 = n2Raw.split(' (')[0].trim();

    const p1 = players.find(p => p.name === name1);
    const p2 = players.find(p => p.name === name2);

    if (!p1 || !p2) {
        alert("Kesalahan: Data pemain tidak ditemukan!");
        return;
    }

    // Update Statistik
    p1.played++; p2.played++;
    p1.margin += (s1 - s2);
    p2.margin += (s2 - s1);

    if (s1 > s2) {
        p1.wins++; p1.points += 3; p2.losses++;
    } else if (s2 > s1) {
        p2.wins++; p2.points += 3; p1.losses++;
    } else {
        p1.points += 1; p2.points += 1; // Jika draw
    }

    // Simpan ke Log
    matchLogs.unshift({
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        p1: name1,
        p2: name2,
        s1: s1,
        s2: s2,
        winner: s1 > s2 ? name1 : (s2 > s1 ? name2 : "Draw")
    });

    // Reset Papan Skor UI
    document.getElementById('score1').innerText = "0";
    document.getElementById('score2').innerText = "0";
    document.getElementById('p1DisplayName').innerText = "PLAYER 1";
    document.getElementById('p2DisplayName').innerText = "PLAYER 2";

    renderAll();
    saveAll();
    alert("Pertandingan berhasil disimpan ke klasemen!");
}

// --- 5. SHOT CLOCK ---
function startTimer() {
    clearInterval(timerId);
    timeLeft = 30;
    updateTimerUI();
    timerId = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            alert("WAKTU HABIS! FOUL!");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerId);
    timeLeft = 30;
    updateTimerUI();
}

function extension() {
    timeLeft += 30;
    updateTimerUI();
}

function updateTimerUI() {
    const display = document.getElementById('timerDisplay');
    const container = document.getElementById('timerContainer');
    display.innerText = timeLeft;
    
    // Perubahan Warna
    if (timeLeft > 15) {
        container.style.borderColor = "#16a34a"; // Hijau
    } else if (timeLeft > 5) {
        container.style.borderColor = "#ca8a04"; // Kuning
    } else {
        container.style.borderColor = "#dc2626"; // Merah
    }
}

// --- 6. RENDER UI (UPDATE TAMPILAN) ---
function renderAll() {
    renderPlayerList();
    renderLeagueTable();
    renderMatchHistory();
}

function renderPlayerList() {
    const list = document.getElementById('playerList');
    document.getElementById('playerCount').innerText = players.length;
    
    if (players.length === 0) {
        list.innerHTML = `<p class="text-slate-500 italic">Belum ada pemain.</p>`;
        return;
    }

    list.innerHTML = players.map(p => `
        <div class="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700 shadow-sm">
            <span class="font-bold text-sm">${p.name} <small class="text-blue-500 font-normal">${p.grade}</small></span>
            <div class="flex space-x-1">
                <button onclick="setPlayer('${p.name}', '${p.grade}', 1)" class="bg-blue-600 hover:bg-blue-500 text-[10px] px-2 py-1 rounded font-bold uppercase transition">P1</button>
                <button onclick="setPlayer('${p.name}', '${p.grade}', 2)" class="bg-red-600 hover:bg-red-500 text-[10px] px-2 py-1 rounded font-bold uppercase transition">P2</button>
            </div>
        </div>
    `).join('');
}

function renderLeagueTable() {
    const tableBody = document.getElementById('leagueTableBody');
    // Urutkan berdasarkan Poin, lalu Margin
    const sorted = [...players].sort((a, b) => b.points - a.points || b.margin - a.margin);
    
    tableBody.innerHTML = sorted.map((p, i) => `
        <tr class="hover:bg-slate-700/30 transition">
            <td class="p-3 font-digital text-yellow-600">${i + 1}</td>
            <td class="p-3 font-bold">${p.name} <small class="text-slate-500">${p.grade}</small></td>
            <td class="p-3 text-center">${p.played}</td>
            <td class="p-3 text-center text-green-400">${p.wins}</td>
            <td class="p-3 text-center text-red-400">${p.losses}</td>
            <td class="p-3 text-center">${p.margin > 0 ? '+' : ''}${p.margin}</td>
            <td class="p-3 text-center font-black bg-yellow-900/10 text-yellow-500">${p.points}</td>
        </tr>
    `).join('');
}

function renderMatchHistory() {
    const history = document.getElementById('matchHistory');
    if (matchLogs.length === 0) {
        history.innerHTML = `<p class="text-slate-500 italic text-sm">Belum ada pertandingan.</p>`;
        return;
    }

    history.innerHTML = matchLogs.map(log => `
        <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 flex justify-between items-center animate-fade-in shadow-inner">
            <div>
                <span class="font-bold text-white">${log.p1}</span> 
                <span class="mx-2 text-yellow-500 font-black">${log.s1} - ${log.s2}</span> 
                <span class="font-bold text-white">${log.p2}</span>
            </div>
            <span class="text-[9px] uppercase text-slate-500 bg-slate-800 px-2 py-1 rounded italic">${log.time}</span>
        </div>
    `).join('');
}

// --- 7. EKSPOR DATA ---
function exportToExcel() {
    if (players.length === 0) return alert("Data kosong!");
    
    let csv = "Posisi,Nama,Grade,Main,Menang,Kalah,Margin,Poin\n";
    const sorted = [...players].sort((a, b) => b.points - a.points || b.margin - a.margin);
    
    sorted.forEach((p, i) => {
        csv += `${i+1},${p.name},${p.grade},${p.played},${p.wins},${p.losses},${p.margin},${p.points}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'Laporan_Liga_Billiard.csv');
    a.click();
}

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

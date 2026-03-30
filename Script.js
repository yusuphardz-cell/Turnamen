// Deklarasikan variabel ini di bagian paling ATAS script Anda
let currentTargetTable = 1;
let selectedP1 = null;

// --- FUNGSI 1: MEMBUKA MODAL ---
function openManualSelect(table) {
    currentTargetTable = table;
    selectedP1 = null; // Reset setiap kali buka baru
    
    const title = document.getElementById('modalTitle');
    if(title) title.innerText = "PILIH PEMAIN 1 (MEJA " + table + ")";
    
    renderModalPlayers();
    document.getElementById('playerModal').style.display = 'flex';
}

// --- FUNGSI 2: MERENDER LIST PEMAIN ---
function renderModalPlayers() {
    const listContainer = document.getElementById('modalPlayerList');
    if (!listContainer) return;

    // Cari pemain yang sedang main di meja LAIN (agar tidak double)
    let otherTable = (currentTargetTable === 1) ? 2 : 1;
    let p1Other = document.getElementById(`t${otherTable}_p1`).innerText;
    let p2Other = document.getElementById(`t${otherTable}_p2`).innerText;
    let busyPlayers = [p1Other, p2Other];

    // Filter pemain yang tersedia
    const available = local_players.filter(p => {
        const isBusy = busyPlayers.includes(p.name);
        const isAlreadySelected = (selectedP1 === p.name);
        return !isBusy && !isAlreadySelected;
    });

    if (available.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-[10px] text-slate-500 py-8 uppercase tracking-widest">Pemain tidak tersedia</p>';
        return;
    }

    listContainer.innerHTML = available.map(p => `
        <button onclick="selectPlayer('${p.name}')" 
            class="w-full p-4 bg-slate-900/50 rounded-2xl text-left border border-white/5 hover:border-yellow-500 hover:bg-yellow-500 hover:text-black transition flex justify-between items-center group">
            <span class="font-black uppercase">${p.name}</span>
            <span class="text-[9px] opacity-60 font-digital">PTS: ${p.pts}</span>
        </button>
    `).join('');
}

// --- FUNGSI 3: LOGIKA PEMILIHAN ---
function selectPlayer(name) {
    if (!selectedP1) {
        // TAHAP 1: Pilih Pemain Pertama
        selectedP1 = name;
        
        // Update tampilan meja sementara
        document.getElementById(`t${currentTargetTable}_p1`).innerText = name;
        
        // Ganti instruksi modal
        const title = document.getElementById('modalTitle');
        if(title) title.innerText = "PILIH LAWAN UNTUK " + name;
        
        // Refresh list (P1 yang baru dipilih akan hilang dari list)
        renderModalPlayers();
    } else {
        // TAHAP 2: Pilih Lawan
        document.getElementById(`t${currentTargetTable}_p2`).innerText = name;
        
        // Reset skor ke 0-0
        document.getElementById(`t${currentTargetTable}_s1`).innerText = "0";
        document.getElementById(`t${currentTargetTable}_s2`).innerText = "0";
        
        closeModal();
        
        // Efek visual sukses
        const card = document.getElementById(`card_t${currentTargetTable}`);
        card.classList.add('active-table');
        setTimeout(() => card.classList.remove('active-table'), 1500);
    }
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
    selectedP1 = null;
}

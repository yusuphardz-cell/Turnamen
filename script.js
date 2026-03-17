function shuffleByTable(table) {
    let other = table === 1 ? 2 : 1;
    let busy = [
        document.getElementById(`t${other}_p1`).innerText, 
        document.getElementById(`t${other}_p2`).innerText
    ];
    
    // Ambil riwayat pertandingan terakhir (untuk syarat istirahat)
    let lastMatch = local_history.length > 0 ? local_history[0] : null;
    let recentlyPlayed = lastMatch ? [lastMatch.p1, lastMatch.p2] : [];

    // 1. Kumpulkan semua pasangan yang BELUM PERNAH bertemu
    let allPossiblePairs = [];
    for(let i = 0; i < local_players.length; i++) {
        for(let j = i + 1; j < local_players.length; j++) {
            let n1 = local_players[i].name; 
            let n2 = local_players[j].name;
            
            // Skip jika sedang main di meja sebelah
            if(busy.includes(n1) || busy.includes(n2)) continue;

            // Skip jika sudah pernah tanding (menghindari tanding ulang)
            let alreadyPlayed = local_history.some(h => (h.p1 === n1 && h.p2 === n2) || (h.p1 === n2 && h.p2 === n1));
            if(alreadyPlayed) continue;

            // Cek apakah mereka "Fresh" (tidak main di match sebelumnya)
            let isFresh = !recentlyPlayed.includes(n1) && !recentlyPlayed.includes(n2);
            
            allPossiblePairs.push({
                pair: [local_players[i], local_players[j]],
                isFresh: isFresh
            });
        }
    }

    if(allPossiblePairs.length === 0) return alert("Semua kombinasi pasangan sudah bertanding!");

    // 2. KOCOK SEMUA PASANGAN (Fisher-Yates Shuffle)
    // Ini membuat urutan daftar pemain tidak berpengaruh sama sekali
    for (let i = allPossiblePairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPossiblePairs[i], allPossiblePairs[j]] = [allPossiblePairs[j], allPossiblePairs[i]];
    }

    // 3. PRIORITAS: Cari yang 'Fresh' dulu dari hasil kocokan tadi
    let chosenPair = null;
    let freshPairs = allPossiblePairs.filter(p => p.isFresh);

    if (freshPairs.length > 0) {
        // Ambil secara acak dari kumpulan yang fresh
        chosenPair = freshPairs[Math.floor(Math.random() * freshPairs.length)].pair;
    } else {
        // Jika tidak ada yang fresh (semua pemain yang tersisa baru saja main), 
        // ambil secara acak dari semua pasangan yang mungkin
        chosenPair = allPossiblePairs[Math.floor(Math.random() * allPossiblePairs.length)].pair;
    }

    // Terapkan ke Meja
    document.getElementById(`t${table}_p1`).innerText = chosenPair[0].name;
    document.getElementById(`t${table}_p2`).innerText = chosenPair[1].name;
    document.getElementById(`t${table}_s1`).innerText = "0";
    document.getElementById(`t${table}_s2`).innerText = "0";
    
    // Beri efek visual aktif
    document.getElementById(`card_t${table}`).classList.add('active-table');
}

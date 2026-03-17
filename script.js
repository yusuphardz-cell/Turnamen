// MODIFIKASI: LOGIKA ACAK RANDOM TANPA URUTAN, TAPI CEK PEMAIN SEBELUMNYA
function shuffleByTable(table) {
    let other = table === 1 ? 2 : 1;
    let busy = [
        document.getElementById(`t${other}_p1`).innerText, 
        document.getElementById(`t${other}_p2`).innerText
    ];
    
    // Ambil data pemain terakhir dari riwayat pertandingan untuk dicek
    let lastMatch = local_history.length > 0 ? local_history[0] : null;
    let recentlyPlayed = lastMatch ? [lastMatch.p1, lastMatch.p2] : [];

    // 1. Kumpulkan semua pasangan yang mungkin (yang belum pernah bertemu)
    let potentialPairs = [];
    for(let i = 0; i < local_players.length; i++) {
        for(let j = i + 1; j < local_players.length; j++) {
            let n1 = local_players[i].name; 
            let n2 = local_players[j].name;
            
            // Cek apakah salah satu pemain sedang bertanding di meja lain
            if(busy.includes(n1) || busy.includes(n2)) continue;

            // Cek apakah mereka sudah pernah bertanding (menghindari tanding ulang)
            let alreadyPlayed = local_history.some(h => (h.p1 === n1 && h.p2 === n2) || (h.p1 === n2 && h.p2 === n1));
            if(alreadyPlayed) continue;

            // Cek apakah salah satu dari mereka baru saja selesai bertanding (Istirahat 1 Match)
            // Jika pemain yang tersedia banyak, kita prioritaskan yang tidak masuk di recentlyPlayed
            let isFresh = !recentlyPlayed.includes(n1) && !recentlyPlayed.includes(n2);
            
            potentialPairs.push({
                pair: [local_players[i], local_players[j]],
                isFresh: isFresh,
                randomWeight: Math.random() // Memberikan faktor keberuntungan murni
            });
        }
    }

    if(potentialPairs.length === 0) return alert("Semua pasangan sudah pernah bertanding!");

    // 2. Sortir: Utamakan yang "Fresh" (tidak main di match sebelumnya), lalu acak murni
    potentialPairs.sort((a, b) => {
        if (a.isFresh !== b.isFresh) return b.isFresh - a.isFresh; // Fresh di atas
        return a.randomWeight - b.randomWeight; // Sisanya random murni
    });

    let chosen = potentialPairs[0].pair;

    // Terapkan ke UI
    document.getElementById(`t${table}_p1`).innerText = chosen[0].name;
    document.getElementById(`t${table}_p2`).innerText = chosen[1].name;
    document.getElementById(`t${table}_s1`).innerText = "0";
    document.getElementById(`t${table}_s2`).innerText = "0";
    document.getElementById(`card_t${table}`).classList.add('active-table');
}

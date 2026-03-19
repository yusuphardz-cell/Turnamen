function shuffleByTable(table) {
    let other = table === 1 ? 2 : 1;
    
    // 1. Ambil nama yang sedang "sibuk" di meja sebelah
    let busy = [
        document.getElementById(`t${other}_p1`).innerText, 
        document.getElementById(`t${other}_p2`).innerText
    ];
    
    // 2. Ambil nama yang baru saja SELESAI bertanding (dari riwayat terakhir)
    // Ini adalah kunci agar mereka tidak muncul lagi setelah klik "Simpan"
    let lastMatch = local_history.length > 0 ? local_history[0] : null;
    let recentlyPlayed = lastMatch ? [lastMatch.p1, lastMatch.p2] : [];

    // 3. Kumpulkan semua kemungkinan pasangan yang BELUM PERNAH bertemu
    let allPossiblePairs = [];
    for(let i = 0; i < local_players.length; i++) {
        for(let j = i + 1; j < local_players.length; j++) {
            let n1 = local_players[i].name; 
            let n2 = local_players[j].name;
            
            // Filter A: Bukan pemain yang sedang di meja sebelah
            if(busy.includes(n1) || busy.includes(n2)) continue;

            // Filter B: Bukan pasangan yang sudah pernah bertemu (menghindari tanding ulang)
            let alreadyPlayed = local_history.some(h => 
                (h.p1 === n1 && h.p2 === n2) || (h.p1 === n2 && h.p2 === n1)
            );
            if(alreadyPlayed) continue;

            // Filter C: Deteksi status "Fresh" (Pemain yang sudah istirahat)
            let isFresh = !recentlyPlayed.includes(n1) && !recentlyPlayed.includes(n2);
            
            allPossiblePairs.push({
                pair: [local_players[i], local_players[j]],
                isFresh: isFresh
            });
        }
    }

    if(allPossiblePairs.length === 0) {
        alert("Semua kombinasi pasangan yang tersedia sudah pernah bertanding atau pemain tidak mencukupi!");
        return;
    }

    // 4. TRUE RANDOM SHUFFLE (Fisher-Yates)
    // Menghancurkan urutan pendaftaran agar hasil benar-benar acak murni
    for (let i = allPossiblePairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPossiblePairs[i], allPossiblePairs[j]] = [allPossiblePairs[j], allPossiblePairs[i]];
    }

    // 5. SELEKSI AKHIR
    // Kita prioritaskan pasangan yang keduanya "Fresh" (sudah istirahat minimal 1 match)
    let finalSelection = allPossiblePairs.find(p => p.isFresh);

    // Jika tidak ada yang benar-benar fresh (misal pemain tinggal sedikit), 
    // ambil acak dari yang tersedia meskipun salah satunya baru main
    if (!finalSelection) {
        finalSelection = allPossiblePairs[0];
    }

    // 6. UPDATE KE LAYAR
    const chosen = finalSelection.pair;
    document.getElementById(`t${table}_p1`).innerText = chosen[0];
    document.getElementById(`t${table}_p2`).innerText = chosen[1];
    document.getElementById(`t${table}_s1`).innerText = "0";
    document.getElementById(`t${table}_s2`).innerText = "0";

    // Efek visual sukses
    const card = document.getElementById(`card_t${table}`);
    card.style.borderColor = "#eab308";
    setTimeout(() => card.style.borderColor = "rgba(255,255,255,0.05)", 1000);
}

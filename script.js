<script>
    // ==========================================
    // 1. INISIALISASI SUPABASE
    // ==========================================
    const SUPABASE_URL = "https://PROJECT_ID.supabase.co";
    const SUPABASE_KEY = "YOUR_ANON_KEY";
    
    // Inisialisasi client dari library global
    const { createClient } = supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    let local_players = [];
    let local_history = [];
    let currentTargetTable = 1;
    let selectedP1 = null;

    // ==========================================
    // 2. FUNGSI UTAMA (LOAD & SYNC)
    // ==========================================
    async function loadData() {
        try {
            const { data: p, error: ep } = await _supabase.from('players').select('*').order('pts', { ascending: false });
            const { data: h, error: eh } = await _supabase.from('history').select('*').order('created_at', { ascending: false });
            
            if (ep || eh) throw (ep || eh);

            local_players = p || [];
            local_history = h || [];
            renderAll();
        } catch (err) {
            console.error("Gagal sinkronisasi data:", err.message);
        }
    }

    // Aktifkan Realtime Listening
    function subscribeRealtime() {
        _supabase.channel('db-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
                console.log("Perubahan tabel players terdeteksi");
                loadData();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'history' }, payload => {
                console.log("Perubahan tabel history terdeteksi");
                loadData();
            })
            .subscribe();
    }

    // ==========================================
    // 3. FITUR REGISTRASI (FIXED)
    // ==========================================
    async function addPlayerOnline() {
        const input = document.getElementById('pName');
        const name = input.value.trim().toUpperCase();
        
        if (!name) return alert("Masukkan nama pemain!");
        
        // Cek duplikasi lokal untuk hemat kuota
        if (local_players.some(p => p.name === name)) {
            return alert("Nama ini sudah terdaftar!");
        }

        const { error } = await _supabase
            .from('players')
            .insert([{ name, p: 0, w: 0, l: 0, pts: 0 }]);

        if (error) {
            console.error("Error Simpan:", error);
            alert("Gagal daftar: " + error.message);
        } else {
            input.value = "";
            // Tidak perlu render manual jika Realtime sudah jalan
        }
    }

    // ==========================================
    // 4. LOGIKA PERTANDINGAN & SKOR
    // ==========================================
    async function saveMatchOnline(table) {
        const p1n = document.getElementById(`t${table}_p1`).innerText;
        const p2n = document.getElementById(`t${table}_p2`).innerText;
        const s1 = parseInt(document.getElementById(`t${table}_s1`).innerText);
        const s2 = parseInt(document.getElementById(`t${table}_s2`).innerText);

        if (p1n.includes("PLAYER") || s1 === s2) {
            return alert("Pilih pemain dan pastikan skor tidak seri!");
        }

        const p1 = local_players.find(p => p.name === p1n);
        const p2 = local_players.find(p => p.name === p2n);

        // Hitung akumulasi baru
        const upd1 = { 
            p: p1.p + 1, 
            w: s1 > s2 ? p1.w + 1 : p1.w, 
            l: s1 < s2 ? p1.l + 1 : p1.l, 
            pts: s1 > s2 ? p1.pts + 1 : p1.pts 
        };
        const upd2 = { 
            p: p2.p + 1, 
            w: s2 > s1 ? p2.w + 1 : p2.w, 
            l: s2 < s1 ? p2.l + 1 : p2.l, 
            pts: s2 > s1 ? p2.pts + 1 : p2.pts 
        };

        // Simpan ke database
        const { error: eh } = await _supabase.from('history').insert([{ p1: p1n, p2: p2n, s1, s2 }]);
        const { error: ep1 } = await _supabase.from('players').update(upd1).eq('name', p1n);
        const { error: ep2 } = await _supabase.from('players').update(upd2).eq('name', p2n);

        if (eh || ep1 || ep2) {
            alert("Gagal menyimpan hasil!");
        } else {
            // Reset Meja
            document.getElementById(`t${table}_p1`).innerText = "PLAYER " + table;
            document.getElementById(`t${table}_p2`).innerText = "PLAYER " + table;
            document.getElementById(`t${table}_s1`).innerText = "0";
            document.getElementById(`t${table}_s2`).innerText = "0";
        }
    }

    // ==========================================
    // 5. UTILITY (RENDER & MODAL)
    // ==========================================
    function renderAll() {
        const sorted = [...local_players].sort((a,b) => b.pts - a.pts || b.w - a.w || a.l - b.l);
        
        // Render Tabel Klasemen
        const rankTable = document.getElementById('rankTable');
        if (rankTable) {
            rankTable.innerHTML = sorted.map((p, i) => `
                <tr class="border-b border-white/5 hover:bg-white/5 transition cursor-pointer" onclick="showPlayerDetail('${p.name}')">
                    <td class="p-4 font-digital ${i<3?'text-yellow-500':'text-slate-600'}">${i+1}</td>
                    <td class="p-4 font-black uppercase text-white">${p.name}</td>
                    <td class="p-4 text-center text-slate-500">${p.p}</td>
                    <td class="p-4 text-center text-emerald-500 font-bold">${p.w}</td>
                    <td class="p-4 text-center font-digital text-yellow-500 text-lg">${p.pts}</td>
                </tr>
            `).join('');
        }

        // Render Riwayat
        const historyList = document.getElementById('historyList');
        if (historyList) {
            historyList.innerHTML = local_history.map(h => `
                <div class="bg-black/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                    <span class="text-[10px] uppercase font-bold text-slate-300">
                        ${h.p1} <span class="mx-2 text-yellow-500 font-digital">${h.s1}-${h.s2}</span> ${h.p2}
                    </span>
                    <button onclick="deleteMatch(${h.id})" class="text-[8px] bg-rose-600/20 text-rose-500 px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 font-black">HAPUS</button>
                </div>
            `).join('');
        }
    }

    // Sisipkan fungsi pendukung lainnya (shuffleByTable, adjustScore, dll) dari versi sebelumnya...

    // JALANKAN SAAT START
    window.onload = () => {
        loadData();
        subscribeRealtime();
    };
</script>

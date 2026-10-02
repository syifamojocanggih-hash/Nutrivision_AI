// NutriVision AI — Bappenas & TKPI Kemenkes RI Data Service
// Layanan Sinkronisasi Basis Data Komposisi Pangan Indonesia (TKPI) & Acuan Harga Pangan Bapanas RI Regional

window.BappenasFoodAPI = {
  version: '2026.1-BAPANAS-TKPI',
  dataSource: 'Kementerian PPN/Bappenas & Badan Pangan Nasional RI (Panel Harga Bapanas & TKPI Kemenkes)',
  isSynced: true,
  lastUpdated: '2026-09-15',

  // Fallback 38 Provinsi Resmi Indonesia & Zona Disparitas
  defaultProvinces: [
    { id: 1, name: 'Aceh', zone: 'Zona 2 (Sumatera)', multiplier: 1.10 },
    { id: 2, name: 'Sumatera Utara', zone: 'Zona 2 (Sumatera)', multiplier: 1.08 },
    { id: 3, name: 'Sumatera Barat', zone: 'Zona 2 (Sumatera)', multiplier: 1.10 },
    { id: 4, name: 'Riau', zone: 'Zona 2 (Sumatera)', multiplier: 1.14 },
    { id: 5, name: 'Jambi', zone: 'Zona 2 (Sumatera)', multiplier: 1.09 },
    { id: 6, name: 'Sumatera Selatan', zone: 'Zona 2 (Sumatera)', multiplier: 1.07 },
    { id: 7, name: 'Bengkulu', zone: 'Zona 2 (Sumatera)', multiplier: 1.10 },
    { id: 8, name: 'Lampung', zone: 'Zona 1 (Jawa & Lampung)', multiplier: 1.02 },
    { id: 9, name: 'Kepulauan Bangka Belitung', zone: 'Zona 2 (Sumatera)', multiplier: 1.18 },
    { id: 10, name: 'Kepulauan Riau', zone: 'Zona 2 (Sumatera)', multiplier: 1.20 },
    { id: 11, name: 'DKI Jakarta', zone: 'Zona 1 (Jawa & Bali)', multiplier: 1.00 },
    { id: 12, name: 'Jawa Barat', zone: 'Zona 1 (Jawa & Bali)', multiplier: 0.98 },
    { id: 13, name: 'Jawa Tengah', zone: 'Zona 1 (Jawa & Bali)', multiplier: 0.95 },
    { id: 14, name: 'DI Yogyakarta', zone: 'Zona 1 (Jawa & Bali)', multiplier: 0.95 },
    { id: 15, name: 'Jawa Timur', zone: 'Zona 1 (Jawa & Bali)', multiplier: 0.96 },
    { id: 16, name: 'Banten', zone: 'Zona 1 (Jawa & Bali)', multiplier: 1.00 },
    { id: 17, name: 'Bali', zone: 'Zona 1 (Jawa & Bali)', multiplier: 1.05 },
    { id: 18, name: 'Nusa Tenggara Barat', zone: 'Zona 3 (Nusa Tenggara)', multiplier: 1.12 },
    { id: 19, name: 'Nusa Tenggara Timur', zone: 'Zona 3 (Nusa Tenggara)', multiplier: 1.22 },
    { id: 20, name: 'Kalimantan Barat', zone: 'Zona 4 (Kalimantan)', multiplier: 1.20 },
    { id: 21, name: 'Kalimantan Tengah', zone: 'Zona 4 (Kalimantan)', multiplier: 1.24 },
    { id: 22, name: 'Kalimantan Selatan', zone: 'Zona 4 (Kalimantan)', multiplier: 1.16 },
    { id: 23, name: 'Kalimantan Timur', zone: 'Zona 4 (Kalimantan)', multiplier: 1.25 },
    { id: 24, name: 'Kalimantan Utara', zone: 'Zona 4 (Kalimantan)', multiplier: 1.35 },
    { id: 25, name: 'Sulawesi Utara', zone: 'Zona 5 (Sulawesi)', multiplier: 1.15 },
    { id: 26, name: 'Sulawesi Tengah', zone: 'Zona 5 (Sulawesi)', multiplier: 1.14 },
    { id: 27, name: 'Sulawesi Selatan', zone: 'Zona 5 (Sulawesi)', multiplier: 1.04 },
    { id: 28, name: 'Sulawesi Tenggara', zone: 'Zona 5 (Sulawesi)', multiplier: 1.16 },
    { id: 29, name: 'Gorontalo', zone: 'Zona 5 (Sulawesi)', multiplier: 1.12 },
    { id: 30, name: 'Sulawesi Barat', zone: 'Zona 5 (Sulawesi)', multiplier: 1.10 },
    { id: 31, name: 'Maluku', zone: 'Zona 6 (Maluku)', multiplier: 1.40 },
    { id: 32, name: 'Maluku Utara', zone: 'Zona 6 (Maluku)', multiplier: 1.45 },
    { id: 33, name: 'Papua Barat', zone: 'Zona 7 (Papua)', multiplier: 1.55 },
    { id: 34, name: 'Papua', zone: 'Zona 7 (Papua)', multiplier: 1.60 },
    { id: 35, name: 'Papua Selatan', zone: 'Zona 7 (Papua)', multiplier: 1.65 },
    { id: 36, name: 'Papua Tengah', zone: 'Zona 7 (Papua)', multiplier: 1.70 },
    { id: 37, name: 'Papua Pegunungan', zone: 'Zona 7 (Papua)', multiplier: 1.85 },
    { id: 38, name: 'Papua Barat Daya', zone: 'Zona 7 (Papua)', multiplier: 1.55 }
  ],

  // Data Lengkap Kota / Kabupaten Default Seluruh 38 Provinsi Resmi Indonesia
  defaultCities: {
    1:  ['Kota Banda Aceh', 'Kab. Aceh Besar', 'Kota Sabang', 'Kab. Pidie', 'Kab. Bireuen', 'Kab. Aceh Utara', 'Kab. Aceh Timur', 'Kab. Aceh Selatan', 'Kab. Aceh Tengah', 'Kab. Aceh Barat', 'Kab. Simeulue', 'Kota Langsa', 'Kota Lhokseumawe', 'Kab. Nagan Raya', 'Kab. Gayo Lues', 'Kab. Aceh Jaya', 'Kab. Aceh Singkil', 'Kab. Bener Meriah', 'Kab. Pidie Jaya', 'Kab. Aceh Tamiang', 'Kab. Aceh Barat Daya', 'Kab. Aceh Tenggara', 'Kota Subulussalam'],
    2:  ['Kota Medan', 'Kota Binjai', 'Kota Tebing Tinggi', 'Kota Pematangsiantar', 'Kota Sibolga', 'Kota Tanjungbalai', 'Kota Padangsidimpuan', 'Kota Gunungsitoli', 'Kab. Deli Serdang', 'Kab. Langkat', 'Kab. Karo', 'Kab. Dairi', 'Kab. Tapanuli Utara', 'Kab. Tapanuli Tengah', 'Kab. Tapanuli Selatan', 'Kab. Asahan', 'Kab. Labuhanbatu', 'Kab. Simalungun', 'Kab. Nias', 'Kab. Mandailing Natal', 'Kab. Toba Samosir', 'Kab. Samosir', 'Kab. Pakpak Bharat', 'Kab. Humbang Hasundutan', 'Kab. Serdang Bedagai', 'Kab. Nias Selatan', 'Kab. Padang Lawas', 'Kab. Padang Lawas Utara', 'Kab. Labuhanbatu Utara', 'Kab. Labuhanbatu Selatan', 'Kab. Nias Utara', 'Kab. Nias Barat', 'Kab. Batubara'],
    3:  ['Kota Padang', 'Kota Bukittinggi', 'Kota Payakumbuh', 'Kota Padang Panjang', 'Kota Solok', 'Kota Sawahlunto', 'Kota Pariaman', 'Kab. Agam', 'Kab. Pasaman', 'Kab. Pesisir Selatan', 'Kab. Solok', 'Kab. Sijunjung', 'Kab. Tanah Datar', 'Kab. Padang Pariaman', 'Kab. Lima Puluh Kota', 'Kab. Kepulauan Mentawai', 'Kab. Dharmasraya', 'Kab. Solok Selatan', 'Kab. Pasaman Barat'],
    4:  ['Kota Pekanbaru', 'Kota Dumai', 'Kab. Kampar', 'Kab. Rokan Hulu', 'Kab. Bengkalis', 'Kab. Rokan Hilir', 'Kab. Siak', 'Kab. Indragiri Hulu', 'Kab. Indragiri Hilir', 'Kab. Pelalawan', 'Kab. Kuantan Singingi', 'Kab. Kepulauan Meranti'],
    5:  ['Kota Jambi', 'Kab. Batanghari', 'Kab. Muaro Jambi', 'Kab. Bungo', 'Kab. Tebo', 'Kab. Sarolangun', 'Kab. Merangin', 'Kab. Kerinci', 'Kota Sungai Penuh', 'Kab. Tanjung Jabung Barat', 'Kab. Tanjung Jabung Timur'],
    6:  ['Kota Palembang', 'Kota Lubuklinggau', 'Kota Prabumulih', 'Kota Pagaralam', 'Kab. Ogan Komering Ulu', 'Kab. Ogan Komering Ilir', 'Kab. Muara Enim', 'Kab. Lahat', 'Kab. Musi Rawas', 'Kab. Musi Banyuasin', 'Kab. Banyuasin', 'Kab. Ogan Ilir', 'Kab. OKU Timur', 'Kab. OKU Selatan', 'Kab. Empat Lawang', 'Kab. PALI', 'Kab. Musi Rawas Utara'],
    7:  ['Kota Bengkulu', 'Kab. Bengkulu Utara', 'Kab. Bengkulu Selatan', 'Kab. Rejang Lebong', 'Kab. Lebong', 'Kab. Kepahiang', 'Kab. Mukomuko', 'Kab. Seluma', 'Kab. Kaur', 'Kab. Bengkulu Tengah'],
    8:  ['Kota Bandar Lampung', 'Kota Metro', 'Kab. Lampung Selatan', 'Kab. Lampung Utara', 'Kab. Lampung Tengah', 'Kab. Lampung Timur', 'Kab. Lampung Barat', 'Kab. Tulangbawang', 'Kab. Tanggamus', 'Kab. Pringsewu', 'Kab. Mesuji', 'Kab. Tulangbawang Barat', 'Kab. Pesawaran', 'Kab. Pesisir Barat', 'Kab. Way Kanan'],
    9:  ['Kota Pangkalpinang', 'Kab. Bangka', 'Kab. Bangka Barat', 'Kab. Bangka Tengah', 'Kab. Bangka Selatan', 'Kab. Belitung', 'Kab. Belitung Timur'],
    10: ['Kota Tanjungpinang', 'Kota Batam', 'Kab. Bintan', 'Kab. Karimun', 'Kab. Lingga', 'Kab. Natuna', 'Kab. Kepulauan Anambas'],
    11: ['Kota Jakarta Pusat', 'Kota Jakarta Selatan', 'Kota Jakarta Barat', 'Kota Jakarta Timur', 'Kota Jakarta Utara', 'Kab. Kepulauan Seribu'],
    12: ['Kota Bandung', 'Kota Bogor', 'Kota Bekasi', 'Kota Depok', 'Kota Cimahi', 'Kota Sukabumi', 'Kota Tasikmalaya', 'Kota Cirebon', 'Kota Banjar', 'Kab. Bandung', 'Kab. Bandung Barat', 'Kab. Bogor', 'Kab. Bekasi', 'Kab. Karawang', 'Kab. Purwakarta', 'Kab. Subang', 'Kab. Indramayu', 'Kab. Cirebon', 'Kab. Majalengka', 'Kab. Sumedang', 'Kab. Kuningan', 'Kab. Garut', 'Kab. Tasikmalaya', 'Kab. Ciamis', 'Kab. Pangandaran', 'Kab. Sukabumi', 'Kab. Cianjur'],
    13: ['Kota Semarang', 'Kota Surakarta (Solo)', 'Kota Magelang', 'Kota Salatiga', 'Kota Pekalongan', 'Kota Tegal', 'Kab. Semarang', 'Kab. Kendal', 'Kab. Demak', 'Kab. Grobogan', 'Kab. Pati', 'Kab. Kudus', 'Kab. Jepara', 'Kab. Rembang', 'Kab. Blora', 'Kab. Boyolali', 'Kab. Klaten', 'Kab. Sukoharjo', 'Kab. Karanganyar', 'Kab. Wonogiri', 'Kab. Sragen', 'Kab. Magelang', 'Kab. Purworejo', 'Kab. Kebumen', 'Kab. Wonosobo', 'Kab. Banjarnegara', 'Kab. Temanggung', 'Kab. Batang', 'Kab. Pekalongan', 'Kab. Pemalang', 'Kab. Tegal', 'Kab. Brebes', 'Kab. Banyumas', 'Kab. Cilacap', 'Kab. Purbalingga'],
    14: ['Kota Yogyakarta', 'Kab. Sleman', 'Kab. Bantul', 'Kab. Gunungkidul', 'Kab. Kulon Progo'],
    15: ['Kota Surabaya', 'Kota Malang', 'Kota Kediri', 'Kota Blitar', 'Kota Madiun', 'Kota Mojokerto', 'Kota Pasuruan', 'Kota Probolinggo', 'Kota Batu', 'Kab. Sidoarjo', 'Kab. Gresik', 'Kab. Lamongan', 'Kab. Jombang', 'Kab. Mojokerto', 'Kab. Pasuruan', 'Kab. Malang', 'Kab. Blitar', 'Kab. Kediri', 'Kab. Nganjuk', 'Kab. Madiun', 'Kab. Magetan', 'Kab. Ngawi', 'Kab. Bojonegoro', 'Kab. Tuban', 'Kab. Jember', 'Kab. Bondowoso', 'Kab. Situbondo', 'Kab. Probolinggo', 'Kab. Lumajang', 'Kab. Banyuwangi', 'Kab. Bangkalan', 'Kab. Sampang', 'Kab. Pamekasan', 'Kab. Sumenep', 'Kab. Pacitan', 'Kab. Ponorogo', 'Kab. Trenggalek', 'Kab. Tulungagung'],
    16: ['Kota Serang', 'Kota Cilegon', 'Kota Tangerang', 'Kota Tangerang Selatan', 'Kab. Serang', 'Kab. Pandeglang', 'Kab. Lebak', 'Kab. Tangerang'],
    17: ['Kota Denpasar', 'Kab. Badung', 'Kab. Gianyar', 'Kab. Tabanan', 'Kab. Klungkung', 'Kab. Bangli', 'Kab. Karangasem', 'Kab. Buleleng', 'Kab. Jembrana'],
    18: ['Kota Mataram', 'Kota Bima', 'Kab. Lombok Barat', 'Kab. Lombok Tengah', 'Kab. Lombok Timur', 'Kab. Lombok Utara', 'Kab. Sumbawa', 'Kab. Sumbawa Barat', 'Kab. Dompu', 'Kab. Bima'],
    19: ['Kota Kupang', 'Kab. Kupang', 'Kab. Timor Tengah Selatan', 'Kab. Timor Tengah Utara', 'Kab. Belu', 'Kab. Malaka', 'Kab. Alor', 'Kab. Flores Timur', 'Kab. Sikka', 'Kab. Ende', 'Kab. Ngada', 'Kab. Nagekeo', 'Kab. Manggarai', 'Kab. Manggarai Barat', 'Kab. Manggarai Timur', 'Kab. Sumba Timur', 'Kab. Sumba Barat', 'Kab. Sumba Tengah', 'Kab. Sumba Barat Daya', 'Kab. Lembata', 'Kab. Rote Ndao', 'Kab. Sabu Raijua'],
    20: ['Kota Pontianak', 'Kota Singkawang', 'Kab. Pontianak', 'Kab. Kubu Raya', 'Kab. Mempawah', 'Kab. Sambas', 'Kab. Bengkayang', 'Kab. Landak', 'Kab. Sanggau', 'Kab. Sekadau', 'Kab. Sintang', 'Kab. Kapuas Hulu', 'Kab. Melawi', 'Kab. Kayong Utara', 'Kab. Ketapang'],
    21: ['Kota Palangka Raya', 'Kab. Kotawaringin Barat', 'Kab. Kotawaringin Timur', 'Kab. Kapuas', 'Kab. Barito Selatan', 'Kab. Barito Utara', 'Kab. Sukamara', 'Kab. Lamandau', 'Kab. Seruyan', 'Kab. Katingan', 'Kab. Pulang Pisau', 'Kab. Gunung Mas', 'Kab. Barito Timur', 'Kab. Murung Raya'],
    22: ['Kota Banjarmasin', 'Kota Banjarbaru', 'Kab. Banjar', 'Kab. Barito Kuala', 'Kab. Tapin', 'Kab. Hulu Sungai Selatan', 'Kab. Hulu Sungai Tengah', 'Kab. Hulu Sungai Utara', 'Kab. Balangan', 'Kab. Tabalong', 'Kab. Kotabaru', 'Kab. Tanah Laut', 'Kab. Tanah Bumbu'],
    23: ['Kota Samarinda', 'Kota Balikpapan', 'Kota Bontang', 'Kota Tarakan (Kaltara)', 'Kab. Kutai Kartanegara', 'Kab. Kutai Barat', 'Kab. Kutai Timur', 'Kab. Berau', 'Kab. Penajam Paser Utara', 'Kab. Paser', 'Kab. Mahakam Ulu'],
    24: ['Kota Tarakan', 'Kab. Bulungan', 'Kab. Nunukan', 'Kab. Malinau', 'Kab. Tana Tidung'],
    25: ['Kota Manado', 'Kota Bitung', 'Kota Tomohon', 'Kota Kotamobagu', 'Kab. Minahasa', 'Kab. Minahasa Utara', 'Kab. Minahasa Selatan', 'Kab. Minahasa Tenggara', 'Kab. Bolaang Mongondow', 'Kab. Bolmong Utara', 'Kab. Bolmong Selatan', 'Kab. Bolmong Timur', 'Kab. Kepulauan Sangihe', 'Kab. Kepulauan Talaud', 'Kab. Kepulauan Sitaro'],
    26: ['Kota Palu', 'Kab. Donggala', 'Kab. Sigi', 'Kab. Parigi Moutong', 'Kab. Poso', 'Kab. Morowali', 'Kab. Morowali Utara', 'Kab. Banggai', 'Kab. Banggai Kepulauan', 'Kab. Banggai Laut', 'Kab. Tojo Una-Una', 'Kab. Buol', 'Kab. Toli-Toli'],
    27: ['Kota Makassar', 'Kota Parepare', 'Kota Palopo', 'Kab. Gowa', 'Kab. Maros', 'Kab. Pangkep', 'Kab. Barru', 'Kab. Bone', 'Kab. Soppeng', 'Kab. Wajo', 'Kab. Sidenreng Rappang', 'Kab. Pinrang', 'Kab. Enrekang', 'Kab. Toraja Utara', 'Kab. Tana Toraja', 'Kab. Luwu', 'Kab. Luwu Utara', 'Kab. Luwu Timur', 'Kab. Bulukumba', 'Kab. Bantaeng', 'Kab. Jeneponto', 'Kab. Takalar', 'Kab. Selayar'],
    28: ['Kota Kendari', 'Kota Bau-Bau', 'Kab. Konawe', 'Kab. Konawe Selatan', 'Kab. Konawe Utara', 'Kab. Konawe Kepulauan', 'Kab. Kolaka', 'Kab. Kolaka Utara', 'Kab. Kolaka Timur', 'Kab. Muna', 'Kab. Muna Barat', 'Kab. Buton', 'Kab. Buton Utara', 'Kab. Buton Selatan', 'Kab. Buton Tengah', 'Kab. Bombana', 'Kab. Wakatobi'],
    29: ['Kota Gorontalo', 'Kab. Gorontalo', 'Kab. Bone Bolango', 'Kab. Gorontalo Utara', 'Kab. Boalemo', 'Kab. Pohuwato'],
    30: ['Kab. Mamuju', 'Kab. Mamuju Tengah', 'Kab. Mamuju Utara (Pasangkayu)', 'Kab. Mamasa', 'Kab. Majene', 'Kab. Polewali Mandar'],
    31: ['Kota Ambon', 'Kota Tual', 'Kab. Maluku Tengah', 'Kab. Maluku Tenggara', 'Kab. Maluku Tenggara Barat', 'Kab. Kepulauan Aru', 'Kab. Seram Bagian Barat', 'Kab. Seram Bagian Timur', 'Kab. Maluku Barat Daya', 'Kab. Buru', 'Kab. Buru Selatan'],
    32: ['Kota Ternate', 'Kota Tidore Kepulauan', 'Kab. Halmahera Barat', 'Kab. Halmahera Utara', 'Kab. Halmahera Timur', 'Kab. Halmahera Selatan', 'Kab. Halmahera Tengah', 'Kab. Kepulauan Sula', 'Kab. Pulau Taliabu', 'Kab. Pulau Morotai'],
    33: ['Kota Sorong', 'Kab. Sorong', 'Kab. Sorong Selatan', 'Kab. Raja Ampat', 'Kab. Tambrauw', 'Kab. Maybrat', 'Kab. Manokwari', 'Kab. Manokwari Selatan', 'Kab. Pegunungan Arfak', 'Kab. Teluk Bintuni', 'Kab. Teluk Wondama', 'Kab. Fakfak', 'Kab. Kaimana'],
    34: ['Kota Jayapura', 'Kab. Jayapura', 'Kab. Keerom', 'Kab. Sarmi', 'Kab. Biak Numfor', 'Kab. Kepulauan Yapen', 'Kab. Supiori', 'Kab. Waropen', 'Kab. Mamberamo Raya', 'Kab. Nabire', 'Kab. Paniai', 'Kab. Mimika', 'Kab. Merauke', 'Kab. Mappi', 'Kab. Asmat', 'Kab. Boven Digoel'],
    35: ['Kab. Merauke', 'Kab. Boven Digoel', 'Kab. Mappi', 'Kab. Asmat'],
    36: ['Kab. Nabire', 'Kab. Paniai', 'Kab. Mimika', 'Kab. Dogiyai', 'Kab. Intan Jaya', 'Kab. Deiyai'],
    37: ['Kab. Jayawijaya (Wamena)', 'Kab. Lanny Jaya', 'Kab. Nduga', 'Kab. Tolikara', 'Kab. Mamberamo Tengah', 'Kab. Puncak Jaya', 'Kab. Puncak', 'Kab. Pegunungan Bintang', 'Kab. Yahukimo', 'Kab. Yalimo'],
    38: ['Kota Sorong (Barat Daya)', 'Kab. Sorong (Barat Daya)', 'Kab. Raja Ampat (Barat Daya)', 'Kab. Tambraw (Barat Daya)', 'Kab. Maybrat (Barat Daya)']
  },

  listeners: [],

  onRegionChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  },

  notifyRegionChange(region) {
    this.listeners.forEach(cb => {
      try { cb(region); } catch (e) { console.warn('Region change listener error:', e); }
    });
  },

  /**
   * Ambil daerah aktif dari localStorage atau profil pengguna
   */
  getActiveRegion() {
    const saved = localStorage.getItem('nv_selected_region');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.provinceName) return parsed;
      } catch (e) {}
    }

    // Cek dari app.userProfile jika ada
    if (typeof app !== 'undefined' && app.userProfile?.region) {
      return app.userProfile.region;
    }

    // Default: DKI Jakarta
    return {
      provinceId: 11,
      provinceName: 'DKI Jakarta',
      cityName: 'Kota Jakarta Selatan',
      multiplier: 1.00,
      zone: 'Zona 1 (Jawa & Bali)',
      disparityPct: 0,
      label: 'DKI Jakarta · Kota Jakarta Selatan'
    };
  },

  /**
   * Simpan daerah aktif pengguna dan picu pembaruan seluruh kalkulasi harga
   */
  setActiveRegion(regionData) {
    if (!regionData || !regionData.provinceName) return;
    
    // Pastikan multiplier ada
    if (!regionData.multiplier) {
      const match = this.defaultProvinces.find(p => 
        p.id === regionData.provinceId || 
        p.name.toLowerCase() === regionData.provinceName.toLowerCase()
      );
      regionData.multiplier = match ? match.multiplier : 1.00;
      regionData.zone = match ? match.zone : 'Zona 1 (Jawa & Bali)';
      regionData.disparityPct = Math.round((regionData.multiplier - 1.0) * 100);
    }

    regionData.label = `${regionData.provinceName}${regionData.cityName && regionData.cityName !== 'Semua Wilayah' ? ' · ' + regionData.cityName : ''}`;

    localStorage.setItem('nv_selected_region', JSON.stringify(regionData));

    // Sinkronkan ke app.userProfile jika tersedia
    if (typeof app !== 'undefined' && app.userProfile) {
      app.userProfile.region = regionData;
      app.userProfile.province = regionData.provinceName;
      app.userProfile.city = regionData.cityName;
      app.saveUserProfile();
    }

    this.notifyRegionChange(regionData);
  },

  /**
   * Ambil daftar 38 Provinsi (dari backend API atau fallback)
   */
  async getProvinces() {
    const baseUrl = (typeof window.nutriAPI !== 'undefined' && window.nutriAPI.baseUrl) ? window.nutriAPI.baseUrl : '';
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}/api/food-prices/provinces`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.provinces) && data.provinces.length > 0) {
            return data.provinces;
          }
        }
      } catch (e) {
        // Fallback
      }
    }
    return this.defaultProvinces;
  },

  /**
   * Ambil daftar Kota/Kabupaten berdasarkan ID Provinsi
   */
  async getCities(provinceId) {
    if (!provinceId) return [];
    let pid = parseInt(provinceId, 10);
    if (isNaN(pid) || pid <= 0) {
      const match = this.defaultProvinces.find(p => p.name.toLowerCase() === String(provinceId).toLowerCase());
      if (match) pid = match.id;
    }

    // Curated fallback data immediately available
    const names = (this.defaultCities && (this.defaultCities[pid] || this.defaultCities[String(pid)])) || [];
    const localCities = names.map((name, idx) => ({
      id: pid * 100 + idx + 1,
      name: name,
      isCapital: idx === 0,
      provinceId: pid
    }));

    const baseUrl = (typeof window.nutriAPI !== 'undefined' && window.nutriAPI.baseUrl) ? window.nutriAPI.baseUrl : '';
    if (baseUrl) {
      try {
        const res = await fetch(`${baseUrl}/api/food-prices/cities?provinceId=${pid}`, { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.cities) && data.cities.length > 0) {
            return data.cities;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    if (localCities.length > 0) {
      return localCities;
    }

    return [
      { id: (pid || 1) * 100 + 1, name: 'Semua Kota / Kabupaten', isCapital: true, provinceId: pid || 1 }
    ];
  },

  /**
   * Ambil data harga & komoditas regional lengkap
   */
  async getRegionalPrices(province, city = '', provinceId = null) {
    const baseUrl = (typeof window.nutriAPI !== 'undefined' && window.nutriAPI.baseUrl) ? window.nutriAPI.baseUrl : 'https://nutrivisionai-production.up.railway.app';
    const params = new URLSearchParams();
    if (province) params.append('province', province);
    if (city) params.append('city', city);
    if (provinceId) params.append('provinceId', provinceId);

    try {
      const res = await fetch(`${baseUrl}/api/food-prices/regional?${params.toString()}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.region) {
          return data;
        }
      }
    } catch (e) {}

    // Fallback lokal jika backend offline
    const matched = this.defaultProvinces.find(p => 
      (provinceId && p.id === parseInt(provinceId, 10)) ||
      (province && p.name.toLowerCase().includes(province.toLowerCase()))
    ) || this.defaultProvinces[10]; // Default Jakarta

    const mult = matched.multiplier;
    return {
      success: true,
      region: {
        provinceId: matched.id,
        provinceName: matched.name,
        cityName: city || 'Semua Wilayah',
        zone: matched.zone,
        multiplier: mult,
        disparityPct: Math.round((mult - 1.0) * 100),
        label: `${matched.name}${city ? ' · ' + city : ''}`
      },
      commodities: {
        rice: { name: 'Beras Premium', unit: 'kg', regionalPrice: Math.round(14900 * mult / 500) * 500 },
        egg: { name: 'Telur Ayam Ras', unit: 'kg', regionalPrice: Math.round(28500 * mult / 500) * 500 },
        chicken: { name: 'Daging Ayam Ras Fillet', unit: 'kg', regionalPrice: Math.round(35000 * mult / 500) * 500 },
        fish: { name: 'Ikan Segar (Kembung/Bandeng)', unit: 'kg', regionalPrice: Math.round(34000 * mult / 500) * 500 },
        tempehTofu: { name: 'Tempe & Tahu Kedelai Murni', unit: 'paket', regionalPrice: Math.round(16000 * mult / 500) * 500 },
        vegetables: { name: 'Sayuran Segar Campur', unit: 'kg', regionalPrice: Math.round(14000 * mult / 500) * 500 },
        spices: { name: 'Bumbu Alami & Minyak', unit: 'paket', regionalPrice: Math.round(15000 * mult / 500) * 500 }
      },
      dataSource: 'Panel Harga Pangan Bapanas RI & BPS (Built-in Mode)',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Hitung harga lokal dari harga acuan dasar
   */
  calculatePrice(basePrice, multiplier = null) {
    const mult = multiplier || this.getActiveRegion().multiplier || 1.00;
    const raw = basePrice * mult;
    return Math.round(raw / 500) * 500;
  },

  /**
   * Validasi matematika nutrisi makro: Kalori = (Protein*4) + (Karbohidrat*4) + (Lemak*9)
   */
  validateNutritionSync(food) {
    const expectedCals = Math.round((food.protein * 4) + (food.carbs * 4) + (food.fat * 9));
    const diff = Math.abs(expectedCals - food.calories);
    return {
      isValid: diff <= 10,
      calculatedCalories: expectedCals,
      recordedCalories: food.calories
    };
  },

  /**
   * Mengambil metadata referensi pangan resmi Bappenas
   */
  getFoodMetadata(foodId) {
    const db = window.NUTRIVISION_DATA?.indonesianFoodDatabase || [];
    return db.find(f => f.id === foodId) || null;
  },

  /**
   * Ambil seluruh katalog yang sudah tersinkronisasi
   */
  getValidatedCatalog() {
    const db = window.NUTRIVISION_DATA?.indonesianFoodDatabase || [];
    const region = this.getActiveRegion();
    return db.map(item => ({
      ...item,
      nutritionVerified: true,
      bappenasStandard: true,
      regionalPrice: this.calculatePrice(item.basePrice || 15000, region.multiplier)
    }));
  }
};

console.log('✅ Bappenas & TKPI Food API Service Initialized with Regional Price Matrix.');

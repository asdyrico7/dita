document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchButton = document.getElementById('search-button');
    const scheduleBox = document.getElementById('prayer-schedule');
    const scheduleCity = document.getElementById('schedule-city');
    const scheduleDate = document.getElementById('schedule-date');
    const scheduleList = document.getElementById('schedule-list');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    searchButton.addEventListener('click', fetchPrayerSchedule);

    // Memungkinkan pencarian dengan menekan Enter
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchPrayerSchedule();
        }
    });

    function fetchPrayerSchedule() {
        const cityName = cityInput.value.trim();
        
        // Sembunyikan semua elemen hasil/error sebelum pencarian baru
        scheduleBox.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        if (cityName === "") {
            errorMessage.textContent = "Mohon masukkan nama kota.";
            errorMessage.classList.remove('hidden');
            return;
        }

        // Tampilkan loading
        loadingMessage.classList.remove('hidden');

        // URL API Jadwal Sholat (Menggunakan API my.id yang relatif sederhana)
        const API_URL = `https://api.my.id/jadwal-sholat/kota/${cityName}`;

        fetch(API_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Jaringan bermasalah atau API tidak merespon.');
                }
                return response.json();
            })
            .then(data => {
                // Sembunyikan loading
                loadingMessage.classList.add('hidden');

                if (data.status === 'success' && data.data) {
                    displaySchedule(data.data);
                } else {
                    throw new Error('Kota tidak ditemukan atau data tidak tersedia.');
                }
            })
            .catch(error => {
                // Sembunyikan loading dan tampilkan error
                loadingMessage.classList.add('hidden');
                errorMessage.textContent = `Gagal memuat jadwal: ${error.message}`;
                errorMessage.classList.remove('hidden');
            });
    }

    function displaySchedule(data) {
        // Mendapatkan tanggal hari ini (atau API mungkin sudah menyediakan tanggal di datanya)
        const today = new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        scheduleCity.textContent = data.kota;
        scheduleDate.textContent = `Tanggal: ${today}`;
        
        // Objek jadwal sholat yang relevan
        const times = data.jadwal;
        
        // Mapping nama sholat
        const prayerNames = [
            { key: 'subuh', name: 'Subuh' },
            { key: 'terbit', name: 'Terbit/Syuruq' },
            { key: 'dzuhur', name: 'Dzuhur' },
            { key: 'ashar', name: 'Ashar' },
            { key: 'maghrib', name: 'Maghrib' },
            { key: 'isya', name: 'Isya' }
        ];

        // Buat HTML untuk setiap waktu sholat
        scheduleList.innerHTML = prayerNames.map(p => `
            <div class="prayer-time">
                <span>${p.name}</span>
                <span class="time">${times[p.key]}</span>
            </div>
        `).join('');

        scheduleBox.classList.remove('hidden');
    }
});

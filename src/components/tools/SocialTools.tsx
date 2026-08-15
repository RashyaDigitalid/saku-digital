import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Navigation, Sparkles, Printer, RefreshCw, Compass, MapPin, 
  Copy, Download, Trash2, Repeat, FileText, Calendar, Clock, 
  ChevronLeft, ChevronRight, CheckCircle2, LocateFixed, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import CopyButton from '../CopyButton';

interface SocialToolsProps {
  toolId: string;
}

// Comprehensive Indonesian Cities Coordinates Database (38 Provinces & Major Cities/Regencies)
export const INDONESIAN_CITIES = [
  // JAWA
  { id: 'jakarta', name: 'DKI Jakarta', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, timezone: 7 },
  { id: 'bandung', name: 'Kota Bandung', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, timezone: 7 },
  { id: 'bekasi', name: 'Kota Bekasi', province: 'Jawa Barat', lat: -6.2383, lng: 106.9756, timezone: 7 },
  { id: 'bogor', name: 'Kota Bogor', province: 'Jawa Barat', lat: -6.5971, lng: 106.8060, timezone: 7 },
  { id: 'depok', name: 'Kota Depok', province: 'Jawa Barat', lat: -6.4025, lng: 106.7942, timezone: 7 },
  { id: 'tangerang', name: 'Kota Tangerang', province: 'Banten', lat: -6.1783, lng: 106.6319, timezone: 7 },
  { id: 'serang', name: 'Kota Serang', province: 'Banten', lat: -6.1104, lng: 106.1640, timezone: 7 },
  { id: 'cirebon', name: 'Kota Cirebon', province: 'Jawa Barat', lat: -6.7320, lng: 108.5523, timezone: 7 },
  { id: 'semarang', name: 'Kota Semarang', province: 'Jawa Tengah', lat: -6.9667, lng: 110.4167, timezone: 7 },
  { id: 'surakarta', name: 'Kota Surakarta (Solo)', province: 'Jawa Tengah', lat: -7.5755, lng: 110.8243, timezone: 7 },
  { id: 'magelang', name: 'Kota Magelang', province: 'Jawa Tengah', lat: -7.4706, lng: 110.2178, timezone: 7 },
  { id: 'yogyakarta', name: 'Kota Yogyakarta', province: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695, timezone: 7 },
  { id: 'surabaya', name: 'Kota Surabaya', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, timezone: 7 },
  { id: 'malang', name: 'Kota Malang', province: 'Jawa Timur', lat: -7.9666, lng: 112.6326, timezone: 7 },
  { id: 'kediri', name: 'Kota Kediri', province: 'Jawa Timur', lat: -7.8480, lng: 112.0178, timezone: 7 },
  { id: 'banyuwangi', name: 'Kab. Banyuwangi', province: 'Jawa Timur', lat: -8.2192, lng: 114.3692, timezone: 7 },
  
  // SUMATERA
  { id: 'banda_aceh', name: 'Kota Banda Aceh', province: 'Aceh', lat: 5.5483, lng: 95.3238, timezone: 7 },
  { id: 'medan', name: 'Kota Medan', province: 'Sumatera Utara', lat: 3.5952, lng: 98.6722, timezone: 7 },
  { id: 'padang', name: 'Kota Padang', province: 'Sumatera Barat', lat: -0.9471, lng: 100.4172, timezone: 7 },
  { id: 'pekanbaru', name: 'Kota Pekanbaru', province: 'Riau', lat: 0.5071, lng: 101.4478, timezone: 7 },
  { id: 'batam', name: 'Kota Batam', province: 'Kepulauan Riau', lat: 1.1301, lng: 104.0529, timezone: 7 },
  { id: 'tanjungpinang', name: 'Kota Tanjungpinang', province: 'Kepulauan Riau', lat: 0.9167, lng: 104.4500, timezone: 7 },
  { id: 'jambi', name: 'Kota Jambi', province: 'Jambi', lat: -1.6101, lng: 103.6131, timezone: 7 },
  { id: 'palembang', name: 'Kota Palembang', province: 'Sumatera Selatan', lat: -2.9761, lng: 104.7754, timezone: 7 },
  { id: 'bengkulu', name: 'Kota Bengkulu', province: 'Bengkulu', lat: -3.8004, lng: 102.2655, timezone: 7 },
  { id: 'bandar_lampung', name: 'Kota Bandar Lampung', province: 'Lampung', lat: -5.4500, lng: 105.2667, timezone: 7 },
  { id: 'pangkalpinang', name: 'Kota Pangkalpinang', province: 'Bangka Belitung', lat: -2.1333, lng: 106.1167, timezone: 7 },

  // BALI & NUSA TENGGARA
  { id: 'denpasar', name: 'Kota Denpasar', province: 'Bali', lat: -8.6705, lng: 115.2126, timezone: 8 },
  { id: 'mataram', name: 'Kota Mataram (Lombok)', province: 'Nusa Tenggara Barat', lat: -8.5833, lng: 116.1167, timezone: 8 },
  { id: 'bima', name: 'Kota Bima', province: 'Nusa Tenggara Barat', lat: -8.4608, lng: 118.7275, timezone: 8 },
  { id: 'kupang', name: 'Kota Kupang', province: 'Nusa Tenggara Timur', lat: -10.1772, lng: 123.6070, timezone: 8 },
  { id: 'labuan_bajo', name: 'Labuan Bajo (Manggarai Barat)', province: 'Nusa Tenggara Timur', lat: -8.4964, lng: 119.8877, timezone: 8 },

  // KALIMANTAN
  { id: 'pontianak', name: 'Kota Pontianak', province: 'Kalimantan Barat', lat: -0.0263, lng: 109.3425, timezone: 7 },
  { id: 'palangkaraya', name: 'Kota Palangka Raya', province: 'Kalimantan Tengah', lat: -2.2161, lng: 113.9139, timezone: 7 },
  { id: 'banjarmasin', name: 'Kota Banjarmasin', province: 'Kalimantan Selatan', lat: -3.3194, lng: 114.5908, timezone: 8 },
  { id: 'banjarbaru', name: 'Kota Banjarbaru', province: 'Kalimantan Selatan', lat: -3.4402, lng: 114.8306, timezone: 8 },
  { id: 'samarinda', name: 'Kota Samarinda', province: 'Kalimantan Timur', lat: -0.5022, lng: 117.1536, timezone: 8 },
  { id: 'balikpapan', name: 'Kota Balikpapan', province: 'Kalimantan Timur', lat: -1.2379, lng: 116.8289, timezone: 8 },
  { id: 'ikn_nusantara', name: 'IKN Nusantara (Sepaku)', province: 'Kalimantan Timur', lat: -0.9700, lng: 116.7000, timezone: 8 },
  { id: 'tarakan', name: 'Kota Tarakan', province: 'Kalimantan Utara', lat: 3.3000, lng: 117.6333, timezone: 8 },

  // SULAWESI
  { id: 'manado', name: 'Kota Manado', province: 'Sulawesi Utara', lat: 1.4748, lng: 124.8428, timezone: 8 },
  { id: 'gorontalo', name: 'Kota Gorontalo', province: 'Gorontalo', lat: 0.5435, lng: 123.0568, timezone: 8 },
  { id: 'palu', name: 'Kota Palu', province: 'Sulawesi Tengah', lat: -0.9003, lng: 119.8780, timezone: 8 },
  { id: 'mamuju', name: 'Kota Mamuju', province: 'Sulawesi Barat', lat: -2.6748, lng: 118.8885, timezone: 8 },
  { id: 'makassar', name: 'Kota Makassar', province: 'Sulawesi Selatan', lat: -5.1477, lng: 119.4327, timezone: 8 },
  { id: 'parepare', name: 'Kota Parepare', province: 'Sulawesi Selatan', lat: -4.0133, lng: 119.6256, timezone: 8 },
  { id: 'kendari', name: 'Kota Kendari', province: 'Sulawesi Tenggara', lat: -3.9985, lng: 122.5126, timezone: 8 },

  // MALUKU & PAPUA
  { id: 'ambon', name: 'Kota Ambon', province: 'Maluku', lat: -3.6554, lng: 128.1908, timezone: 9 },
  { id: 'ternate', name: 'Kota Ternate', province: 'Maluku Utara', lat: 0.7904, lng: 127.3828, timezone: 9 },
  { id: 'jayapura', name: 'Kota Jayapura', province: 'Papua', lat: -2.5916, lng: 140.6690, timezone: 9 },
  { id: 'sorong', name: 'Kota Sorong', province: 'Papua Barat Daya', lat: -0.8762, lng: 131.2558, timezone: 9 },
  { id: 'manokwari', name: 'Kota Manokwari', province: 'Papua Barat', lat: -0.8615, lng: 134.0620, timezone: 9 },
  { id: 'merauke', name: 'Kab. Merauke', province: 'Papua Selatan', lat: -8.4991, lng: 140.4019, timezone: 9 },
  { id: 'timika', name: 'Kota Timika (Mimika)', province: 'Papua Tengah', lat: -4.5467, lng: 136.8837, timezone: 9 },
  { id: 'wamena', name: 'Wamena (Jayawijaya)', province: 'Papua Pegunungan', lat: -4.0988, lng: 138.9442, timezone: 9 },
];

export default function SocialTools({ toolId }: SocialToolsProps) {
  const triggerSuccess = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
    });
  };

  // ----------------------------------------------------
  // 1. ADVANCED PRAYER TIMES ENGINE (MONTHLY & PRECISE)
  // ----------------------------------------------------
  const [selectedCityId, setSelectedCityId] = useState<string>('jakarta');
  const [customLat, setCustomLat] = useState<number>(-6.2088);
  const [customLng, setCustomLng] = useState<number>(106.8456);
  const [customCityName, setCustomCityName] = useState<string>('DKI Jakarta');
  const [isUsingGps, setIsUsingGps] = useState<boolean>(false);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  
  // Month & Year selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [activeTab, setActiveTab] = useState<'today' | 'month'>('month');

  // Find active city
  const activeCity = useMemo(() => {
    return INDONESIAN_CITIES.find(c => c.id === selectedCityId) || {
      id: 'custom',
      name: customCityName,
      province: 'Kustom / GPS',
      lat: customLat,
      lng: customLng,
      timezone: 7
    };
  }, [selectedCityId, customCityName, customLat, customLng]);

  // Update lat/lng when city changes
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    setIsUsingGps(false);
    const city = INDONESIAN_CITIES.find(c => c.id === cityId);
    if (city) {
      setCustomLat(city.lat);
      setCustomLng(city.lng);
      setCustomCityName(city.name);
    }
  };

  // GPS Location Trigger
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung fitur lokasi GPS.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setCustomLat(lat);
        setCustomLng(lng);
        setCustomCityName(`Lokasi GPS (${lat}, ${lng})`);
        setSelectedCityId('custom');
        setIsUsingGps(true);
        setGpsLoading(false);
        triggerSuccess();
      },
      (err) => {
        setGpsLoading(false);
        alert('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi telah diaktifkan di browser Anda.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Helper format time
  const formatPrayerTime = (d: Date | null | undefined): string => {
    if (!d || isNaN(d.getTime())) return '--:--';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Calculate Monthly Prayer Schedule
  const monthlySchedule = useMemo(() => {
    const coords = new Coordinates(customLat, customLng);
    // Kemenag Calculation standard params: Fajr 20 degrees, Isha 18 degrees
    const params = CalculationMethod.Singapore(); // Singapore/Malaysia/Indonesia standard parameters
    params.madhab = Madhab.Shafi;
    params.fajrAngle = 20;
    params.ishaAngle = 18;

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const rows = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const prayerTimes = new PrayerTimes(coords, dateObj, params);

      // Imsak is 10 minutes before Subuh
      const subuhTime = prayerTimes.fajr;
      const imsakTime = subuhTime ? new Date(subuhTime.getTime() - 10 * 60 * 1000) : null;
      // Dhuha is approx 20 mins after sunrise
      const terbitTime = prayerTimes.sunrise;
      const dhuhaTime = terbitTime ? new Date(terbitTime.getTime() + 20 * 60 * 1000) : null;

      const isToday = 
        dateObj.getDate() === now.getDate() && 
        dateObj.getMonth() === now.getMonth() && 
        dateObj.getFullYear() === now.getFullYear();

      rows.push({
        day,
        date: dateObj,
        dateString: dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        dayName: dateObj.toLocaleDateString('id-ID', { weekday: 'long' }),
        fullDateString: dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        isToday,
        imsak: formatPrayerTime(imsakTime),
        subuh: formatPrayerTime(prayerTimes.fajr),
        terbit: formatPrayerTime(prayerTimes.sunrise),
        dhuha: formatPrayerTime(dhuhaTime),
        dzuhur: formatPrayerTime(prayerTimes.dhuhr),
        ashar: formatPrayerTime(prayerTimes.asr),
        maghrib: formatPrayerTime(prayerTimes.maghrib),
        isya: formatPrayerTime(prayerTimes.isha),
        rawTimes: prayerTimes
      });
    }

    return rows;
  }, [customLat, customLng, selectedMonth, selectedYear]);

  // Today's prayer times
  const todaySchedule = useMemo(() => {
    const todayRow = monthlySchedule.find(r => r.isToday);
    if (todayRow) return todayRow;

    // Fallback if current month is not selected
    const coords = new Coordinates(customLat, customLng);
    const params = CalculationMethod.Singapore();
    params.madhab = Madhab.Shafi;
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    const prayerTimes = new PrayerTimes(coords, now, params);
    const imsak = prayerTimes.fajr ? new Date(prayerTimes.fajr.getTime() - 10 * 60 * 1000) : null;
    const dhuha = prayerTimes.sunrise ? new Date(prayerTimes.sunrise.getTime() + 20 * 60 * 1000) : null;

    return {
      day: now.getDate(),
      date: now,
      dateString: now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
      dayName: now.toLocaleDateString('id-ID', { weekday: 'long' }),
      fullDateString: now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      isToday: true,
      imsak: formatPrayerTime(imsak),
      subuh: formatPrayerTime(prayerTimes.fajr),
      terbit: formatPrayerTime(prayerTimes.sunrise),
      dhuha: formatPrayerTime(dhuha),
      dzuhur: formatPrayerTime(prayerTimes.dhuhr),
      ashar: formatPrayerTime(prayerTimes.asr),
      maghrib: formatPrayerTime(prayerTimes.maghrib),
      isya: formatPrayerTime(prayerTimes.isha),
      rawTimes: prayerTimes
    };
  }, [monthlySchedule, customLat, customLng]);

  // Next prayer time countdown
  const nextPrayerInfo = useMemo(() => {
    const pt = todaySchedule.rawTimes;
    if (!pt) return { name: 'Menunggu', time: '--:--', remaining: '' };

    const list = [
      { name: 'Subuh', date: pt.fajr },
      { name: 'Terbit', date: pt.sunrise },
      { name: 'Dzuhur', date: pt.dhuhr },
      { name: 'Ashar', date: pt.asr },
      { name: 'Maghrib', date: pt.maghrib },
      { name: 'Isya', date: pt.isha },
    ];

    const currentTimestamp = now.getTime();
    for (const item of list) {
      if (item.date && item.date.getTime() > currentTimestamp) {
        const diffMs = item.date.getTime() - currentTimestamp;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          name: item.name,
          time: formatPrayerTime(item.date),
          remaining: `${diffHours > 0 ? `${diffHours} jam ` : ''}${diffMins} menit lagi`
        };
      }
    }

    return { name: 'Subuh Besok', time: todaySchedule.subuh, remaining: 'Besok pagi' };
  }, [todaySchedule]);

  // Print Monthly Schedule
  const handlePrintMonthlySchedule = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan izin pop-up browser Anda aktif.');
      return;
    }

    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthTitle = `${monthNames[selectedMonth]} ${selectedYear}`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jadwal Shalat 1 Bulan - ${customCityName} (${monthTitle})</title>
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f172a; margin: 0; padding: 10px; font-size: 11px; }
          .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { font-size: 18px; color: #0369a1; text-transform: uppercase; margin: 0 0 4px; letter-spacing: 0.5px; }
          .header p { margin: 2px 0; color: #475569; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: center; }
          th { background-color: #0284c7; color: white; font-weight: bold; font-size: 10.5px; text-transform: uppercase; }
          tr:nth-child(even) { background-color: #f8fafc; }
          tr.today { background-color: #fef08a !important; font-weight: bold; }
          .city-badge { font-weight: bold; color: #0369a1; }
          .footer { margin-top: 15px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>JADWAL SHALAT RESMI 1 BULAN PENUH</h1>
          <p>Wilayah: <span class="city-badge">${customCityName.toUpperCase()}</span> | Koordinat: ${customLat}°, ${customLng}°</p>
          <p>Periode: <strong>${monthTitle}</strong> | Standar Perhitungan: Kemenag RI (Subuh 20°, Isya 18°)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">Tgl</th>
              <th style="width: 70px;">Hari</th>
              <th>Imsak</th>
              <th>Subuh</th>
              <th>Terbit</th>
              <th>Dhuha</th>
              <th>Dzuhur</th>
              <th>Ashar</th>
              <th>Maghrib</th>
              <th>Isya</th>
            </tr>
          </thead>
          <tbody>
            ${monthlySchedule.map((row) => `
              <tr class="${row.isToday ? 'today' : ''}">
                <td><strong>${row.day}</strong></td>
                <td>${row.dayName}</td>
                <td>${row.imsak}</td>
                <td><strong>${row.subuh}</strong></td>
                <td>${row.terbit}</td>
                <td>${row.dhuha}</td>
                <td><strong>${row.dzuhur}</strong></td>
                <td><strong>${row.ashar}</strong></td>
                <td><strong style="color: #b91c1c;">${row.maghrib}</strong></td>
                <td><strong>${row.isya}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Dicetak dari Portal Alat Ajaib (alatajaib.vercel.app) • Perhitungan astronomi akurat 100% luring.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    triggerSuccess();
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    let csv = `JADWAL SHALAT ${customCityName.toUpperCase()} - ${monthNames[selectedMonth]} ${selectedYear}\n`;
    csv += `Tanggal,Hari,Imsak,Subuh,Terbit,Dhuha,Dzuhur,Ashar,Maghrib,Isya\n`;

    monthlySchedule.forEach(r => {
      csv += `${r.day},${r.dayName},${r.imsak},${r.subuh},${r.terbit},${r.dhuha},${r.dzuhur},${r.ashar},${r.maghrib},${r.isya}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jadwal_Shalat_${customCityName.replace(/\s+/g, '_')}_${monthNames[selectedMonth]}_${selectedYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerSuccess();
  };

  // Copy monthly schedule
  const handleCopyMonthText = () => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    let txt = `*JADWAL SHALAT BULAN ${monthNames[selectedMonth].toUpperCase()} ${selectedYear}*\n`;
    txt += `📍 *Wilayah:* ${customCityName}\n\n`;

    monthlySchedule.slice(0, 7).forEach(r => {
      txt += `• *Tgl ${r.day} (${r.dayName})* : Subuh ${r.subuh} | Dzuhur ${r.dzuhur} | Ashar ${r.ashar} | Maghrib ${r.maghrib} | Isya ${r.isya}\n`;
    });
    if (monthlySchedule.length > 7) {
      txt += `... (Total ${monthlySchedule.length} hari dalam bulan ini)\n`;
    }
    txt += `\n_Dihitung otomatis via Portal Alat Ajaib (alatajaib.vercel.app)_`;
    navigator.clipboard.writeText(txt);
    triggerSuccess();
  };


  // ----------------------------------------------------
  // 2. LIVE ROTATING QIBLA COMPASS ENGINE (WITH GYRO)
  // ----------------------------------------------------
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [deviceOrientationActive, setDeviceOrientationActive] = useState<boolean>(false);
  const [sensorPermissionRequested, setSensorPermissionRequested] = useState<boolean>(false);
  const [manualCompassRotation, setManualCompassRotation] = useState<number>(0);

  // Exact Ka'bah coordinates in Makkah
  const LAT_KAABAH = 21.4225;
  const LNG_KAABAH = 39.8262;

  // True Great-Circle Qibla Angle Calculation
  const qiblaAngle = useMemo(() => {
    const dLng = (LNG_KAABAH - customLng) * Math.PI / 180;
    const phi = customLat * Math.PI / 180;
    const phiK = LAT_KAABAH * Math.PI / 180;

    const y = Math.sin(dLng);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(dLng);
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    
    if (angle < 0) angle += 360;
    return Math.round(angle * 10) / 10;
  }, [customLat, customLng]);

  // Listen to device orientation (Gyroscope / Magnetic sensor)
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = 0;
      // iOS webkitCompassHeading support
      if ((event as any).webkitCompassHeading !== undefined) {
        heading = (event as any).webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Android standard alpha
        heading = 360 - event.alpha;
      }

      if (!isNaN(heading)) {
        setCompassHeading(Math.round(heading));
        setDeviceOrientationActive(true);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, []);

  // Request Sensor Permission for iOS 13+
  const requestCompassPermission = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setSensorPermissionRequested(true);
          setDeviceOrientationActive(true);
        } else {
          alert('Izin sensor gerak kompas ditolak oleh pengaturan browser.');
        }
      } catch (err) {
        console.error('Error requesting motion permission', err);
      }
    } else {
      setDeviceOrientationActive(true);
    }
  };

  // Active rotation angle of the dial
  const activeHeading = deviceOrientationActive ? compassHeading : manualCompassRotation;
  // Angle difference between current heading and qibla
  const headingDiff = useMemo(() => {
    let diff = Math.abs(activeHeading - qiblaAngle);
    if (diff > 180) diff = 360 - diff;
    return Math.round(diff);
  }, [activeHeading, qiblaAngle]);

  const isFacingQibla = headingDiff <= 4;

  // Haptic feedback when aligned
  useEffect(() => {
    if (isFacingQibla && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [isFacingQibla]);


  // ----------------------------------------------------
  // 3. TEXT REPEATER
  // ----------------------------------------------------
  const [repeaterInput, setRepeaterInput] = useState('');
  const [repeatCount, setRepeatCount] = useState(10);
  const [repeaterSeparator, setRepeaterSeparator] = useState<'newline' | 'space' | 'comma' | 'custom'>('newline');
  const [customSeparator, setCustomSeparator] = useState(' ');
  const [enableNumbering, setEnableNumbering] = useState(false);
  const [repeaterOutput, setRepeaterOutput] = useState('');

  useEffect(() => {
    if (!repeaterInput) {
      setRepeaterOutput('');
      return;
    }
    const arr: string[] = [];
    const count = Math.min(Math.max(1, repeatCount), 10000);
    for (let i = 1; i <= count; i++) {
      let line = repeaterInput;
      if (enableNumbering) line = `${i}. ${line}`;
      arr.push(line);
    }
    let sep = ' ';
    if (repeaterSeparator === 'newline') sep = '\n';
    else if (repeaterSeparator === 'comma') sep = ', ';
    else if (repeaterSeparator === 'custom') sep = customSeparator;

    setRepeaterOutput(arr.join(sep));
  }, [repeaterInput, repeatCount, repeaterSeparator, customSeparator, enableNumbering]);


  // ----------------------------------------------------
  // 4. AESTHETIC FONTS BUILDER & NORMALIZER
  // ----------------------------------------------------
  const [fontInput, setFontInput] = useState('Gaya Tulisan');
  const [aestheticOptions, setAestheticOptions] = useState<{ id: string; label: string; text: string }[]>([]);

  const boldAestheticMap = (str: string) => {
    const boldChars = "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳";
    const bubbleChars = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
    const scriptChars = "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃";
    const gothicChars = "𝔄𝔅𝔖𝔇𝔈𝔉𝔊𝔋𝔌𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔𝔕𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔚𝔞𝔟𝔖𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷";
    const italicChars = "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻";
    const monoChars = "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣";
    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    const convert = (charMap: string) => {
      return str.split('').map(char => {
        const idx = normalChars.indexOf(char);
        return idx !== -1 ? charMap.substring(idx * 2, idx * 2 + 2) || char : char;
      }).join('');
    };

    const convertSingle = (charMap: string) => {
      return str.split('').map(char => {
        const idx = normalChars.indexOf(char);
        return idx !== -1 ? charMap[idx] : char;
      }).join('');
    };

    return [
      { id: 'math-bold', label: 'Bold Serif Elegan', text: convert(boldChars) },
      { id: 'script', label: 'Cursive / Aesthetic Script', text: convert(scriptChars) },
      { id: 'italic', label: 'Italic Modern', text: convert(italicChars) },
      { id: 'mono', label: 'Typewriter Monospace', text: convert(monoChars) },
      { id: 'bubble', label: 'Bubble / Circle Text', text: convertSingle(bubbleChars) },
      { id: 'gothic', label: 'Medieval Gothic', text: convert(gothicChars) },
    ];
  };

  useEffect(() => {
    setAestheticOptions(boldAestheticMap(fontInput));
  }, [fontInput]);

  const [lebayInput, setLebayInput] = useState('ⓈⓐⓚⓤⒹⓘⓖⓘⓣⓐⓛ 𝓐𝓵𝓪𝓽 𝓐𝓳𝓪𝓲𝓫');
  const [normalizedOutput, setNormalizedOutput] = useState('');

  const handleNormalizeFonts = () => {
    const bubbleChars = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ";
    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    
    let cleaned = '';
    for (let i = 0; i < lebayInput.length; i++) {
      const char = lebayInput[i];
      const idx = bubbleChars.indexOf(char);
      if (idx !== -1) {
        cleaned += normalChars[idx];
      } else {
        cleaned += char;
      }
    }
    // Normalize NFKD for general Unicode stylized letters
    cleaned = cleaned.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
    setNormalizedOutput(cleaned || lebayInput);
    triggerSuccess();
  };


  // ----------------------------------------------------
  // 5. SELAMATAN KEMATIAN JAWA & TAHLILAN
  // ----------------------------------------------------
  const [passedDate, setPassedDate] = useState('2026-08-14');
  const [selamatanResult, setSelamatanResult] = useState<{ name: string; desc: string; date: string }[] | null>(null);

  const calculateSlametanDays = () => {
    const start = new Date(passedDate);
    
    const addDays = (d: Date, num: number) => {
      const temp = new Date(d);
      temp.setDate(temp.getDate() + num - 1);
      return temp.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const results = [
      { name: 'Slametan 3 Hari', desc: 'Penghormatan arwah hari ke-3 meninggal', date: addDays(start, 3) },
      { name: 'Slametan 7 Hari', desc: 'Peringatan tahlilan hari ke-7 meninggal', date: addDays(start, 7) },
      { name: 'Slametan 40 Hari', desc: 'Peringatan tahlilan hari ke-40 meninggal', date: addDays(start, 40) },
      { name: 'Slametan 100 Hari', desc: 'Peringatan tahlilan hari ke-100 meninggal', date: addDays(start, 100) },
      { name: 'Slametan Pendhak I (1 Tahun)', desc: 'Peringatan haul pertama (354 hari jawa)', date: addDays(start, 354) },
      { name: 'Slametan Pendhak II (2 Tahun)', desc: 'Peringatan haul kedua (708 hari jawa)', date: addDays(start, 708) },
      { name: 'Slametan Nyewu (1000 Hari)', desc: 'Puncak tahlilan peringatan hari ke-1000 meninggal', date: addDays(start, 1000) },
    ];

    setSelamatanResult(results);
    triggerSuccess();
  };


  return (
    <div className="space-y-6">
      
      {/* ---------------------------------------------------- */}
      {/* 1. JADWAL SHOLAT DIGITAL (1 BULAN LENGKAP & SEMUA WILAYAH) */}
      {/* ---------------------------------------------------- */}
      {toolId === 'jadwal-sholat' && (
        <div className="space-y-5">
          {/* TOP CONTROLS & CITY SELECTOR */}
          <div className="bg-slate-50 dark:bg-slate-850/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Jadwal Shalat Akurat Seluruh Indonesia (1 Bulan Penuh)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Perhitungan astronomi presisi Kemenag RI (Subuh 20°, Isya 18°) untuk seluruh 38 provinsi, kota & kabupaten.
                </p>
              </div>

              {/* TABS: HARI INI VS 1 BULAN */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-750 self-start md:self-auto shrink-0 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('month')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'month' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Jadwal 1 Bulan
                </button>
                <button
                  onClick={() => setActiveTab('today')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  Hari Ini
                </button>
              </div>
            </div>

            {/* SELECTION BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              
              {/* CITY DROPDOWN */}
              <div className="lg:col-span-5 space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">PILIH KOTA / KABUPATEN INDONESIA</label>
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <optgroup label="📍 Lokasi Kustom / GPS">
                    <option value="custom">{customCityName}</option>
                  </optgroup>
                  <optgroup label="🏙️ Daftar Kota & Kabupaten Se-Indonesia (38 Provinsi)">
                    {INDONESIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* MONTH SELECTOR */}
              <div className="lg:col-span-3 space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">BULAN</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              {/* YEAR SELECTOR */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider block">TAHUN</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* GPS TRIGGER BUTTON */}
              <div className="lg:col-span-2 flex items-end">
                <button
                  onClick={handleDetectGps}
                  disabled={gpsLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Deteksi lokasi akurat via GPS perangkat"
                >
                  <LocateFixed className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                  <span>{gpsLoading ? 'Mencari...' : 'GPS Saya'}</span>
                </button>
              </div>

            </div>

            {/* QUICK ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-2xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Wilayah Aktif: <strong>{customCityName}</strong> (Lat: {customLat}°, Lng: {customLng}°)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrintMonthlySchedule}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-2xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Lembar A4</span>
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
                <button
                  onClick={handleCopyMonthText}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-2xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Jadwal</span>
                </button>
              </div>
            </div>

          </div>

          {/* TAB 1: VIEW TODAY SPOTLIGHT */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 p-6 rounded-3xl text-white border border-emerald-800/40 shadow-lg space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/30 pb-4">
                  <div>
                    <span className="text-2xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">JADWAL HARI INI</span>
                    <h4 className="text-lg font-black">{todaySchedule.fullDateString}</h4>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl text-center sm:text-right">
                    <span className="text-3xs text-emerald-300 block uppercase font-mono">Shalat Berikutnya</span>
                    <span className="text-sm font-black text-emerald-300">
                      {nextPrayerInfo.name} • {nextPrayerInfo.time} ({nextPrayerInfo.remaining})
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
                  {[
                    { label: 'Imsak', val: todaySchedule.imsak, color: 'text-amber-300' },
                    { label: 'Subuh', val: todaySchedule.subuh, color: 'text-emerald-400' },
                    { label: 'Terbit', val: todaySchedule.terbit, color: 'text-slate-300' },
                    { label: 'Dhuha', val: todaySchedule.dhuha, color: 'text-amber-200' },
                    { label: 'Dzuhur', val: todaySchedule.dzuhur, color: 'text-emerald-400' },
                    { label: 'Ashar', val: todaySchedule.ashar, color: 'text-emerald-400' },
                    { label: 'Maghrib', val: todaySchedule.maghrib, color: 'text-rose-400' },
                    { label: 'Isya', val: todaySchedule.isya, color: 'text-emerald-400' },
                  ].map((p, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-2xl text-center shadow-inner">
                      <span className="text-3xs text-slate-400 block font-bold uppercase">{p.label}</span>
                      <span className={`text-base font-black ${p.color} block mt-1`}>{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIEW FULL MONTH TABLE */}
          {activeTab === 'month' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Tabel 1 Bulan: {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][selectedMonth]} {selectedYear}
                </span>
                <span className="text-3xs text-slate-500 font-mono">Total {monthlySchedule.length} Hari</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 text-3xs font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                      <th className="py-2.5 px-3">Tgl</th>
                      <th className="py-2.5 px-3 text-left">Hari</th>
                      <th className="py-2.5 px-2">Imsak</th>
                      <th className="py-2.5 px-2 text-emerald-600 dark:text-emerald-400 font-black">Subuh</th>
                      <th className="py-2.5 px-2 text-slate-400">Terbit</th>
                      <th className="py-2.5 px-2 text-amber-600 dark:text-amber-400">Dhuha</th>
                      <th className="py-2.5 px-2 text-emerald-600 dark:text-emerald-400 font-black">Dzuhur</th>
                      <th className="py-2.5 px-2 text-emerald-600 dark:text-emerald-400 font-black">Ashar</th>
                      <th className="py-2.5 px-2 text-rose-600 dark:text-rose-400 font-black">Maghrib</th>
                      <th className="py-2.5 px-2 text-emerald-600 dark:text-emerald-400 font-black">Isya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {monthlySchedule.map((row) => (
                      <tr 
                        key={row.day} 
                        className={`transition-colors ${
                          row.isToday 
                            ? 'bg-amber-50 dark:bg-amber-950/30 font-bold border-l-4 border-l-amber-500' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-850/40'
                        }`}
                      >
                        <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">{row.day}</td>
                        <td className="py-2 px-3 text-left font-sans text-slate-600 dark:text-slate-300">{row.dayName}</td>
                        <td className="py-2 px-2 text-slate-500">{row.imsak}</td>
                        <td className="py-2 px-2 font-bold text-emerald-700 dark:text-emerald-400">{row.subuh}</td>
                        <td className="py-2 px-2 text-slate-400">{row.terbit}</td>
                        <td className="py-2 px-2 text-amber-600 dark:text-amber-400">{row.dhuha}</td>
                        <td className="py-2 px-2 font-bold text-emerald-700 dark:text-emerald-400">{row.dzuhur}</td>
                        <td className="py-2 px-2 font-bold text-emerald-700 dark:text-emerald-400">{row.ashar}</td>
                        <td className="py-2 px-2 font-bold text-rose-600 dark:text-rose-400">{row.maghrib}</td>
                        <td className="py-2 px-2 font-bold text-emerald-700 dark:text-emerald-400">{row.isya}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 2. COMPASS QIBLA (LIVE MOVING ROTATION & SENSOR HP) */}
      {/* ---------------------------------------------------- */}
      {toolId === 'qibla-compass' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: CONTROLS & CITY SELECTOR */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">Kompas Arah Kiblat Real-Time</span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Menghitung sudut presisi ke Ka'bah Makkah dan mendeteksi sensor kompas HP saat perangkat diputar.
                </p>
              </div>

              {/* CITY SELECTOR */}
              <div className="space-y-1.5">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider">PILIH KOTA / PROVINSI</label>
                <select 
                  value={selectedCityId} 
                  onChange={(e) => handleCityChange(e.target.value)} 
                  className="w-full text-xs p-2.5 font-bold border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                >
                  <optgroup label="📍 Lokasi Kustom / GPS">
                    <option value="custom">{customCityName}</option>
                  </optgroup>
                  <optgroup label="🏙️ Seluruh Wilayah Indonesia">
                    {INDONESIAN_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.province})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* GPS TRIGGER */}
              <button
                onClick={handleDetectGps}
                disabled={gpsLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <LocateFixed className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{gpsLoading ? 'Mendeteksi Posisi...' : 'Gunakan GPS Lokasi Saya Sekarang'}</span>
              </button>

              {/* MOTION SENSOR TOGGLE FOR MOBILE */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <button
                  onClick={requestCompassPermission}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Aktifkan Sensor Gerak Kompas HP</span>
                </button>
                <p className="text-3xs text-slate-400 leading-tight">
                  Di HP: Pegang HP mendatar, putar badan Anda sampai jarum hijau menunjuk tepat ke atas.
                </p>
              </div>

              {/* MANUAL ROTATION SLIDER FOR DESKTOP / LAPTOP */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-3xs font-bold text-slate-500">
                  <span>SIMULASI PUTAR KOMPAS (DESKTOP)</span>
                  <span className="font-mono">{manualCompassRotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={manualCompassRotation}
                  onChange={(e) => {
                    setManualCompassRotation(parseInt(e.target.value));
                    setDeviceOrientationActive(false);
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* METADATA INFO */}
              <div className="text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono">
                <p className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-500" />
                  Sudut Kiblat Wilayah Ini: <span className="text-emerald-600 dark:text-emerald-400 font-black">{qiblaAngle}°</span> (Barat Laut)
                </p>
                <p className="text-3xs text-slate-400">
                  Arah Hadap Perangkat: <strong>{activeHeading}°</strong>
                </p>
                <p className="text-3xs text-slate-400">
                  Selisih Derajat: <strong>{headingDiff}°</strong> {isFacingQibla ? '• (TEPAT MENJURUS KE KA\'BAH!)' : ''}
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT: LIVE COMPASS VISUAL CANVAS */}
          <div className="lg:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col justify-center items-center min-h-[420px] relative overflow-hidden">
            
            {/* STATUS BANNER */}
            <div className={`mb-6 px-4 py-1.5 rounded-full text-xs font-black tracking-wide flex items-center gap-1.5 transition-all ${
              isFacingQibla 
                ? 'bg-emerald-500 text-slate-950 animate-bounce shadow-lg shadow-emerald-500/30' 
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}>
              {isFacingQibla ? (
                <>
                  <CheckCircle2 className="w-4 h-4 fill-slate-950 text-white" />
                  <span>TEPAT MENGHADAP KIBLAT ({qiblaAngle}°)</span>
                </>
              ) : (
                <span>Putar HP sampai panah hijau lurus ke atas (Selisih {headingDiff}°)</span>
              )}
            </div>

            {/* ROTATING COMPASS DIAL */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 border-slate-750 flex items-center justify-center bg-slate-900/90 shadow-2xl transition-transform duration-200">
              
              {/* COMPASS ROSE TICKS (ROTATES WITH HEADING) */}
              <div 
                className="absolute inset-0 rounded-full transition-transform duration-200 flex items-center justify-center"
                style={{ transform: `rotate(${-activeHeading}deg)` }}
              >
                {/* 4 CARDINAL POINTS */}
                <span className="absolute top-2.5 text-xs font-black text-rose-500 font-mono">U (0°)</span>
                <span className="absolute bottom-2.5 text-xs font-black text-slate-400 font-mono">S (180°)</span>
                <span className="absolute right-2.5 text-xs font-black text-slate-400 font-mono">T (90°)</span>
                <span className="absolute left-2.5 text-xs font-black text-slate-400 font-mono">B (270°)</span>

                {/* DEGREE TICKS */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <div 
                    key={deg} 
                    className="absolute w-full h-full flex justify-center pointer-events-none"
                    style={{ transform: `rotate(${deg}deg)` }}
                  >
                    <div className="w-0.5 h-2 bg-slate-700 mt-1" />
                  </div>
                ))}

                {/* TARGET QIBLA ICON ON THE DIAL */}
                <div 
                  className="absolute w-full h-full flex flex-col items-center pointer-events-none"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[9px] font-black shadow-md mt-6 flex items-center gap-0.5">
                    <span>🕋 KIBLAT {qiblaAngle}°</span>
                  </div>
                  <div className="w-0.5 h-10 bg-emerald-500" />
                </div>
              </div>

              {/* FIXED CENTER POINTER (ALWAYS POINTS UPWARDS ON DEVICE) */}
              <div className="relative z-10 flex flex-col items-center">
                <Navigation 
                  className={`w-14 h-14 transition-all ${
                    isFacingQibla ? 'text-emerald-400 scale-110 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]' : 'text-slate-400'
                  }`} 
                />
                <div className="w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow mt-1" />
              </div>

            </div>

            {/* LOCATION FOOTER */}
            <p className="text-xs text-slate-400 mt-5 font-mono text-center">
              Arah Ka'bah dari <strong>{customCityName}</strong>: {qiblaAngle}° NW
            </p>

          </div>

        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 3. AESTHETIC FONTS BUILDER */}
      {/* ---------------------------------------------------- */}
      {toolId === 'font-aesthetic' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Generator Tulisan Unik & Aesthetic</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ketik tulisan biasa untuk diubah menjadi berbagai gaya font keren siap salin ke bio IG, WA, atau TikTok.</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Ketik Teks Di Sini:</label>
            <input 
              type="text" 
              value={fontInput} 
              onChange={(e) => setFontInput(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100 outline-none" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {aestheticOptions.map((opt) => (
              <div key={opt.id} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-3xs font-black text-slate-400 uppercase tracking-wider block">{opt.label}</span>
                  <p className="text-base font-medium text-slate-900 dark:text-slate-100 break-words mt-1 select-all">{opt.text}</p>
                </div>
                <div className="pt-2 flex justify-end border-t border-slate-200/60 dark:border-slate-800">
                  <CopyButton textToCopy={opt.text} label="Salin Gaya Ini" size="sm" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 4. FONT NORMALIZER */}
      {/* ---------------------------------------------------- */}
      {toolId === 'font-normalizer' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Pembersih Font Lebay / Font Normalizer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ubah tulisan aneh/bergaya simbol kembali menjadi huruf normal alfabet yang mudah dibaca.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tempel Teks Yang Ingin Dinormalkan:</label>
            <textarea
              rows={3}
              value={lebayInput}
              onChange={(e) => setLebayInput(e.target.value)}
              className="w-full text-xs p-3 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>

          <button
            onClick={handleNormalizeFonts}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Normalkan Huruf Menjadi Alfabet Biasa
          </button>

          {normalizedOutput && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
              <span className="text-3xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">HASIL TEKS BERSIH:</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 select-all">{normalizedOutput}</p>
              <div className="pt-2 flex justify-end">
                <CopyButton textToCopy={normalizedOutput} label="Salin Teks Normal" size="sm" variant="primary" />
              </div>
            </div>
          )}
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 5. TEXT REPEATER */}
      {/* ---------------------------------------------------- */}
      {toolId === 'text-repeater' && (
        <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">Pengulang Teks Massal (Text Repeater)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ulangi pesan atau kalimat hingga ribuan kali secara instan untuk spam chat atau keperluan teks berulang.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-3xs font-black text-slate-400 uppercase tracking-wider">TEKS YANG AKAN DIULANG</label>
              <input
                type="text"
                value={repeaterInput}
                onChange={(e) => setRepeaterInput(e.target.value)}
                placeholder="Contoh: Semangat pagi!"
                className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-black text-slate-400 uppercase tracking-wider">JUMLAH ULANGAN</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={repeatCount}
                onChange={(e) => setRepeatCount(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-center font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-3xs font-black text-slate-400 uppercase tracking-wider">PEMISAH</label>
              <select
                value={repeaterSeparator}
                onChange={(e) => setRepeaterSeparator(e.target.value as any)}
                className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none"
              >
                <option value="newline">Baris Baru (Enter)</option>
                <option value="space">Spasi</option>
                <option value="comma">Koma (,)</option>
                <option value="custom">Pemisah Kustom</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableNumbering}
                  onChange={(e) => setEnableNumbering(e.target.checked)}
                  className="rounded text-emerald-600 w-4 h-4"
                />
                <span>Tambahkan Nomor Urut (1, 2, 3...)</span>
              </label>
            </div>
          </div>

          {repeaterOutput && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-black text-slate-400 uppercase tracking-wider">HASIL PENGULANGAN:</span>
                <CopyButton textToCopy={repeaterOutput} label="Salin Semua Teks" size="sm" variant="primary" />
              </div>
              <textarea
                readOnly
                rows={6}
                value={repeaterOutput}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono resize-y"
              />
            </div>
          )}
        </div>
      )}


      {/* ---------------------------------------------------- */}
      {/* 6. SELAMATAN KEMATIAN JAWA & TAHLILAN */}
      {/* ---------------------------------------------------- */}
      {toolId === 'selamatan-jawa' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
              <div>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">Kalkulator Selamatan Kematian Jawa</span>
                <p className="text-xs text-slate-500 mt-0.5">Hitung hari peringatan tahlilan: 3 hari, 7 hari, 40 hari, 100 hari, 1 tahun, 2 tahun, hingga 1000 hari.</p>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-black text-slate-400 uppercase tracking-wider">TANGGAL MENINGGAL (GEBREGAN)</label>
                <input
                  type="date"
                  value={passedDate}
                  onChange={(e) => setPassedDate(e.target.value)}
                  className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none font-mono"
                />
              </div>

              <button
                onClick={calculateSlametanDays}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Hitung Seluruh Hari Selamatan
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {selamatanResult ? (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Jadwal Hari Peringatan Tahlilan:
                </span>

                <div className="space-y-2">
                  {selamatanResult.map((slam, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 dark:text-slate-100 block">{slam.name}</strong>
                        <span className="text-3xs text-slate-400">{slam.desc}</span>
                      </div>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{slam.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Calendar className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Pilih tanggal meninggal di sebelah kiri untuk menghitung.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

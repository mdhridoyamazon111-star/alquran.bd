const fs = require('fs');
const path = require('path');

// Surah names in Bengali and English
const surahNames = {
  1: { bn: "আল-ফাতিহা", en: "Al-Fatiha", meaning: "The Opening" },
  2: { bn: "আল-বাকারা", en: "Al-Baqara", meaning: "The Cow" },
  3: { bn: "আল-ইমরান", en: "Aal-E-Imran", meaning: "Family of Imran" },
  4: { bn: "আন-নিসা", en: "An-Nisa", meaning: "The Women" },
  5: { bn: "আল-মায়িদাহ", en: "Al-Ma'idah", meaning: "The Table Spread" },
  6: { bn: "আল-আনআম", en: "Al-An'am", meaning: "The Cattle" },
  7: { bn: "আল-আরাফ", en: "Al-A'raf", meaning: "The Heights" },
  8: { bn: "আল-আনফাল", en: "Al-Anfal", meaning: "The Spoils of War" },
  9: { bn: "আত-তাওবাহ", en: "At-Tawbah", meaning: "The Repentance" },
  10: { bn: "ইউনুস", en: "Yunus", meaning: "Jonah" },
  11: { bn: "হুদ", en: "Hud", meaning: "Hud" },
  12: { bn: "ইউসুফ", en: "Yusuf", meaning: "Joseph" },
  13: { bn: "আর-রাদ", en: "Ar-Ra'd", meaning: "The Thunder" },
  14: { bn: "ইবরাহিম", en: "Ibrahim", meaning: "Abraham" },
  15: { bn: "আল-হিজর", en: "Al-Hijr", meaning: "The Rocky Tract" },
  16: { bn: "আন-নাহল", en: "An-Nahl", meaning: "The Bee" },
  17: { bn: "আল-ইসরা", en: "Al-Isra", meaning: "The Night Journey" },
  18: { bn: "আল-কাহফ", en: "Al-Kahf", meaning: "The Cave" },
  19: { bn: "মারিয়াম", en: "Maryam", meaning: "Mary" },
  20: { bn: "তা-হা", en: "Ta-Ha", meaning: "Ta-Ha" },
  21: { bn: "আল-আম্বিয়া", en: "Al-Anbiya", meaning: "The Prophets" },
  22: { bn: "আল-হাজ্জ", en: "Al-Hajj", meaning: "The Pilgrimage" },
  23: { bn: "আল-মুমিনুন", en: "Al-Mu'minun", meaning: "The Believers" },
  24: { bn: "আন-নূর", en: "An-Nur", meaning: "The Light" },
  25: { bn: "আল-ফুরকান", en: "Al-Furqan", meaning: "The Criterion" },
  26: { bn: "আশ-শুআরা", en: "Ash-Shu'ara", meaning: "The Poets" },
  27: { bn: "আন-নামল", en: "An-Naml", meaning: "The Ant" },
  28: { bn: "আল-কাসাস", en: "Al-Qasas", meaning: "The Stories" },
  29: { bn: "আল-আনকাবুত", en: "Al-Ankabut", meaning: "The Spider" },
  30: { bn: "আর-রুম", en: "Ar-Rum", meaning: "The Romans" },
  31: { bn: "লুকমান", en: "Luqman", meaning: "Luqman" },
  32: { bn: "আস-সাজদাহ", en: "As-Sajdah", meaning: "The Prostration" },
  33: { bn: "আল-আহজাব", en: "Al-Ahzab", meaning: "The Combined Forces" },
  34: { bn: "সাবা", en: "Saba", meaning: "Sheba" },
  35: { bn: "ফাতির", en: "Fatir", meaning: "Originator" },
  36: { bn: "ইয়াসিন", en: "Ya-Sin", meaning: "Ya-Sin" },
  37: { bn: "আস-সাফফাত", en: "As-Saffat", meaning: "Those who set the Ranks" },
  38: { bn: "সাদ", en: "Sad", meaning: "The Letter Saad" },
  39: { bn: "আয-যুমার", en: "Az-Zumar", meaning: "The Troops" },
  40: { bn: "গাফির", en: "Ghafir", meaning: "The Forgiver" },
  41: { bn: "ফুসসিলাত", en: "Fussilat", meaning: "Explained in Detail" },
  42: { bn: "আশ-শুরা", en: "Ash-Shura", meaning: "The Consultation" },
  43: { bn: "আয-যুখরুফ", en: "Az-Zukhruf", meaning: "The Ornaments of Gold" },
  44: { bn: "আদ-দুখান", en: "Ad-Dukhan", meaning: "The Smoke" },
  45: { bn: "আল-জাসিয়াহ", en: "Al-Jathiyah", meaning: "The Crouching" },
  46: { bn: "আল-আহকাফ", en: "Al-Ahqaf", meaning: "The Wind-Curved Sandhills" },
  47: { bn: "মুহাম্মদ", en: "Muhammad", meaning: "Muhammad" },
  48: { bn: "আল-ফাতহ", en: "Al-Fath", meaning: "The Victory" },
  49: { bn: "আল-হুজুরাত", en: "Al-Hujurat", meaning: "The Rooms" },
  50: { bn: "কাফ", en: "Qaf", meaning: "The Letter Qaf" },
  51: { bn: "আয-যারিয়াত", en: "Az-Zariyat", meaning: "The Winnowing Winds" },
  52: { bn: "আত-তুর", en: "At-Tur", meaning: "The Mount" },
  53: { bn: "আন-নাজম", en: "An-Najm", meaning: "The Star" },
  54: { bn: "আল-কামার", en: "Al-Qamar", meaning: "The Moon" },
  55: { bn: "আর-রাহমান", en: "Ar-Rahman", meaning: "The Beneficent" },
  56: { bn: "আল-ওয়াকিয়াহ", en: "Al-Waqi'ah", meaning: "The Inevitable" },
  57: { bn: "আল-হাদিদ", en: "Al-Hadid", meaning: "The Iron" },
  58: { bn: "আল-মুজাদিলাহ", en: "Al-Mujadila", meaning: "The Pleading Woman" },
  59: { bn: "আল-হাশর", en: "Al-Hashr", meaning: "The Exile" },
  60: { bn: "আল-মুমতাহিনাহ", en: "Al-Mumtahanah", meaning: "She that is to be examined" },
  61: { bn: "আস-সাফ", en: "As-Saff", meaning: "The Ranks" },
  62: { bn: "আল-জুমুআহ", en: "Al-Jumu'ah", meaning: "The Congregation" },
  63: { bn: "আল-মুনাফিকুন", en: "Al-Munafiqun", meaning: "The Hypocrites" },
  64: { bn: "আত-তাগাবুন", en: "At-Taghabun", meaning: "The Mutual Disillusion" },
  65: { bn: "আত-তালাক", en: "At-Talaq", meaning: "The Divorce" },
  66: { bn: "আত-তাহরিম", en: "At-Tahrim", meaning: "The Prohibition" },
  67: { bn: "আল-মুলক", en: "Al-Mulk", meaning: "The Sovereignty" },
  68: { bn: "আল-কালাম", en: "Al-Qalam", meaning: "The Pen" },
  69: { bn: "আল-হাক্কাহ", en: "Al-Haqqah", meaning: "The Reality" },
  70: { bn: "আল-মাআরিজ", en: "Al-Ma'arij", meaning: "The Ascending Stairways" },
  71: { bn: "নূহ", en: "Nuh", meaning: "Noah" },
  72: { bn: "আল-জিন", en: "Al-Jinn", meaning: "The Jinn" },
  73: { bn: "আল-মুজাম্মিল", en: "Al-Muzzammil", meaning: "The Enshrouded One" },
  74: { bn: "আল-মুদাস্সির", en: "Al-Muddaththir", meaning: "The Cloaked One" },
  75: { bn: "আল-কিয়ামাহ", en: "Al-Qiyamah", meaning: "The Resurrection" },
  76: { bn: "আল-ইনসান", en: "Al-Insan", meaning: "The Man" },
  77: { bn: "আল-মুরসালাত", en: "Al-Mursalat", meaning: "The Emissaries" },
  78: { bn: "আন-নাবা", en: "An-Naba", meaning: "The Tidings" },
  79: { bn: "আন-নাযিআত", en: "An-Nazi'at", meaning: "Those who drag forth" },
  80: { bn: "আবাসা", en: "Abasa", meaning: "He Frowned" },
  81: { bn: "আত-তাকভির", en: "At-Takwir", meaning: "The Overthrowing" },
  82: { bn: "আল-ইনফিতার", en: "Al-Infitar", meaning: "The Cleaving" },
  83: { bn: "আল-মুতাফফিফিন", en: "Al-Mutaffifin", meaning: "The Defrauding" },
  84: { bn: "আল-ইনশিকাক", en: "Al-Inshiqaq", meaning: "The Splitting" },
  85: { bn: "আল-বুরুজ", en: "Al-Buruj", meaning: "The Mansions of the Stars" },
  86: { bn: "আত-তারিক", en: "At-Tariq", meaning: "The Nightcommer" },
  87: { bn: "আল-আলা", en: "Al-A'la", meaning: "The Most High" },
  88: { bn: "আল-গাশিয়াহ", en: "Al-Ghashiyah", meaning: "The Overwhelming" },
  89: { bn: "আল-ফাজর", en: "Al-Fajr", meaning: "The Dawn" },
  90: { bn: "আল-বালাদ", en: "Al-Balad", meaning: "The City" },
  91: { bn: "আশ-শামস", en: "Ash-Shams", meaning: "The Sun" },
  92: { bn: "আল-লাইল", en: "Al-Layl", meaning: "The Night" },
  93: { bn: "আদ-দুহা", en: "Ad-Duhaa", meaning: "The Morning Hours" },
  94: { bn: "আশ-শারহ", en: "Ash-Sharh", meaning: "The Relief" },
  95: { bn: "আত-তিন", en: "At-Tin", meaning: "The Fig" },
  96: { bn: "আল-আলাক", en: "Al-Alaq", meaning: "The Clot" },
  97: { bn: "আল-কদর", en: "Al-Qadr", meaning: "The Power" },
  98: { bn: "আল-বাইয়িনাহ", en: "Al-Bayyinah", meaning: "The Clear Proof" },
  99: { bn: "আয-যালযালাহ", en: "Az-Zalzalah", meaning: "The Earthquake" },
  100: { bn: "আল-আদিয়াত", en: "Al-Adiyat", meaning: "The Courser" },
  101: { bn: "আল-কারিয়াহ", en: "Al-Qari'ah", meaning: "The Calamity" },
  102: { bn: "আত-তাকাথুর", en: "At-Takathur", meaning: "The Rivalry in world increase" },
  103: { bn: "আল-আসর", en: "Al-Asr", meaning: "The Declining Day" },
  104: { bn: "আল-হুমাযাহ", en: "Al-Humazah", meaning: "The Traducer" },
  105: { bn: "আল-ফিল", en: "Al-Fil", meaning: "The Elephant" },
  106: { bn: "কুরাইশ", en: "Quraysh", meaning: "Quraysh" },
  107: { bn: "আল-মাউন", en: "Al-Ma'un", meaning: "The Small Kindnesses" },
  108: { bn: "আল-কাওসার", en: "Al-Kawthar", meaning: "The Abundance" },
  109: { bn: "আল-কাফিরুন", en: "Al-Kafirun", meaning: "The Disbelievers" },
  110: { bn: "আন-নাসর", en: "An-Nasr", meaning: "The Divine Support" },
  111: { bn: "আল-মাসাদ", en: "Al-Masad", meaning: "The Palm Fiber" },
  112: { bn: "আল-ইখলাস", en: "Al-Ikhlas", meaning: "The Sincerity" },
  113: { bn: "আল-ফালাক", en: "Al-Falaq", meaning: "The Daybreak" },
  114: { bn: "আন-নাস", en: "An-Nas", meaning: "Mankind" }
};

// Read the reader.html file
const readerHtml = fs.readFileSync(path.join(__dirname, 'reader.html'), 'utf8');

// Extract CSS from reader.html
const cssMatch = readerHtml.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch ? cssMatch[1] : '';

// Create surah pages directory
const surahDir = path.join(__dirname, 'surahs');
if (!fs.existsSync(surahDir)) {
  fs.mkdirSync(surahDir);
}

// Generate HTML for each surah
for (let i = 1; i <= 114; i++) {
  const surah = surahNames[i];
  const fileName = `surah-${i}.html`;
  const filePath = path.join(surahDir, fileName);
  
  const html = `<!DOCTYPE html>
<html lang="bn" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>সূরা ${surah.bn} (${surah.en}) - ${surah.meaning} | আল কুরআন মাজীদ</title>
  <meta name="description" content="সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}। আল কুরআনের ${i} নম্বর সূরা আরবি টেক্সট ও বাংলা অনুবাদসহ। সম্পূর্ণ কুরআন শরীফ পড়ুন।" />
  <meta name="keywords" content="সূরা ${surah.bn}, ${surah.en}, Surah ${i}, ${surah.meaning}, আল কুরআন, কুরআন শরীফ, বাংলা কুরআন, Quran in Bengali, Bangla Quran, Islamic app" />
  <meta name="author" content="Al Quran BD" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://alquran-bd.pages.dev/surahs/${fileName}" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://alquran-bd.pages.dev/surahs/${fileName}" />
  <meta property="og:title" content="সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}" />
  <meta property="og:description" content="সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}। আল কুরআনের ${i} নম্বর সূরা আরবি টেক্সট ও বাংলা অনুবাদসহ।" />
  <meta property="og:image" content="https://alquran-bd.pages.dev/images/Sura.jpg" />
  <meta property="og:locale" content="bn_BD" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://alquran-bd.pages.dev/surahs/${fileName}" />
  <meta property="twitter:title" content="সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}" />
  <meta property="twitter:description" content="সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}। আল কুরআনের ${i} নম্বর সূরা আরবি টেক্সট ও বাংলা অনুবাদসহ।" />
  <meta property="twitter:image" content="https://alquran-bd.pages.dev/images/Sura.jpg" />

  <!-- Structured Data / Schema.org -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "name": "সূরা ${surah.bn} (${surah.en})",
    "headline": "সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}",
    "description": "সূরা ${surah.bn} (${surah.en}) - ${surah.meaning}। আল কুরআনের ${i} নম্বর সূরা আরবি টেক্সট ও বাংলা অনুবাদসহ।",
    "url": "https://alquran-bd.pages.dev/surahs/${fileName}",
    "inLanguage": ["bn", "ar"],
    "author": {
      "@type": "Organization",
      "name": "Al Quran BD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Al Quran BD",
      "logo": {
        "@type": "ImageObject",
        "url": "https://alquran-bd.pages.dev/images/বাংলা কোরআন মাজীদ.png"
      }
    }
  }
  </script>

  <!-- PWA: installable on mobile / tablet / desktop -->
  <link rel="manifest" href="../manifest.webmanifest" />
  <meta name="theme-color" content="#0c2321" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="আল কুরআন" />
  <meta name="google" content="notranslate" />
  <link rel="apple-touch-icon" href="../icons/apple-touch-icon.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="../icons/icon-192.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&family=Reem+Kufi:wght@400;700&family=Noto+Sans+Bengali:wght@400;600&display=swap"
    rel="stylesheet"
  />

  <style>
    ${css}
  </style>
</head>
<body>
  <div class="top-nav">
    <a href="../reader.html" class="btn">← হোম</a>
    <span class="btn active">সূরা ${surah.bn}</span>
  </div>

  <div class="surah-header">
    <h1>সূরা ${surah.bn}</h1>
    <h2>${surah.en} - ${surah.meaning}</h2>
    <p>সূরা নম্বর: ${i}</p>
  </div>

  <div id="ayahs" class="ayahs">
    <div class="loading">
      <p>সূরা লোড হচ্ছে...</p>
      <p>অনুগ্রহ করে মূল অ্যাপে পড়ুন: <a href="../reader.html#${i}">এখানে ক্লিক করুন</a></p>
    </div>
  </div>

  <script>
    // Redirect to main app with surah number
    window.location.href = '../reader.html#${i}';
  </script>
</body>
</html>`;

  fs.writeFileSync(filePath, html);
  console.log(`Generated: ${fileName}`);
}

console.log('\\nAll 114 surah pages generated successfully!');
console.log('Directory: surahs/');

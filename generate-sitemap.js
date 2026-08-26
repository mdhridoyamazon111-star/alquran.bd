const fs = require('fs');

const today = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://alquran-bd.pages.dev/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://alquran-bd.pages.dev/reader.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://alquran-bd.pages.dev/qibla_finder.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://alquran-bd.pages.dev/noorani_qaida.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;

// Add all 114 surah pages
for (let i = 1; i <= 114; i++) {
  sitemap += `  <url>
    <loc>https://alquran-bd.pages.dev/surahs/surah-${i}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;
}

sitemap += `</urlset>
`;

fs.writeFileSync('sitemap.xml', sitemap);
console.log('Sitemap updated with lastmod dates for all pages!');

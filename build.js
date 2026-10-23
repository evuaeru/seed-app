const fs = require('fs');
const path = require('path');

const webFiles = [
  'index.html',
  'install.html',
  'styles.css',
  'app.js',
  'manifest.json',
  'manifest-release.json',
  'manifest-demo.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png'
];
const wwwDir = path.join(__dirname, 'www');
const androidPublicDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');

if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

webFiles.forEach((f) => {
  const src = path.join(__dirname, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(wwwDir, f));
  }
});
console.log('✓ Web assets synced to www/');

if (fs.existsSync(androidPublicDir)) {
  webFiles.forEach((f) => {
    const src = path.join(__dirname, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(androidPublicDir, f));
    }
  });
  console.log('✓ Web assets synced to android/app/src/main/assets/public/');
}

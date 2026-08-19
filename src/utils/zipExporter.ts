/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export async function downloadProjectZip() {
  const zip = new JSZip();

  // Add README & Mobile Guide
  zip.file('README.md', `# 🕌 تطبيق نور الإسلام (Noor Al-Islam)

تطبيق إسلامي شامل وحديث يضم:
- مواقيت الصلاة الدقيقة والأذان
- تنبيهات النظام الأصلية (Native Notifications) لشاشة القفل للآيفون والأندرويد
- القرآن الكريم كاملاً مع التفاسير والتلاوات
- منصة إحسان الإسلامية للعمل الخيري (ehsan.sa)
- دقيقتان لآخرتك (أدعية صوتية ومقروءة)
- حصن المسلم والأذكار والسبحة الإلكترونية وبوصلة القبلة

## 🚀 التشغيل والتطوير:
1. \`npm install\`
2. \`npm run dev\`

## 📱 بناء تطبيقات الآيفون والأندرويد عبر Capacitor:
- لإضافة أندرويد: \`npx cap add android\` ثم \`npx cap open android\`
- لإضافة آيفون: \`npx cap add ios\` ثم \`npx cap open ios\`

نسأل الله القبول والإخلاص.
`);

  // Generate package config
  zip.file('capacitor.config.json', JSON.stringify({
    appId: 'com.noor.alislam',
    appName: 'نور الإسلام',
    webDir: 'dist',
    bundledWebRuntime: false,
    plugins: {
      LocalNotifications: {
        smallIcon: "ic_stat_icon",
        iconColor: "#064e3b",
        sound: "adhan.wav"
      }
    }
  }, null, 2));

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `noor-al-islam-source-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

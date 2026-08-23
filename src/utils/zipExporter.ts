/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

// Import all application source files dynamically at build/runtime as raw text strings
const globbedFiles = import.meta.glob(
  [
    '/src/**/*',
    '/index.html',
    '/package.json',
    '/tsconfig.json',
    '/vite.config.ts',
    '/capacitor.config.json',
    '/metadata.json',
    '/.env.example'
  ],
  {
    query: '?raw',
    import: 'default',
    eager: true
  }
) as Record<string, string>;

export async function downloadProjectZip(onProgress?: (percent: number, currentFile: string) => void) {
  try {
    const zip = new JSZip();
    const entries = Object.entries(globbedFiles);
    const total = entries.length;

    if (onProgress) {
      onProgress(10, 'جاري تحضير ملفات المشروع...');
    }

    let count = 0;
    for (const [filePath, content] of entries) {
      count++;
      const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      zip.file(relativePath, content);
      if (onProgress && count % 5 === 0) {
        const percent = Math.floor(10 + (count / total) * 70);
        onProgress(percent, `جاري حزم: ${relativePath}`);
      }
    }

    if (onProgress) {
      onProgress(85, 'جاري ضغط الملفات وإنشاء حزمة ZIP...');
    }

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Noor_Al_Islam_SourceCode.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    if (onProgress) {
      onProgress(100, 'تم إنشاء وتحميل حزمة المشروع بنجاح!');
    }
  } catch (error) {
    console.error('ZIP generation error:', error);
    if (onProgress) {
      onProgress(100, 'حدث خطأ أثناء إنشاء ملف ZIP.');
    }
  }
}

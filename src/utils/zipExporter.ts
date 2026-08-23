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
    if (onProgress) {
      onProgress(20, 'جاري الاتصال بالسيرفر وتجهيز حزمة المشروع الكاملة...');
    }

    // Direct download trigger from official server endpoint
    const downloadUrl = '/api/download-zip';
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'Noor_Al_Islam_SourceCode.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onProgress) {
      onProgress(100, 'تم بدء تحميل الملف الكامل بنجاح!');
    }
  } catch (error) {
    console.error('Download error:', error);
    // Direct window open fallback
    window.location.href = '/api/download-zip';
  }
}

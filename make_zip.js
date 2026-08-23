import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

async function createZip() {
  const finalZip = 'project_source.zip';
  const tempZip = 'project_source.tmp.zip';
  const zip = new JSZip();

  const ignoreDirs = new Set(['node_modules', 'dist', '.git', '.cache', '.upm', '__pycache__']);
  const ignoreFiles = new Set(['project_source.zip', 'project_source.tmp.zip', 'Info.plist.bak']);

  function addDirToZip(currentDir, zipFolder) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) {
          const nextZipFolder = zipFolder.folder(entry.name);
          addDirToZip(fullPath, nextZipFolder);
        }
      } else if (entry.isFile()) {
        if (!ignoreFiles.has(entry.name) && !entry.name.endsWith('.tmp') && !entry.name.endsWith('.bak')) {
          const fileData = fs.readFileSync(fullPath);
          zipFolder.file(entry.name, fileData);
        }
      }
    }
  }

  try {
    console.log('Generating ZIP in Node.js...');
    addDirToZip(process.cwd(), zip);

    const buffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 3 }
    });

    fs.writeFileSync(tempZip, buffer);
    fs.renameSync(tempZip, finalZip);

    // Also copy to public/ if public exists
    if (fs.existsSync('public')) {
      fs.copyFileSync(finalZip, path.join('public', finalZip));
    }
    console.log('Zip created successfully with size:', (buffer.length / 1024 / 1024).toFixed(2), 'MB');
  } catch (err) {
    if (fs.existsSync(tempZip)) {
      try { fs.unlinkSync(tempZip); } catch (_) {}
    }
    console.error('Error creating zip:', err);
    process.exit(1);
  }
}

createZip();

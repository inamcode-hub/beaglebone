import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import scp2 from 'scp2';
import { fileURLToPath } from 'url';

// Local and remote paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localPath = path.resolve(__dirname, '..');
const remotePath = '/home/debian/docker/beaglebone';

// Check if running in Windows or Unix-like environment
const isWindows = process.platform === 'win32';
const privateKeyPath = isWindows
  ? 'C:\\Users\\inamd\\.ssh\\id_rsa'
  : '/mnt/c/Users/inamd/.ssh/id_rsa';

// Function to get list of changed and untracked files using Git
function getChangedFiles() {
  try {
    const output = execSync('git status --short').toString().trim();
    return output
      ? output.split('\n').map((line) => line.trim().split(/\s+/).pop())
      : [];
  } catch (err) {
    console.error('Error getting changed files:', err);
    return [];
  }
}

// Function to transfer a single file or directory
function transferFileOrDir(localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    scp2.scp(
      localFile,
      {
        host: '192.168.1.71',
        username: 'debian',
        privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
        path: remoteFile,
      },
      (err) => {
        if (err) {
          console.error(`Error transferring ${localFile}:`, err);
          reject(err);
        } else {
          console.log(`Transferred ${localFile} to ${remoteFile}`);
          resolve();
        }
      }
    );
  });
}

// Function to transfer only changed files
async function transferFiles() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log('No files changed. Nothing to transfer.');
    return;
  }

  console.log(`Transferring ${changedFiles.length} changed files...`);

  for (const file of changedFiles) {
    const localFile = path.join(localPath, file);
    if (fs.existsSync(localFile)) {
      const remoteFile = path.join(remotePath, file);
      try {
        await transferFileOrDir(localFile, remoteFile);
      } catch (error) {
        console.error(`Failed to transfer ${localFile}:`, error);
      }
    } else {
      console.warn(`File does not exist: ${localFile}`);
    }
  }

  console.log('Files transferred successfully.');
}

function startWatcher() {
  console.log(`Starting file watcher on ${localPath}`);

  const watcher = chokidar.watch(localPath, {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true, // Do not trigger on initial scan
  });

  watcher
    .on('add', (filePath) => {
      console.log(`File added: ${filePath}`);
      transferFiles();
    })
    .on('change', (filePath) => {
      console.log(`File changed: ${filePath}`);
      transferFiles();
    })
    .on('addDir', (dirPath) => {
      console.log(`Directory added: ${dirPath}`);
      transferFiles();
    })
    .on('unlink', (filePath) => {
      console.log(`File removed: ${filePath}`);
      // Handle file deletion if necessary
    })
    .on('unlinkDir', (dirPath) => {
      console.log(`Directory removed: ${dirPath}`);
      // Handle directory deletion if necessary //
    })
    .on('error', (error) => {
      console.error('Watcher error:', error);
    });

  console.log('Watching for file changes...');
}

startWatcher();

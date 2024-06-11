const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Read the version from the VERSION file
const versionPath = '/usr/src/app/VERSION';
let version = 'unknown';
if (fs.existsSync(versionPath)) {
  version = fs.readFileSync(versionPath, 'utf8').trim();
}

app.get('/', (req, res) =>
  res.send(
    `<h1>Hello World!</h1><p>Running latest version ${version}.New Rep back.</p>`
  )
);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

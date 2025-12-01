#!/usr/bin/env node
/*
 Upload files under a given root to S3 and print a mapping JSON of local -> s3 URL.
 Usage: node upload-to-s3.js --bucket my-bucket --prefix path/prefix --root src/images/Portfolios --dry-run
 Requires AWS credentials available in environment (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
*/
const fs = require('fs');
const path = require('path');
// AWS SDK is only required when performing real uploads. For dry-runs we avoid importing it so
// this script can run without installing AWS dependencies.
let S3Client, PutObjectCommand;

const argv = require('minimist')(process.argv.slice(2));
const bucket = argv.bucket || argv.b;
const prefix = (argv.prefix || argv.p || '').replace(/\/+$/,'');
const root = argv.root || argv.r || 'src/images/Portfolios';
const dry = argv['dry-run'] || argv.dry || false;

if (!bucket) {
  console.error('Missing --bucket'); process.exit(2);
}

let s3;
if (!dry) {
  try {
    ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
    s3 = new S3Client({});
  } catch (e) {
    console.error('Missing AWS SDK. Install @aws-sdk/client-s3 to perform uploads.');
    process.exit(2);
  }
}

function walk(dir) {
  let out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = fs.statSync(p);
    if (s.isDirectory()) out = out.concat(walk(p));
    else if (s.isFile()) out.push(p);
  }
  return out;
}

async function upload(file) {
  const body = fs.createReadStream(file);
  // strip leading src/images/ or src/ or any leading slash when building S3 key
  const key = prefix ? `${prefix}/${file.replace(/^src\/images\/|^src\/|^\//,'')}` : file.replace(/^src\//,'');
  const params = { Bucket: bucket, Key: key, Body: body, ACL: 'public-read' };
  if (dry) return { file, url: `s3://${bucket}/${key}` };
  await s3.send(new PutObjectCommand(params));
  const url = `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${encodeURI(key)}`;
  return { file, url };
}

async function main() {
  if (!fs.existsSync(root)) { console.error('Root not found:', root); process.exit(2); }
  const files = walk(root);
  console.log(`Found ${files.length} files under ${root}`);
  const map = [];
  for (const f of files) {
    try {
      const res = await upload(f);
      console.log(`${f} -> ${res.url}`);
      map.push({ local: f, url: res.url });
    } catch (e) {
      console.error('Upload failed for', f, e.message);
    }
  }
  fs.writeFileSync('s3-upload-map.json', JSON.stringify(map,null,2));
  console.log('Wrote s3-upload-map.json');
}

if (require.main === module) main();

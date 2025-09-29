const fs = require('fs');
const path = 'src/widgets/site-navigation/versions/v1.6.html';
let content = fs.readFileSync(path, 'utf8');
const replacements = [
  {
    old: `    .mcc-nav {\r\n      position: relative;\r\n      left: 50%;\r\n      transform: translateX(-50%);\r\n      width: 100vw;\r\n      max-width: none;\r\n      padding: clamp(32px, 7vw, 72px) clamp(44px, 8vw, 128px) clamp(12px, 3vw, 28px);\r\n      display: flex;\r\n      alignments: center;`,
    new: ''
  }
];
fs.writeFileSync(path, content);

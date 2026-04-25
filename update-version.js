const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 读取当前版本号
const versionFile = path.join(__dirname, 'version.json');
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// 获取最新的提交信息
const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();

// 根据提交信息更新版本号
let [major, minor, patch] = versionData.version.split('.').map(Number);

if (commitMessage.includes('BREAKING CHANGE')) {
  // 重大变更
  major++;
  minor = 0;
  patch = 0;
} else if (commitMessage.includes('feat:')) {
  // 新功能
  minor++;
  patch = 0;
} else if (commitMessage.includes('fix:')) {
  // 修复 bug
  patch++;
}

// 更新版本号
const newVersion = `${major}.${minor}.${patch}`;
versionData.version = newVersion;
versionData.releaseDate = new Date().toISOString().split('T')[0];

// 添加变更记录
if (commitMessage) {
  versionData.changes.unshift(commitMessage);
}

// 保存版本号
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

console.log(`版本号已更新为: ${newVersion}`);
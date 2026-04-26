const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    // 读取当前版本号
    const versionFile = path.join(__dirname, 'version.json');
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

    // 获取最新的提交信息
    const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();

    // 解析当前版本号
    let [major, minor, patch] = versionData.version.split('.').map(Number);

    // 验证版本号格式
    if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
        console.error('版本号格式错误，使用默认值 1.0.0');
        [major, minor, patch] = [1, 0, 0];
    }

    // 根据提交信息更新版本号
    const message = commitMessage.toLowerCase();

    if (message.includes('breaking change') || message.includes('breaking:')) {
        // 重大变更
        major++;
        minor = 0;
        patch = 0;
        console.log('检测到重大变更，更新 major 版本');
    } else if (message.includes('feat:') || message.includes('新功能') || message.includes('添加')) {
        // 新功能
        minor++;
        patch = 0;
        console.log('检测到新功能，更新 minor 版本');
    } else if (message.includes('fix:') || message.includes('修复') || message.includes('bug')) {
        // Bug 修复
        patch++;
        console.log('检测到 bug 修复，更新 patch 版本');
    } else if (message.includes('perf:') || message.includes('优化') || message.includes('性能')) {
        // 性能优化
        patch++;
        console.log('检测到性能优化，更新 patch 版本');
    } else if (message.includes('refactor:') || message.includes('重构')) {
        // 重构
        console.log('检测到代码重构，版本号不变');
    } else if (message.includes('docs:') || message.includes('文档')) {
        // 文档更新
        console.log('检测到文档更新，版本号不变');
    } else {
        // 其他类型的提交，默认更新 patch 版本
        patch++;
        console.log('其他类型提交，默认更新 patch 版本');
    }

    // 生成新版本号
    const newVersion = `${major}.${minor}.${patch}`;
    versionData.version = newVersion;
    versionData.releaseDate = new Date().toISOString().split('T')[0];

    // 添加变更记录（去重）
    if (commitMessage && !versionData.changes.includes(commitMessage)) {
        versionData.changes.unshift(commitMessage);
        // 保持变更记录数量不超过 20 条
        if (versionData.changes.length > 20) {
            versionData.changes = versionData.changes.slice(0, 20);
        }
    }

    // 保存版本号文件
    fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

    console.log(`✅ 版本号已更新为: v${newVersion}`);

} catch (error) {
    console.error('❌ 版本号更新失败:', error.message);
    // 即使失败也不阻止提交，继续执行
    process.exit(0);
}
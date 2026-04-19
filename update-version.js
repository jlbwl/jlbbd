#!/usr/bin/env node

/**
 * 版本号更新脚本
 * 用于在每次构建时自动更新版本号
 */

const fs = require('fs');
const path = require('path');

// 生成基于日期和时间的版本号
function generateVersion() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const build = `${hour}${minute}`;
    
    return `${year}.${month}${day}.${build}`;
}

// 读取version.json文件
function readVersionFile() {
    const versionFile = path.join(__dirname, 'version.json');
    try {
        const content = fs.readFileSync(versionFile, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('读取version.json失败:', error);
        return {
            version: '1.0.0',
            releaseDate: new Date().toISOString().split('T')[0],
            changes: [],
            author: 'jlbbd team',
            description: '金卢比智能表单系统',
            homepage: 'https://github.com/jlbwl/jlbbd'
        };
    }
}

// 写入version.json文件
function writeVersionFile(data) {
    const versionFile = path.join(__dirname, 'version.json');
    try {
        fs.writeFileSync(versionFile, JSON.stringify(data, null, 2));
        console.log('版本号更新成功:', data.version);
    } catch (error) {
        console.error('写入version.json失败:', error);
    }
}

// 主函数
function main() {
    const versionData = readVersionFile();
    const newVersion = generateVersion();
    
    versionData.version = newVersion;
    versionData.releaseDate = new Date().toISOString().split('T')[0];
    
    writeVersionFile(versionData);
}

// 执行主函数
if (require.main === module) {
    main();
}

module.exports = { generateVersion, readVersionFile, writeVersionFile };
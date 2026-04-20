/**
 * 金卢比智能表单应用主对象
 * @namespace App
 */

// 辅助函数
function renderCharts() {
    // 图表渲染逻辑
    console.log('渲染图表');
}

function renderRecycle() {
    const recycleContainer = document.getElementById('recycleContainer');
    if (!recycleContainer) return;
    
    recycleContainer.innerHTML = '<p>回收站功能开发中...</p>';
}

function renderLogs() {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;
    
    logsContainer.innerHTML = '<p>日志功能开发中...</p>';
}

function editOrder(orderId) {
    console.log('编辑订单:', orderId);
    // 编辑订单逻辑
}

function deleteOrder(orderId) {
    if (confirm('确定要删除这个订单吗？')) {
        console.log('删除订单:', orderId);
        // 删除订单逻辑
    }
}

function updateBatchPanel() {
    console.log('更新批量操作面板');
    // 批量操作面板更新逻辑
}

function renderTable() {
    const tableBody = document.getElementById('orderTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // 应用排序
    const sortedData = [...App.data].sort((a, b) => {
        const key = App.sortConfig.key;
        if (!key) return 0;
        
        let aVal = a[key] || '';
        let bVal = b[key] || '';
        
        if (App.sortConfig.key === 'amount' || App.sortConfig.key === 'channelPrice') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }
        
        if (aVal < bVal) return App.sortConfig.ascending ? -1 : 1;
        if (aVal > bVal) return App.sortConfig.ascending ? 1 : -1;
        return 0;
    });
    
    // 应用分页
    const start = (App.pagination.currentPage - 1) * App.pagination.pageSize;
    const end = start + App.pagination.pageSize;
    const paginatedData = sortedData.slice(start, end);
    
    // 渲染表格行
    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id || ''}</td>
            <td>${item.name || ''}</td>
            <td>${item.channel || ''}</td>
            <td>${item.project || ''}</td>
            <td>¥${parseFloat(item.amount) || 0}</td>
            <td>¥${parseFloat(item.channelPrice) || 0}</td>
            <td>${item.status || ''}</td>
            <td>${item.qualified || ''}</td>
            <td>${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</td>
            <td>
                <button class="btn btn-sm" onclick="editOrder('${item.id}')">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${item.id}')">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // 更新分页信息
    App.pagination.totalItems = App.data.length;
    App.pagination.filteredItems = App.data.length;
    updatePaginationControls();
}

const App = {
    /**
     * 应用版本号
     * @type {string}
     */
    version: '1.1.7',
    
    /**
     * 主数据存储数组
     * @type {Array}
     */
    data: [], 
    
    /**
     * 回收站数据
     * @type {Array}
     */
    recycleBin: [], 
    
    /**
     * 操作日志
     * @type {Array}
     */
    logs: [], 
    
    /**
     * 客户预设数据
     * @type {Array}
     */
    presets: [], 
    
    /**
     * 渠道历史记录
     * @type {Array}
     */
    channelHistory: [], 
    
    /**
     * 智能记忆数据
     * @type {Object}
     */
    smartMemory: {}, 
    
    /**
     * 表单数据
     * @type {Array}
     */
    forms: [],
    
    /**
     * 工作流数据
     * @type {Array}
     */
    workflows: [],
    
    /**
     * 应用配置
     * @type {Object}
     * @property {string} password - 登录密码
     * @property {number} riskLimit - 风控预警阈值
     * @property {string} theme - 主题模式 (light/dark)
     * @property {boolean} adminOnlyPresets - 是否仅管理员可管理客户预设
     */
    config: { 
        password: '5183', 
        riskLimit: 10000, 
        theme: 'light', 
        adminOnlyPresets: false 
    },
    
    /**
     * 图表实例
     * @type {Object}
     */
    charts: {}, 
    
    /**
     * 当前用户信息
     * @type {Object|null}
     */
    currentUser: null, 
    
    /**
     * 排序配置
     * @type {Object}
     * @property {string|null} key - 排序键
     * @property {boolean} ascending - 是否升序
     */
    sortConfig: { key: null, ascending: true },
    
    /**
     * 分页配置
     * @type {Object}
     * @property {number} currentPage - 当前页码
     * @property {number} pageSize - 每页大小
     * @property {number} totalItems - 总项目数
     * @property {number} filteredItems - 过滤后项目数
     */
    pagination: { 
        currentPage: 1, 
        pageSize: 20, 
        totalItems: 0, 
        filteredItems: 0 
    },
    
    /**
     * 列配置
     * @type {Object}
     */
    columnConfig: {
        'time': { label: '做单时间', default: true }, 
        'project': { label: '项目', default: true },
        'amount': { label: '推广费', default: true }, 
        'prepayEligible': { label: '预付资格', default: true }, 
        'prepay': { label: '预付金额', default: true }, 
        'prepayTime': { label: '预付时间', default: true }, 
        'channelName': { label: '渠道', default: true },
        'channelPrice': { label: '渠道价格', default: true }, 
        'profit': { label: '利润', default: true },
        'broker': { label: '券商', default: true }, 
        'fundAccount': { label: '资金号', default: true },
        'customer': { label: '兼职姓名', default: true }, 
        'phone': { label: '兼职手机号', default: false },
        'group': { label: '群号简称', default: true }, 
        'contact': { label: '对接人', default: false },
        'settleAmount': { label: '结算金额', default: true }, 
        'settleTime': { label: '结算时间', default: false }, 
        'status': { label: '状态', default: true },
        'qualified': { label: '审核', default: true }
    },
    
    /**
     * 用户列可见性配置
     * @type {Object}
     */
    userColumnVisibility: {},
    
    /**
     * 应用初始化
     * @memberof App
     * @description 加载本地数据并处理登录状态
     */
    init() {
        this.loadLocal();
        WorkflowManager.init();
        const urlParams = new URLSearchParams(window.location.search);
        const publishData = urlParams.get('publish');
        
        // 直接进入系统，不需要登录验证
        const session = sessionStorage.getItem('jlb_session');
        if(session) {
            this.currentUser = JSON.parse(session);
        } else {
            // 创建默认用户
            this.currentUser = { role: 'admin', loginTime: new Date() };
            sessionStorage.setItem('jlb_session', JSON.stringify(this.currentUser));
        }
        this.enterApp();
    },
    
    /**
     * 加载本地加密数据
     * @memberof App
     * @description 从localStorage加载加密数据并解密
     */
    loadLocal() {
        const raw = localStorage.getItem('jlb_data_v8_enc');
        if(raw) {
            try {
                const bytes = CryptoJS.AES.decrypt(raw, 'JLB_SECRET_KEY_2026');
                const json = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                
                // 批量赋值，减少多次属性访问
                this.data = json.data || [];
                this.recycleBin = json.recycleBin || [];
                this.logs = json.logs || [];
                this.presets = json.presets || [];
                this.channelHistory = json.channelHistory || [];
                this.smartMemory = json.smartMemory || {};
                this.forms = json.forms || [];
                this.workflows = json.workflows || [];
                this.config = json.config || this.config;
                this.pagination.pageSize = json.pagination?.pageSize || 20;
                
                // 只有在需要时才计算用户列可见性
                if (json.config && json.config.columnVisibility) {
                    this.userColumnVisibility = json.config.columnVisibility;
                } else if (Object.keys(this.userColumnVisibility).length === 0) {
                    for (let key in this.columnConfig) {
                        this.userColumnVisibility[key] = this.columnConfig[key].default;
                    }
                }
            } catch(e) { 
                console.error('解密失败', e); 
                this.loadLegacy(); 
            }
        } else { 
            this.loadLegacy(); 
        }
    },
    
    /**
     * 加载旧版本数据
     * @memberof App
     * @description 从旧版本的localStorage键加载数据
     */
    loadLegacy() {
        const d = localStorage.getItem('jl_data_v2'); if(d) this.data = JSON.parse(d);
        const r = localStorage.getItem('jl_recycle_v2'); if(r) this.recycleBin = JSON.parse(r);
        const l = localStorage.getItem('jl_logs_v2'); if(l) this.logs = JSON.parse(l);
        const p = localStorage.getItem('jl_presets_v2'); if(p) this.presets = JSON.parse(p);
        const ch = localStorage.getItem('jl_channels_v2'); if(ch) this.channelHistory = JSON.parse(ch); else this.channelHistory = [];
        const f = localStorage.getItem('jl_forms_v2'); if(f) this.forms = JSON.parse(f); else this.forms = [];
        const cfg = localStorage.getItem('jl_config'); if(cfg) this.config = {...this.config, ...JSON.parse(cfg)};
        if (Object.keys(this.userColumnVisibility).length === 0) for (let key in this.columnConfig) this.userColumnVisibility[key] = this.columnConfig[key].default;
    },
    
    /**
     * 保存数据
     * @memberof App
     * @description 加密并保存数据到localStorage
     */
    saveData() {
        try {
            // 构建payload对象，减少重复属性访问
            const payload = {
                data: this.data,
                recycleBin: this.recycleBin,
                logs: this.logs,
                presets: this.presets,
                channelHistory: this.channelHistory,
                smartMemory: this.smartMemory,
                forms: this.forms,
                workflows: this.workflows,
                config: { ...this.config, columnVisibility: this.userColumnVisibility },
                pagination: this.pagination
            };
            
            // 序列化并加密数据
            const jsonString = JSON.stringify(payload);
            const encrypted = CryptoJS.AES.encrypt(jsonString, 'JLB_SECRET_KEY_2026').toString();
            
            // 保存到localStorage
            localStorage.setItem('jlb_data_v8_enc', encrypted);
            
            // 清理旧版本数据（只在首次保存时执行）
            const hasOldData = localStorage.getItem('jl_data_v2');
            if (hasOldData) {
                ['jl_data_v2','jl_recycle_v2','jl_logs_v2','jl_presets_v2','jl_channels_v2','jl_forms_v2','jl_config'].forEach(k => localStorage.removeItem(k));
            }
        } catch(e) { 
            console.error('加密保存失败', e); 
            alert('保存失败，可能是浏览器存储空间不足'); 
        }
        
        // 异步刷新所有视图，避免阻塞主线程
        setTimeout(() => this.refreshAll(), 0);
    },
    
    /**
     * 记录操作日志
     * @memberof App
     * @param {string} action - 操作类型
     * @param {string} detail - 操作详情
     * @description 记录用户操作日志并保存
     */
    log(action, detail) {
        const user = this.currentUser ? this.currentUser.role : 'unknown';
        const entry = { time: new Date().toISOString(), user, action, detail };
        this.logs.unshift(entry);
        if(this.logs.length > 200) this.logs.pop();
        this.saveData();
    },
    
    /**
     * 刷新所有视图
     * @memberof App
     * @description 更新统计数据、渲染表格、回收站、日志和图表
     */
    refreshAll() { updateStats(); renderTable(); renderRecycle(); renderLogs(); renderCharts(); updatePaginationControls(); },
    
    /**
     * 添加渠道历史
     * @memberof App
     * @param {string} name - 渠道
     * @description 添加渠道到历史记录并限制数量
     */
    addChannelHistory(name) { if(!name) return; if(!this.channelHistory.includes(name)) { this.channelHistory.unshift(name); if(this.channelHistory.length > 50) this.channelHistory.pop(); this.saveData(); } },
    
    /**
     * 更新智能记忆
     * @memberof App
     * @param {string} channel - 渠道
     * @param {string} project - 项目名称
     * @param {number} price - 价格
     * @description 更新智能记忆中的价格数据
     */
    updateSmartMemory(channel, project, price) { if(!channel || !project || !price) return; const key = `${channel}|${project}`; if(!this.smartMemory[key]) this.smartMemory[key] = { price: 0, count: 0 }; this.smartMemory[key].price = price; this.smartMemory[key].count++; this.saveData(); },
    
    /**
     * 获取智能价格
     * @memberof App
     * @param {string} channel - 渠道
     * @param {string} project - 项目名称
     * @returns {number|null} 智能价格或null
     * @description 根据渠道和项目获取智能记忆中的价格
     */
    getSmartPrice(channel, project) { const key = `${channel}|${project}`; return this.smartMemory[key] ? this.smartMemory[key].price : null; },
    
    /**
     * 检查权限
     * @memberof App
     * @param {string} action - 操作类型
     * @returns {boolean} 是否有权限
     * @description 检查当前用户是否有指定操作的权限
     */
    checkPerm(action) {
        if(!this.currentUser) return false;
        if(this.currentUser.role === 'admin') return true;
        if(this.currentUser.role === 'operator' && ['create', 'edit', 'view'].includes(action)) return true;
        if(this.currentUser.role === 'guest' && action === 'view') return true;
        if(action === 'manage_presets' && this.config.adminOnlyPresets) return false;
        if(action === 'manage_presets' && this.currentUser.role === 'operator') return true;
        return false;
    },
    
    /**
     * 进入应用
     * @memberof App
     * @description 显示主应用界面并设置权限
     */
    enterApp() {
        document.getElementById('mainApp').style.display = 'flex';
        document.getElementById('userRoleBadge').innerText = this.currentUser.role.toUpperCase();
        const navCustomer = document.getElementById('navCustomer');
        const navLeadgen = document.getElementById('navLeadgen');
        if(this.checkPerm('manage_presets')) { 
            navCustomer.style.display = 'flex'; 
            navLeadgen.style.display = 'flex'; 
        } else { 
            navCustomer.style.display = 'none'; 
            navLeadgen.style.display = 'none'; 
        }
        if(!this.checkPerm('create')) { document.querySelectorAll('.btn-primary').forEach(b => { if(b.innerText.includes('新增')) b.style.display = 'none'; }); }
        if(!this.checkPerm('delete')) document.getElementById('btnBatchDel').style.display = 'none';
        currentPage = this.pagination.currentPage;
        this.refreshAll();
        if(navCustomer.style.display !== 'none') renderPresetTable();
        startAutoLogout();
        // 启用 AI 智能助手输入框
        if (window.aiChatWindow && typeof window.aiChatWindow.enableInput === 'function') {
            window.aiChatWindow.enableInput();
        }
    }
};

const BackupManager = {
    downloadBackup() {
        if(!confirm('即将下载包含所有数据的加密备份文件。\n请妥善保管此文件，不要泄露给他人。\n是否继续？')) return;
        try {
            const fullData = { version: '2.0', timestamp: new Date().toISOString(), data: App.data, recycleBin: App.recycleBin, logs: App.logs, presets: App.presets, channelHistory: App.channelHistory, smartMemory: App.smartMemory, forms: App.forms, config: App.config };
            const jsonString = JSON.stringify(fullData);
            const password = prompt('请输入您的登录密码以加密备份文件:', '');
            if(!password) return;
            if(password !== App.config.password) { alert('密码错误，备份取消'); return; }
            const encrypted = CryptoJS.AES.encrypt(jsonString, password).toString();
            const blob = new Blob([encrypted], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            a.download = `JLB_Backup_${dateStr}.jlb`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('✅ 备份文件下载成功！\n文件名：' + a.download + '\n请务必将其保存到安全位置（如U盘或网盘）。');
        } catch(e) { alert('备份失败：' + e.message); }
    },
    restoreBackup(input) {
        const file = input.files[0]; if(!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const encryptedContent = e.target.result;
                const password = prompt('请输入备份时的加密密码:', '');
                if(!password) { input.value = ''; return; }
                const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
                const jsonString = bytes.toString(CryptoJS.enc.Utf8);
                if(!jsonString) throw new Error('密码错误或文件损坏');
                const restoredData = JSON.parse(jsonString);
                if(!confirm(`⚠️ 警告：恢复操作将覆盖当前所有数据！\n备份时间：${restoredData.timestamp || '未知'}\n确定要恢复吗？`)) { input.value = ''; return; }
                App.data = restoredData.data || []; App.recycleBin = restoredData.recycleBin || []; App.logs = restoredData.logs || [];
                App.presets = restoredData.presets || []; App.channelHistory = restoredData.channelHistory || [];
                App.smartMemory = restoredData.smartMemory || {}; App.forms = restoredData.forms || [];
                App.config = restoredData.config || App.config;
                App.saveData(); alert('✅ 数据恢复成功！页面将刷新。'); location.reload();
            } catch(err) { 
                console.error('恢复失败详细信息:', err);
                alert('❌ 恢复失败：' + err.message + '\n请确认文件是否正确且密码无误。'); 
                input.value = ''; 
            }
        };
        reader.readAsText(file); 
        input.value = '';
    }
};

let currentPage = 1;
let advancedFilters = {
    status: [],
    qualified: []
};

document.addEventListener('keydown', function(e) {
    if((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); if(document.getElementById('mainApp').style.display !== 'none') openBatchModal(); }
    if((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); if(document.getElementById('batchModal').classList.contains('active')) saveBatch(); if(document.getElementById('editModal').classList.contains('active')) saveEdit(); }
    if(e.key === 'Escape') { ['batchModal','editModal','imgModal','presetModal','columnSettingsModal','advancedFilterModal'].forEach(id => { const el = document.getElementById(id); if(el && el.classList.contains('active')) el.classList.remove('active'); }); }
    if((e.ctrlKey || e.metaKey) && e.key === 'f') { if(document.getElementById('view-list').classList.contains('active')) { e.preventDefault(); document.getElementById('searchInput').focus(); } }
});

function openAdvancedFilterModal() {
    // 重置复选框状态
    document.getElementById('filterStatusAll').checked = advancedFilters.status.length === 0;
    document.querySelectorAll('.filterStatus').forEach(cb => {
        cb.checked = advancedFilters.status.includes(cb.value);
    });
    document.getElementById('filterQualAll').checked = advancedFilters.qualified.length === 0;
    document.querySelectorAll('.filterQual').forEach(cb => {
        cb.checked = advancedFilters.qualified.includes(cb.value);
    });
    document.getElementById('advancedFilterModal').classList.add('active');
}

function toggleStatusAll() {
    const isAllChecked = document.getElementById('filterStatusAll').checked;
    document.querySelectorAll('.filterStatus').forEach(cb => {
        cb.checked = false;
    });
    if (isAllChecked) {
        advancedFilters.status = [];
    }
}

function toggleQualAll() {
    const isAllChecked = document.getElementById('filterQualAll').checked;
    document.querySelectorAll('.filterQual').forEach(cb => {
        cb.checked = false;
    });
    if (isAllChecked) {
        advancedFilters.qualified = [];
    }
}

function resetAdvancedFilter() {
    document.getElementById('filterStatusAll').checked = true;
    document.querySelectorAll('.filterStatus').forEach(cb => {
        cb.checked = false;
    });
    document.getElementById('filterQualAll').checked = true;
    document.querySelectorAll('.filterQual').forEach(cb => {
        cb.checked = false;
    });
    advancedFilters = {
        status: [],
        qualified: []
    };
}

function applyAdvancedFilter() {
    // 收集选中的状态
    advancedFilters.status = Array.from(document.querySelectorAll('.filterStatus:checked')).map(cb => cb.value);
    advancedFilters.qualified = Array.from(document.querySelectorAll('.filterQual:checked')).map(cb => cb.value);
    
    // 检查是否全选
    if (advancedFilters.status.length === 0) {
        document.getElementById('filterStatusAll').checked = true;
    }
    if (advancedFilters.qualified.length === 0) {
        document.getElementById('filterQualAll').checked = true;
    }
    
    closeModal('advancedFilterModal');
    onSearchInput();
}

let searchDropdownActive = false;
let searchSelectedIndex = -1;

// 原始搜索函数
function onSearchInputOriginal() {
    const input = document.getElementById('searchInput');
    const keyword = input.value.trim().toLowerCase();
    const dropdown = document.getElementById('searchDropdown');
    App.pagination.currentPage = 1; currentPage = 1; renderTable();
    if (keyword.length === 0) { dropdown.style.display = 'none'; return; }
    let candidates = [];
    const seen = new Set();
    App.data.forEach(item => {
        const fields = [
            { val: item.project, label: '项目' },
            { val: item.customer, label: '兼职' },
            { val: item.group, label: '群号' },
            { val: item.channelName, label: '渠道' },
            { val: item.contact, label: '对接' },
            { val: item.broker, label: '券商' },
            { val: item.phone, label: '手机' },
            { val: item.fundAccount, label: '资金号' }
        ];
        fields.forEach(f => {
            if (!f.val) return;
            const strVal = String(f.val).toLowerCase();
            if (strVal.includes(keyword)) {
                const uniqueKey = `${f.label}:${f.val}`;
                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey);
                    const isStartMatch = strVal.startsWith(keyword);
                    candidates.push({ text: f.val, type: f.label, score: isStartMatch ? 100 : 50, original: f.val });
                }
            }
        });
    });
    candidates.sort((a, b) => { if (b.score !== a.score) return b.score - a.score; return a.text.localeCompare(b.text, 'zh-Hans-CN'); });
    candidates = candidates.slice(0, 15);
    if (candidates.length > 0) {
        dropdown.innerHTML = '';
        candidates.forEach((cand, index) => {
            const div = document.createElement('div');
            div.className = 'search-dropdown-item';
            div.dataset.index = index;
            div.dataset.value = cand.original;
            const regex = new RegExp(`(${keyword})`, 'gi');
            const highlightedText = String(cand.text).replace(regex, '<span class="highlight">$1</span>');
            div.innerHTML = `<div><span>${highlightedText}</span><small>${cand.type}</small></div>`;
            div.onclick = () => { input.value = cand.original; dropdown.style.display = 'none'; renderTable(); };
            dropdown.appendChild(div);
        });
        dropdown.style.display = 'block';
        searchDropdownActive = true;
        searchSelectedIndex = -1;
    } else { dropdown.style.display = 'none'; searchDropdownActive = false; }
}

// 防抖版本的搜索函数
const onSearchInput = debounce(onSearchInputOriginal, 300);

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
        const dropdown = document.getElementById('searchDropdown');
        if (!searchDropdownActive || dropdown.style.display === 'none') return;
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        if (items.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); searchSelectedIndex = (searchSelectedIndex + 1) % items.length; updateSearchSelection(items); } 
        else if (e.key === 'ArrowUp') { e.preventDefault(); searchSelectedIndex = (searchSelectedIndex - 1 + items.length) % items.length; updateSearchSelection(items); } 
        else if (e.key === 'Enter') { e.preventDefault(); if (searchSelectedIndex >= 0 && items[searchSelectedIndex]) { items[searchSelectedIndex].click(); } }
    });
}

function updateSearchSelection(items) {
    items.forEach((item, idx) => { if (idx === searchSelectedIndex) item.classList.add('active'); else item.classList.remove('active'); });
    if (searchSelectedIndex >= 0) { items[searchSelectedIndex].scrollIntoView({ block: 'nearest' }); }
}

let presetSearchDropdownActive = false;
let presetSearchSelectedIndex = -1;

// 原始预设搜索函数
function onPresetSearchInputOriginal() {
    const input = document.getElementById('presetSearchInput');
    const keyword = input.value.trim().toLowerCase();
    const dropdown = document.getElementById('presetSearchDropdown');
    const methodFilter = document.getElementById('presetMethodFilter').value;
    renderPresetTable();
    if (keyword.length === 0) { dropdown.style.display = 'none'; return; }
    let candidates = [];
    const seen = new Set();
    App.presets.forEach(item => {
        if (methodFilter && item.method !== methodFilter) return;
        const fields = [ { val: item.group, label: '群号' }, { val: item.contact, label: '对接人' }, { val: item.card, label: '卡号/备注' } ];
        fields.forEach(f => {
            if (!f.val) return;
            const strVal = String(f.val).toLowerCase();
            if (strVal.includes(keyword)) {
                const uniqueKey = `${f.label}:${f.val}`;
                if (!seen.has(uniqueKey)) {
                    seen.add(uniqueKey);
                    const isStartMatch = strVal.startsWith(keyword);
                    candidates.push({ text: f.val, type: f.label, score: isStartMatch ? 100 : 50, original: f.val, fullItem: item });
                }
            }
        });
    });
    candidates.sort((a, b) => { if (b.score !== a.score) return b.score - a.score; return a.text.localeCompare(b.text, 'zh-Hans-CN'); });
    candidates = candidates.slice(0, 15);
    if (candidates.length > 0) {
        dropdown.innerHTML = '';
        candidates.forEach((cand, index) => {
            const div = document.createElement('div');
            div.className = 'search-dropdown-item';
            div.dataset.index = index;
            const regex = new RegExp(`(${keyword})`, 'gi');
            const highlightedText = String(cand.text).replace(regex, '<span class="highlight">$1</span>');
            div.innerHTML = `<div><span>${highlightedText}</span><small>${cand.type} (${cand.fullItem.method})</small></div>`;
            div.onclick = () => { input.value = cand.original; dropdown.style.display = 'none'; renderPresetTable(); };
            dropdown.appendChild(div);
        });
        dropdown.style.display = 'block';
        presetSearchDropdownActive = true;
        presetSearchSelectedIndex = -1;
    } else { dropdown.style.display = 'none'; presetSearchDropdownActive = false; }
}

// 防抖版本的预设搜索函数
const onPresetSearchInput = debounce(onPresetSearchInputOriginal, 300);

const presetSearchInput = document.getElementById('presetSearchInput');
if (presetSearchInput) {
    presetSearchInput.addEventListener('keydown', function(e) {
        const dropdown = document.getElementById('presetSearchDropdown');
        if (!presetSearchDropdownActive || dropdown.style.display === 'none') return;
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        if (items.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); presetSearchSelectedIndex = (presetSearchSelectedIndex + 1) % items.length; updatePresetSearchSelection(items); } 
        else if (e.key === 'ArrowUp') { e.preventDefault(); presetSearchSelectedIndex = (presetSearchSelectedIndex - 1 + items.length) % items.length; updatePresetSearchSelection(items); } 
        else if (e.key === 'Enter') { e.preventDefault(); if (presetSearchSelectedIndex >= 0 && items[presetSearchSelectedIndex]) { items[presetSearchSelectedIndex].click(); } }
    });
}

function updatePresetSearchSelection(items) {
    items.forEach((item, idx) => { if (idx === presetSearchSelectedIndex) item.classList.add('active'); else item.classList.remove('active'); });
    if (presetSearchSelectedIndex >= 0) { items[presetSearchSelectedIndex].scrollIntoView({ block: 'nearest' }); }
}

document.addEventListener('click', function(e) {
    const listWrapper = document.querySelector('#view-list .search-input-wrapper');
    const listDropdown = document.getElementById('searchDropdown');
    if (listWrapper && !listWrapper.contains(e.target)) { listDropdown.style.display = 'none'; searchDropdownActive = false; }
    const custWrapper = document.querySelector('#view-customer .search-input-wrapper');
    const custDropdown = document.getElementById('presetSearchDropdown');
    if (custWrapper && !custWrapper.contains(e.target)) { custDropdown.style.display = 'none'; presetSearchDropdownActive = false; }
    // 只有当点击的不是输入框或下拉列表时才隐藏
    if(!e.target.closest('.search-dropdown-container') && !e.target.closest('input[oninput*="handleGroupSearch"]') && !e.target.closest('input[oninput*="handleChannelSearch"]')) { 
        document.querySelectorAll('.search-dropdown-list').forEach(el => { 
            if (el.id !== 'searchDropdown' && el.id !== 'presetSearchDropdown') el.style.display = 'none'; 
        }); 
    }
});

function onPageSizeChange() { const newSize = parseInt(document.getElementById('pageSize').value); App.pagination.pageSize = newSize; App.pagination.currentPage = 1; currentPage = 1; renderTable(); }

function goToPage(page) { const totalPages = Math.max(1, Math.ceil(App.pagination.filteredItems / App.pagination.pageSize)); if(page < 1) page = 1; if(page > totalPages) page = totalPages; App.pagination.currentPage = page; currentPage = page; renderTable(); }

function updatePaginationControls() {
    const pageSize = App.pagination.pageSize || 1; const filteredItems = App.pagination.filteredItems || 0;
    const totalPages = Math.max(1, Math.ceil(filteredItems / pageSize));
    const start = filteredItems === 0 ? 0 : (App.pagination.currentPage - 1) * pageSize + 1;
    const end = Math.min(App.pagination.currentPage * pageSize, filteredItems);
    const pageInfoEl = document.getElementById('pageInfo');
    if(pageInfoEl) pageInfoEl.textContent = filteredItems === 0 ? "暂无数据" : `第 ${App.pagination.currentPage} 页，共 ${totalPages} 页 (显示 ${start}-${end} 条)`;
    const prevBtn = document.getElementById('prevPage'), nextBtn = document.getElementById('nextPage');
    if(prevBtn) prevBtn.disabled = App.pagination.currentPage <= 1;
    if(nextBtn) nextBtn.disabled = App.pagination.currentPage >= totalPages;
}

function logout() { sessionStorage.removeItem('jlb_session'); location.reload(); }

function startAutoLogout() { let timer; const reset = () => { clearTimeout(timer); timer = setTimeout(() => { if(App.currentUser) logout(); }, 1800000); }; ['mousemove', 'keydown', 'click'].forEach(e => document.addEventListener(e, reset)); reset(); }

function toggleTheme() { const isDark = document.body.getAttribute('data-theme') === 'dark'; document.body.setAttribute('data-theme', isDark ? 'light' : 'dark'); App.config.theme = isDark ? 'light' : 'dark'; App.saveData(); }

function renderPresetTable() {
    const presetTableBody = document.getElementById('presetTableBody');
    if (!presetTableBody) return;
    
    presetTableBody.innerHTML = '';
    
    // 渲染客户预设表格
    App.presets.forEach(preset => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${preset.name || ''}</td>
            <td>${preset.channel || ''}</td>
            <td>${preset.project || ''}</td>
            <td>¥${parseFloat(preset.price) || 0}</td>
            <td>${preset.createdAt ? new Date(preset.createdAt).toLocaleDateString() : ''}</td>
            <td>
                <button class="btn btn-sm" onclick="editPreset('${preset.id}')">编辑</button>
                <button class="btn btn-sm btn-danger" onclick="deletePreset('${preset.id}')">删除</button>
            </td>
        `;
        presetTableBody.appendChild(row);
    });
}

function editPreset(presetId) {
    console.log('编辑预设:', presetId);
    // 编辑预设逻辑
}

function deletePreset(presetId) {
    if (confirm('确定要删除这个预设吗？')) {
        console.log('删除预设:', presetId);
        // 删除预设逻辑
    }
}

function switchView(viewId, event) {
    if(!App.checkPerm('view')) return;
    if(viewId === 'customer' && !App.checkPerm('manage_presets')) { alert('您没有权限访问客户管理页面'); return; }
    if(viewId === 'leadgen' && !App.checkPerm('manage_presets')) { alert('您没有权限访问智能获客页面'); return; }
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.sidebar-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
    if (event && event.target) {
        const sidebarBtn = event.target.closest('.sidebar-btn');
        if (sidebarBtn) {
            sidebarBtn.classList.add('active');
        } else {
            // 如果没有找到sidebar-btn，尝试通过viewId找到对应的按钮
            const btn = document.querySelector(`.sidebar-btn[onclick="switchView('${viewId}')"]`);
            if (btn) {
                btn.classList.add('active');
            }
        }
    } else {
        // 当没有event对象时，通过viewId找到对应的按钮
        const btn = document.querySelector(`.sidebar-btn[onclick="switchView('${viewId}')"]`);
        if (btn) {
            btn.classList.add('active');
        }
    }
    // 将耗时操作移到setTimeout中，避免阻塞主线程
    setTimeout(function() {
        if(viewId === 'dashboard') renderCharts();
        if(viewId === 'customer') { renderPresetTable(); document.getElementById('presetSearchInput').value = ''; document.getElementById('presetSearchDropdown').style.display = 'none'; }
        if(viewId === 'leadgen' && typeof renderLeadgenDashboard === 'function') { renderLeadgenDashboard(); }
        if(viewId === 'list') { document.querySelectorAll('.row-cb').forEach(cb => cb.checked = false); updateBatchPanel(); }
        if(viewId === 'formManager' && typeof renderFormManager === 'function') { renderFormManager(); }
        if(viewId === 'workflow' && typeof WorkflowManager !== 'undefined' && typeof WorkflowManager.renderWorkflowList === 'function') { WorkflowManager.renderWorkflowList(); }
    }, 0);
}

function sortTable(key, isNumber = false) {
    if (App.sortConfig.key === key) App.sortConfig.ascending = !App.sortConfig.ascending;
    else { App.sortConfig.key = key; App.sortConfig.ascending = true; }
    document.querySelectorAll('thead th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
    const currentTh = event.currentTarget;
    if(currentTh) currentTh.classList.add(App.sortConfig.ascending ? 'sort-asc' : 'sort-desc');
    renderTable();
}

function updateStats() {
    const total = App.data.length, amount = App.data.reduce((s, i) => s + (parseFloat(i.amount)||0), 0);
    const profit = App.data.reduce((s, i) => s + ((parseFloat(i.channelPrice)||0) - (parseFloat(i.amount)||0)), 0);
    
    // 计算异常订单数量，包括负利润、超额和超时未结算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const anomaly = App.data.filter(item => {
        const p = (parseFloat(item.channelPrice)||0) - (parseFloat(item.amount)||0);
        // 负利润订单如果已核实则排除
        const isNegative = p < 0 && !item.verified;
        const isExcess = parseFloat(item.amount) > (App.config.riskLimit || 10000);
        
        // 检查是否超时未结算
        const settleDate = item.settleTime ? new Date(item.settleTime) : null;
        let isOverdue = false;
        if (settleDate) {
            settleDate.setHours(0, 0, 0, 0);
            const isSettleDatePassed = settleDate <= today;
            const isUnsettled = item.status === 'unsettled';
            const isUnreviewed = item.qualified === 'pending';
            isOverdue = isSettleDatePassed && (isUnsettled || isUnreviewed);
        }
        
        return isNegative || isExcess || isOverdue;
    }).length;
    
    document.getElementById('dashTotal').innerText = total;
    document.getElementById('dashAmount').innerText = '¥' + amount.toLocaleString(undefined, {maximumFractionDigits:0});
    const pEl = document.getElementById('dashProfit'); pEl.innerText = (profit >= 0 ? '+' : '') + '¥' + profit.toLocaleString(undefined, {maximumFractionDigits:0});
    pEl.className = 'stat-value ' + (profit >= 0 ? 'profit-positive' : 'profit-negative');
    const rate = amount > 0 ? ((profit/amount)*100).toFixed(1) : 0;
    document.getElementById('dashProfitRate').innerText = `利润率 ${rate}%`;
    document.getElementById('dashAnomaly').innerText = anomaly;
}

// 打开异常订单预警模态框
function openAnomalyModal() {
    renderAnomalyList();
    openModal('anomalyModal');
}

// 渲染异常订单列表
function renderAnomalyList(filter = 'all') {
    const anomalyList = document.getElementById('anomalyList');
    const batchActions = document.getElementById('batchActions');
    
    // 显示/隐藏批量操作区域
    if (batchActions) {
        batchActions.style.display = filter === 'overdue' ? 'block' : 'none';
    }
    
    // 过滤异常订单
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const anomalies = App.data.filter(item => {
        const amount = parseFloat(item.amount) || 0;
        const channelPrice = parseFloat(item.channelPrice) || 0;
        const profit = channelPrice - amount;
        
        // 检查是否超时未结算
        const isOverdue = () => {
            const settleDate = item.settleTime ? new Date(item.settleTime) : null;
            if (!settleDate) return false;
            settleDate.setHours(0, 0, 0, 0);
            const isSettleDatePassed = settleDate <= today;
            const isUnsettled = item.status === 'unsettled';
            const isUnreviewed = item.qualified === 'pending';
            return isSettleDatePassed && (isUnsettled || isUnreviewed);
        };
        
        if (filter === 'all') {
            // 负利润订单如果已核实则排除
            const isNegativeUnverified = profit < 0 && !item.verified;
            return isNegativeUnverified || amount > (App.config.riskLimit || 10000) || isOverdue();
        } else if (filter === 'negative') {
            // 负利润订单如果已核实则排除
            return profit < 0 && !item.verified;
        } else if (filter === 'excess') {
            return amount > (App.config.riskLimit || 10000);
        } else if (filter === 'overdue') {
            return isOverdue();
        }
        return false;
    });
    
    if (anomalies.length === 0) {
        anomalyList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-sub);">
                <div style="font-size: 24px; margin-bottom: 12px;">✅</div>
                <p style="font-size: 14px;">暂无异常订单</p>
                <p style="font-size: 12px; color: var(--text-sub); margin-top: 6px;">所有订单均正常</p>
            </div>
        `;
        return;
    }
    
    // 生成异常订单列表
    anomalyList.innerHTML = anomalies.map(item => {
        const amount = parseFloat(item.amount) || 0;
        const channelPrice = parseFloat(item.channelPrice) || 0;
        const profit = channelPrice - amount;
        const isNegative = profit < 0;
        const isExcess = amount > (App.config.riskLimit || 10000);
        
        // 检查是否超时未结算
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const settleDate = item.settleTime ? new Date(item.settleTime) : null;
        let isOverdue = false;
        if (settleDate) {
            settleDate.setHours(0, 0, 0, 0);
            const isSettleDatePassed = settleDate <= today;
            const isUnsettled = item.status === 'unsettled';
            const isUnreviewed = item.qualified === 'pending';
            isOverdue = isSettleDatePassed && (isUnsettled || isUnreviewed);
        }
        
        // 确定异常类型和样式
        let anomalyType = '';
        let borderColor = '';
        let tagStyle = '';
        
        if (isOverdue) {
            anomalyType = '超时未结算';
            borderColor = 'var(--danger-color)';
            tagStyle = 'background: rgba(239, 68, 68, 0.1); color: var(--danger-color);';
        } else if (isNegative) {
            anomalyType = '负利润';
            borderColor = 'var(--danger-color)';
            tagStyle = 'background: rgba(239, 68, 68, 0.1); color: var(--danger-color);';
        } else if (isExcess) {
            anomalyType = '超额订单';
            borderColor = 'var(--warning-color)';
            tagStyle = 'background: rgba(245, 158, 11, 0.1); color: var(--warning-color);';
        }
        
        return `
            <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 10px; border-left: 4px solid ${borderColor};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${isOverdue ? `<input type="checkbox" class="batch-checkbox" value="${item.id}" style="width: 16px; height: 16px; cursor: pointer;" onchange="updateBatchButton()">` : ''}
                        <h4 style="font-size: 14px; font-weight: 600; color: var(--text-main); margin: 0;">${item.project || '未命名项目'}</h4>
                    </div>
                    <span style="font-size: 12px; padding: 2px 6px; border-radius: 10px; ${tagStyle};">
                        ${anomalyType}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 13px;">
                    <div><span style="color: var(--text-sub);">推广费：</span><strong>¥${amount.toFixed(2)}</strong></div>
                    ${!isOverdue ? `<div><span style="color: var(--text-sub);">预估利润：</span><strong style="color: ${isNegative ? 'var(--danger-color)' : 'var(--success-color);'}">¥${profit.toFixed(2)}</strong></div>` : ''}
                    <div><span style="color: var(--text-sub);">做单时间：</span>${item.time || '未设置'}</div>
                    ${isOverdue ? `<div><span style="color: var(--text-sub);">结算日期：</span>${item.settleTime || '未设置'}</div>` : ''}
                    ${isOverdue ? `<div><span style="color: var(--text-sub);">结算状态：</span>${item.status === 'unsettled' ? '未结算' : (item.status === 'reviewed' ? '已审核待结算' : '已结算')}</div>` : ''}
                    ${isOverdue ? `<div><span style="color: var(--text-sub);">审核状态：</span>${item.qualified === 'pending' ? '未审核' : item.qualified === 'qualified' ? '合格' : item.qualified === 'disqualified' ? '不合格' : '无数据'}</div>` : ''}
                    <div><span style="color: var(--text-sub);">兼职姓名：</span>${item.customer || '未设置'}</div>
                    <div><span style="color: var(--text-sub);">群号简称：</span>${item.group || '未设置'}</div>
                    ${isOverdue ? `<div style="margin-top: 10px; display: flex; gap: 8px;"><button class="btn btn-primary btn-sm" onclick="reviewAndSettle('${item.id}')">审核结算</button></div>` : ''}
                    ${isNegative ? `<div style="margin-top: 10px; display: flex; gap: 8px;"><button class="btn btn-primary btn-sm" onclick="verifyNegativeProfit('${item.id}')">数据核实</button></div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// 过滤异常订单
function filterAnomalies(filter) {
    renderAnomalyList(filter);
}

// 审核结算
function reviewAndSettle(orderId) {
    const order = App.data.find(item => item.id === orderId);
    if (!order) return;
    
    // 填充表单数据
    document.getElementById('reviewOrderId').value = order.id;
    document.getElementById('reviewTime').value = order.time ? order.time.split('T')[0] : '';
    document.getElementById('reviewProject').value = order.project || '';
    document.getElementById('reviewAmount').value = order.amount || '';
    document.getElementById('reviewChannel').value = order.channel || order.channelName || '';
    document.getElementById('reviewChannelPrice').value = order.channelPrice || '';
    document.getElementById('reviewCustomer').value = order.customer || '';
    document.getElementById('reviewSettleTime').value = order.settleTime ? order.settleTime.split('T')[0] : '';
    document.getElementById('reviewStatus').value = order.status || 'unsettled';
    document.getElementById('reviewQualified').value = order.qualified || 'pending';
    
    openModal('reviewSettleModal');
}

// 保存审核结算
function saveReviewSettlement() {
    const orderId = document.getElementById('reviewOrderId').value;
    const order = App.data.find(item => item.id === orderId);
    if (!order) return;
    
    // 更新订单数据
    order.time = document.getElementById('reviewTime').value;
    order.project = document.getElementById('reviewProject').value;
    order.amount = parseFloat(document.getElementById('reviewAmount').value) || 0;
    order.channelName = document.getElementById('reviewChannel').value;
    order.channelPrice = parseFloat(document.getElementById('reviewChannelPrice').value) || 0;
    order.customer = document.getElementById('reviewCustomer').value;
    order.settleTime = document.getElementById('reviewSettleTime').value;
    order.status = document.getElementById('reviewStatus').value;
    order.qualified = document.getElementById('reviewQualified').value;
    
    // 保存数据
    App.saveData();
    
    // 关闭模态框
    closeModal('reviewSettleModal');
    
    // 重新渲染异常订单列表
    renderAnomalyList();
    
    // 更新仪表盘数据
    updateStats();
    
    alert('✅ 审核结算成功，订单预警已解除！');
}

// 数据核实
function verifyNegativeProfit(orderId) {
    const order = App.data.find(item => item.id === orderId);
    if (!order) return;
    
    // 填充表单数据
    document.getElementById('verifyOrderId').value = order.id;
    document.getElementById('verifyTime').value = order.time ? order.time.split('T')[0] : '';
    document.getElementById('verifyProject').value = order.project || '';
    document.getElementById('verifyAmount').value = order.amount || '';
    document.getElementById('verifyChannel').value = order.channel || order.channelName || '';
    document.getElementById('verifyChannelPrice').value = order.channelPrice || '';
    
    // 计算预估利润
    const amount = parseFloat(order.amount) || 0;
    const channelPrice = parseFloat(order.channelPrice) || 0;
    const profit = channelPrice - amount;
    document.getElementById('verifyProfit').value = profit.toFixed(2);
    
    document.getElementById('verifyCustomer').value = order.customer || '';
    document.getElementById('verifyGroup').value = order.group || '';
    document.getElementById('verifyRemark').value = '';
    
    openModal('verifyModal');
}

// 确认核实
function confirmVerification() {
    const orderId = document.getElementById('verifyOrderId').value;
    const order = App.data.find(item => item.id === orderId);
    if (!order) return;
    
    const remark = document.getElementById('verifyRemark').value;
    
    // 标记订单为已核实
    order.verified = true;
    order.verifiedRemark = remark;
    order.verifiedAt = new Date().toISOString();
    
    // 保存数据
    App.saveData();
    
    // 记录核实操作
    App.log('数据核实', `${order.project} - 负利润订单`);
    
    // 关闭模态框
    closeModal('verifyModal');
    
    // 重新渲染异常订单列表
    renderAnomalyList();
    
    // 更新仪表盘数据
    updateStats();
    
    alert('✅ 数据已核实，订单预警已解除！');
}

// 更新批量操作按钮状态
function updateBatchButton() {
    const checkboxes = document.querySelectorAll('.batch-checkbox:checked');
    const applyBtn = document.querySelector('#batchActions .btn-primary');
    if (applyBtn) {
        applyBtn.textContent = checkboxes.length > 0 ? `应用 (${checkboxes.length})` : '应用';
    }
}

// 应用批量审核
function applyBatchReview() {
    const checkboxes = document.querySelectorAll('.batch-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请先选择要批量处理的订单');
        return;
    }
    
    const status = document.getElementById('batchStatus').value;
    const qualified = document.getElementById('batchQualified').value;
    
    if (!status && !qualified) {
        alert('请至少选择一项要修改的状态');
        return;
    }
    
    if (confirm(`确定要批量修改选中的 ${checkboxes.length} 个订单吗？`)) {
        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
        
        selectedIds.forEach(id => {
            const order = App.data.find(item => item.id === id);
            if (order) {
                if (status) order.status = status;
                if (qualified) order.qualified = qualified;
            }
        });
        
        // 保存数据
        App.saveData();
        
        // 记录操作
        App.log('批量审核', `修改了 ${checkboxes.length} 个超时未结算订单`);
        
        // 重新渲染列表
        renderAnomalyList('overdue');
        
        // 更新仪表盘
        updateStats();
        
        // 重置选择
        clearBatchSelection();
    }
}

// 清空批量选择
function clearBatchSelection() {
    document.querySelectorAll('.batch-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateBatchButton();
}

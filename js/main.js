// 深拷贝函数
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 格式化日期
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化金额
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return '¥0.00';
    return '¥' + parseFloat(amount).toFixed(2);
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 检查权限
function checkPermission(role, perm) {
    const permissions = {
        admin: ['manage_users', 'manage_presets', 'manage_workflows', 'manage_settings'],
        user: ['manage_presets', 'manage_workflows'],
        viewer: []
    };
    return permissions[role]?.includes(perm) || false;
}

// 显示提示信息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    toast.textContent = message;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
        style.remove();
    }, 3000);
}

// 切换主题
function toggleTheme() {
    const body = document.body;
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}

// 初始化主题
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

// 切换视图
function switchView(viewName) {
    // 隐藏所有视图
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示选中的视图
    const view = document.getElementById(`view-${viewName}`);
    if (view) {
        view.classList.add('active');
    }
    
    // 更新侧边栏按钮状态
    document.querySelectorAll('.sidebar-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 高亮当前视图对应的按钮
    const navBtn = document.querySelector(`.sidebar-btn[onclick="switchView('${viewName}')"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    // 特殊处理
    if (viewName === 'todo') {
        loadTodoList();
    } else if (viewName === 'list') {
        loadBillList();
    } else if (viewName === 'formManager') {
        loadFormTemplates();
    } else if (viewName === 'workflow') {
        loadWorkflows();
    } else if (viewName === 'customer') {
        loadCustomers();
    } else if (viewName === 'leadgen') {
        renderCustomerLists();
    } else if (viewName === 'recycle') {
        loadRecycledBills();
    } else if (viewName === 'logs') {
        loadAuditLogs();
    } else if (viewName === 'ai') {
        initAIChat();
    } else if (viewName === 'settings') {
        loadSettings();
    }
}

// 登录函数
function login() {
    const role = document.getElementById('roleSelect').value;
    if (!role) {
        alert('请选择角色');
        return;
    }
    
    const user = {
        role: role,
        name: role === 'admin' ? '管理员' : role === 'user' ? '操作员' : '查看者'
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        loginOverlay.style.display = 'none';
    }
    
    // 使用app.js中的App对象
    if (typeof App !== 'undefined') {
        App.init();
    }
}

// 退出登录
function logout() {
    localStorage.removeItem('user');
    location.reload();
}

// 初始化应用
function initApp() {
    initTheme();
    
    // 检查是否存在登录覆盖层
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) {
        const user = localStorage.getItem('user');
        if (!user) {
            loginOverlay.style.display = 'flex';
        } else {
            // 使用app.js中的App对象
            if (typeof App !== 'undefined') {
                App.init();
            }
        }
    } else {
        // 如果没有登录覆盖层，直接初始化应用
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.style.display = 'block';
        }
        // 使用app.js中的App对象
        if (typeof App !== 'undefined') {
            App.init();
        }
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', initApp);

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 虚拟滚动类
class VirtualScroll {
    constructor(options) {
        this.container = options.container;
        this.itemHeight = options.itemHeight || 120;
        this.buffer = options.buffer || 5;
        this.renderItem = options.renderItem;
        this.items = [];
        this.scrollTop = 0;
        this.visibleStart = 0;
        this.visibleEnd = 0;
        
        this.init();
    }
    
    init() {
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = 'position: relative; overflow-y: auto; height: 100%;';
        
        this.content = document.createElement('div');
        this.content.style.cssText = 'position: relative;';
        
        this.wrapper.appendChild(this.content);
        this.container.appendChild(this.wrapper);
        
        this.wrapper.addEventListener('scroll', debounce(() => {
            this.handleScroll();
        }, 16));
    }
    
    setItems(items) {
        this.items = items;
        this.updateContent();
        this.render();
    }
    
    updateContent() {
        const totalHeight = this.items.length * this.itemHeight;
        this.content.style.height = `${totalHeight}px`;
    }
    
    handleScroll() {
        this.scrollTop = this.wrapper.scrollTop;
        this.render();
    }
    
    render() {
        const containerHeight = this.wrapper.clientHeight;
        const visibleCount = Math.ceil(containerHeight / this.itemHeight);
        
        this.visibleStart = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer);
        this.visibleEnd = Math.min(this.items.length, this.visibleStart + visibleCount + this.buffer * 2);
        
        const fragment = document.createDocumentFragment();
        
        for (let i = this.visibleStart; i < this.visibleEnd; i++) {
            const item = this.items[i];
            if (item) {
                const element = this.renderItem(item, i);
                element.style.position = 'absolute';
                element.style.top = `${i * this.itemHeight}px`;
                element.style.width = '100%';
                fragment.appendChild(element);
            }
        }
        
        const oldElements = this.content.querySelectorAll('.virtual-item');
        oldElements.forEach(el => el.remove());
        
        const wrapper = document.createElement('div');
        wrapper.className = 'virtual-item';
        wrapper.appendChild(fragment);
        this.content.appendChild(wrapper);
    }
    
    scrollTo(index) {
        const scrollTop = index * this.itemHeight;
        this.wrapper.scrollTop = scrollTop;
    }
    
    destroy() {
        if (this.wrapper && this.wrapper.parentNode) {
            this.wrapper.parentNode.removeChild(this.wrapper);
        }
    }
}

// 虚拟滚动实例存储
const virtualScrollInstances = {};

// 全局加载管理器
const LoadingManager = {
    overlay: null,
    counter: 0,
    
    show(message = '加载中...') {
        this.counter++;
        
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'globalLoadingOverlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 99999;
                backdrop-filter: blur(4px);
            `;
            
            this.overlay.innerHTML = `
                <div class="loading-spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #e5e7eb;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                "></div>
                <div id="loadingMessage" style="
                    margin-top: 16px;
                    font-size: 16px;
                    color: #374151;
                    font-weight: 500;
                ">${message}</div>
            `;
            
            document.body.appendChild(this.overlay);
            
            // 添加旋转动画样式
            if (!document.getElementById('loadingStyles')) {
                const style = document.createElement('style');
                style.id = 'loadingStyles';
                style.textContent = `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            document.getElementById('loadingMessage').textContent = message;
            this.overlay.style.display = 'flex';
        }
    },
    
    hide() {
        this.counter--;
        
        if (this.counter <= 0) {
            this.counter = 0;
            if (this.overlay) {
                this.overlay.style.display = 'none';
            }
        }
    },
    
    updateMessage(message) {
        const msgElement = document.getElementById('loadingMessage');
        if (msgElement) {
            msgElement.textContent = message;
        }
    }
};

// 骨架屏组件
function createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.style.cssText = `
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        animation: skeleton-loading 1.5s ease-in-out infinite;
    `;
    
    skeleton.innerHTML = `
        <div class="skeleton-line" style="width: 60%; height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; border-radius: 4px; margin-bottom: 8px; animation: skeleton-shimmer 1.5s ease-in-out infinite;"></div>
        <div class="skeleton-line" style="width: 80%; height: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; border-radius: 4px; margin-bottom: 6px; animation: skeleton-shimmer 1.5s ease-in-out infinite;"></div>
        <div class="skeleton-line" style="width: 70%; height: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; border-radius: 4px; margin-bottom: 6px; animation: skeleton-shimmer 1.5s ease-in-out infinite;"></div>
        <div class="skeleton-line" style="width: 50%; height: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; border-radius: 4px; margin-bottom: 6px; animation: skeleton-shimmer 1.5s ease-in-out infinite;"></div>
        <div class="skeleton-line" style="width: 65%; height: 12px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; border-radius: 4px;"></div>
    `;
    
    return skeleton;
}

// 添加骨架屏动画样式
(function addSkeletonStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes skeleton-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .skeleton-loading {
            opacity: 0.7;
        }
    `;
    document.head.appendChild(style);
})();

// 数据加密管理器
const EncryptionManager = {
    // 加密密钥（实际应用中应该从用户输入获取）
    key: 'jlbbd-secret-key-2026',
    
    // 加密数据
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(jsonString, this.key).toString();
            return encrypted;
        } catch (error) {
            console.error('加密失败:', error);
            return null;
        }
    },
    
    // 解密数据
    decrypt(encryptedData) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('解密失败:', error);
            return null;
        }
    },
    
    // 敏感数据脱敏
    maskSensitiveData(value, type = 'phone') {
        if (!value) return '-';
        
        const str = String(value);
        
        switch (type) {
            case 'phone':
                // 手机号脱敏：138****1234
                if (str.length === 11) {
                    return str.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
                }
                return str;
                
            case 'wechat':
                // 微信号脱敏：显示前3位和后2位
                if (str.length > 5) {
                    return str.substring(0, 3) + '***' + str.substring(str.length - 2);
                }
                return str;
                
            case 'email':
                // 邮箱脱敏：a***@example.com
                const atIndex = str.indexOf('@');
                if (atIndex > 1) {
                    return str.substring(0, 1) + '***' + str.substring(atIndex);
                }
                return str;
                
            case 'idcard':
                // 身份证脱敏：显示前6位和后4位
                if (str.length === 18) {
                    return str.substring(0, 6) + '********' + str.substring(14);
                }
                return str;
                
            default:
                return str;
        }
    },
    
    // 加密敏感字段
    encryptSensitiveFields(data) {
        const sensitiveFields = ['wechat', 'phone', 'email', 'idcard'];
        const encrypted = { ...data };
        
        sensitiveFields.forEach(field => {
            if (encrypted[field]) {
                encrypted[field] = this.encrypt(encrypted[field]);
            }
        });
        
        return encrypted;
    },
    
    // 解密敏感字段
    decryptSensitiveFields(data) {
        const sensitiveFields = ['wechat', 'phone', 'email', 'idcard'];
        const decrypted = { ...data };
        
        sensitiveFields.forEach(field => {
            if (decrypted[field]) {
                const decryptedValue = this.decrypt(decrypted[field]);
                if (decryptedValue) {
                    decrypted[field] = decryptedValue;
                }
            }
        });
        
        return decrypted;
    }
};

// 数据访问日志
const AccessLogger = {
    logs: [],
    maxLogs: 1000,
    
    log(action, resource, details = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            resource,
            details,
            userAgent: navigator.userAgent
        };
        
        this.logs.unshift(entry);
        
        // 限制日志数量
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        // 保存到 localStorage
        this.save();
    },
    
    save() {
        try {
            localStorage.setItem('accessLogs', JSON.stringify(this.logs.slice(0, 100)));
        } catch (error) {
            console.error('保存访问日志失败:', error);
        }
    },
    
    load() {
        try {
            const saved = localStorage.getItem('accessLogs');
            if (saved) {
                this.logs = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载访问日志失败:', error);
        }
    },
    
    getLogs(limit = 50) {
        return this.logs.slice(0, limit);
    },
    
    clear() {
        this.logs = [];
        localStorage.removeItem('accessLogs');
    }
};

// 页面加载时初始化访问日志
AccessLogger.load();

// 在window对象上直接定义showCompassCommands函数，确保它在任何时候都可用
window.showCompassCommands = function() {
    console.log('showCompassCommands被调用');
};

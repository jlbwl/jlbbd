// 插件管理器
const PluginManager = {
    plugins: new Map(),
    hooks: new Map(),
    enabled: true,
    
    // 注册插件
    register(plugin) {
        if (!plugin.id || !plugin.name) {
            console.error('插件必须包含 id 和 name 属性');
            return false;
        }
        
        if (this.plugins.has(plugin.id)) {
            console.error(`插件 ${plugin.id} 已存在`);
            return false;
        }
        
        // 验证插件结构
        const requiredMethods = ['activate', 'deactivate'];
        for (const method of requiredMethods) {
            if (typeof plugin[method] !== 'function') {
                console.error(`插件 ${plugin.id} 缺少必需方法: ${method}`);
                return false;
            }
        }
        
        this.plugins.set(plugin.id, {
            ...plugin,
            active: false,
            installedAt: new Date().toISOString()
        });
        
        console.log(`插件 ${plugin.name} 注册成功`);
        return true;
    },
    
    // 激活插件
    activate(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.error(`插件 ${pluginId} 不存在`);
            return false;
        }
        
        if (plugin.active) {
            console.warn(`插件 ${pluginId} 已经激活`);
            return true;
        }
        
        try {
            plugin.activate(this.getAPI());
            plugin.active = true;
            console.log(`插件 ${plugin.name} 激活成功`);
            return true;
        } catch (error) {
            console.error(`激活插件 ${pluginId} 失败:`, error);
            return false;
        }
    },
    
    // 停用插件
    deactivate(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.error(`插件 ${pluginId} 不存在`);
            return false;
        }
        
        if (!plugin.active) {
            console.warn(`插件 ${pluginId} 未激活`);
            return true;
        }
        
        try {
            plugin.deactivate();
            plugin.active = false;
            
            // 移除插件注册的所有钩子
            this.hooks.forEach((callbacks, hookName) => {
                this.hooks.set(hookName, callbacks.filter(cb => cb.pluginId !== pluginId));
            });
            
            console.log(`插件 ${plugin.name} 停用成功`);
            return true;
        } catch (error) {
            console.error(`停用插件 ${pluginId} 失败:`, error);
            return false;
        }
    },
    
    // 卸载插件
    uninstall(pluginId) {
        const plugin = this.plugins.get(pluginId);
        if (!plugin) {
            console.error(`插件 ${pluginId} 不存在`);
            return false;
        }
        
        if (plugin.active) {
            this.deactivate(pluginId);
        }
        
        this.plugins.delete(pluginId);
        console.log(`插件 ${pluginId} 卸载成功`);
        return true;
    },
    
    // 注册钩子
    on(hookName, callback, pluginId) {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, []);
        }
        
        this.hooks.get(hookName).push({
            callback,
            pluginId
        });
    },
    
    // 触发钩子
    emit(hookName, data) {
        const callbacks = this.hooks.get(hookName);
        if (!callbacks || callbacks.length === 0) {
            return data;
        }
        
        let result = data;
        for (const { callback } of callbacks) {
            try {
                result = callback(result);
            } catch (error) {
                console.error(`执行钩子 ${hookName} 失败:`, error);
            }
        }
        
        return result;
    },
    
    // 获取插件API
    getAPI() {
        return {
            on: (hookName, callback, pluginId) => this.on(hookName, callback, pluginId),
            emit: (hookName, data) => this.emit(hookName, data),
            showToast: (message, type = 'info') => showToast(message, type),
            showLoading: (message) => LoadingManager.show(message),
            hideLoading: () => LoadingManager.hide(),
            logAccess: (action, resource, details) => AccessLogger.log(action, resource, details)
        };
    },
    
    // 获取所有插件
    getAllPlugins() {
        return Array.from(this.plugins.values());
    },
    
    // 获取已激活的插件
    getActivePlugins() {
        return Array.from(this.plugins.values()).filter(p => p.active);
    },
    
    // 保存插件状态
    save() {
        const pluginStates = {};
        this.plugins.forEach((plugin, id) => {
            pluginStates[id] = plugin.active;
        });
        localStorage.setItem('pluginStates', JSON.stringify(pluginStates));
    },
    
    // 加载插件状态
    load() {
        try {
            const saved = localStorage.getItem('pluginStates');
            if (saved) {
                const pluginStates = JSON.parse(saved);
                Object.keys(pluginStates).forEach(id => {
                    if (pluginStates[id]) {
                        this.activate(id);
                    }
                });
            }
        } catch (error) {
            console.error('加载插件状态失败:', error);
        }
    }
};

// 示例插件：微信通知插件
const WeChatNotificationPlugin = {
    id: 'wechat-notification',
    name: '微信通知插件',
    version: '1.0.0',
    description: '在客户状态变更时发送微信通知',
    author: 'JLBB Team',
    
    activate(api) {
        this.api = api;
        
        // 注册钩子：客户状态变更
        api.on('customer.status.changed', (data) => {
            this.sendNotification(data);
        }, this.id);
        
        console.log('微信通知插件已激活');
    },
    
    deactivate() {
        console.log('微信通知插件已停用');
    },
    
    sendNotification(data) {
        // 模拟发送微信通知
        console.log('发送微信通知:', data);
        this.api.showToast(`微信通知：客户 ${data.customerName} 状态已更新为 ${data.newStatus}`, 'success');
        this.api.logAccess('notification', 'wechat', data);
    }
};

// 示例插件：数据备份插件
const DataBackupPlugin = {
    id: 'data-backup',
    name: '数据备份插件',
    version: '1.0.0',
    description: '自动备份客户数据到云端',
    author: 'JLBB Team',
    
    activate(api) {
        this.api = api;
        
        // 注册钩子：数据变更
        api.on('data.changed', (data) => {
            this.backupData(data);
        }, this.id);
        
        console.log('数据备份插件已激活');
    },
    
    deactivate() {
        console.log('数据备份插件已停用');
    },
    
    backupData(data) {
        // 模拟数据备份
        console.log('备份数据:', data);
        // 实际应用中可以调用云存储API
    }
};

// 注册内置插件
PluginManager.register(WeChatNotificationPlugin);
PluginManager.register(DataBackupPlugin);

// 页面加载时恢复插件状态
setTimeout(() => {
    PluginManager.load();
}, 1000);

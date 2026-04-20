// 智能获客模块
class LeadgenManager {
    static async deleteCustomer(customerId) {
        try {
            // 从 IndexedDB 中删除客户
            await StorageManager.deleteData('customers', customerId);
            
            // 从本地内存中删除客户
            const customers = await StorageManager.loadCustomers();
            const filteredCustomers = customers.filter(customer => customer.id !== customerId);
            await StorageManager.saveAllData('customers', filteredCustomers);
            
            return true;
        } catch (error) {
            console.error('删除客户失败:', error);
            throw error;
        }
    }
}

// 初始化智能获客功能
function initLeadgen() {
    const initialized = localStorage.getItem('leadgen_initialized');
    if (!initialized) {
        // 添加示例数据
        addSampleCustomers();
        localStorage.setItem('leadgen_initialized', 'true');
    }
    
    // 初始化客户来源下拉框
    populateSourceDropdown('newCustomerSource');
    
    // 渲染客户列表
    renderCustomerLists();
}

// 添加示例客户数据
function addSampleCustomers() {
    const sampleCustomers = [
        {
            id: 'c1',
            name: '张三',
            company: '科技公司',
            companySize: '100-500人',
            wechat: 'zhangsan',
            source: '官网',
            status: 'lead',
            score: 85,
            tags: ['高意向', '技术决策者'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'c2',
            name: '李四',
            company: '金融公司',
            companySize: '500-1000人',
            wechat: 'lisi',
            source: '展会',
            status: 'following',
            score: 75,
            tags: ['财务决策者', '预算充足'],
            createdAt: new Date().toISOString()
        },
        {
            id: 'c3',
            name: '王五',
            company: '教育机构',
            companySize: '100人以下',
            wechat: 'wangwu',
            source: '推荐',
            status: 'high-intent',
            score: 90,
            tags: ['立即购买', 'VIP客户'],
            createdAt: new Date().toISOString()
        }
    ];
    
    sampleCustomers.forEach(customer => {
        addNewCustomer(customer);
    });
}

// 添加新客户
function addNewCustomer(customerData) {
    const customer = {
        id: customerData.id || generateId(),
        name: customerData.name || document.getElementById('newCustomerName').value,
        company: customerData.company || document.getElementById('newCustomerCompany').value,
        companySize: customerData.companySize || document.getElementById('newCustomerCompanySize').value,
        wechat: customerData.wechat || document.getElementById('newCustomerWechat').value,
        source: customerData.source || document.getElementById('newCustomerSource').value,
        status: customerData.status || 'lead',
        score: customerData.score || 0,
        tags: customerData.tags || [],
        createdAt: customerData.createdAt || new Date().toISOString()
    };
    
    // 保存客户数据
    StorageManager.saveCustomer(customer).then(() => {
        renderCustomerLists();
        alert('客户添加成功！');
    }).catch(error => {
        console.error('添加客户失败:', error);
        alert('添加客户失败：' + error.message);
    });
    
    // 刷新客户来源下拉框
    populateSourceDropdown('newCustomerSource');
}

// 渲染客户列表
function renderCustomerLists() {
    return new Promise((resolve, reject) => {
        StorageManager.loadCustomers().then(customers => {
            const statuses = ['lead', 'following', 'high-intent', 'closed', 'lost'];
            
            statuses.forEach(status => {
                const container = document.getElementById(`${status}List`);
                if (container) {
                    const statusCustomers = customers.filter(customer => customer.status === status);
                    container.innerHTML = '';
                    
                    statusCustomers.forEach(customer => {
                        const card = renderCustomerCard(customer);
                        container.appendChild(card);
                    });
                    
                    // 更新状态计数
                    const countElement = document.getElementById(`${status}Count`);
                    if (countElement) {
                        countElement.textContent = statusCustomers.length;
                    }
                }
            });
            
            resolve();
        }).catch(error => {
            console.error('加载客户列表失败:', error);
            reject(error);
        });
    });
}

// 渲染单个客户卡片
function renderCustomerCard(customer) {
    // 记录访问日志
    AccessLogger.log('view', 'customer', { customerId: customer.id, customerName: customer.name });
    
    const card = document.createElement('div');
    card.className = 'customer-card';
    card.style.cssText = 'background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.3s ease; box-sizing: border-box;';
    card.onclick = async () => await showCustomerDetail(customer.id);
    
    // 脱敏处理敏感数据
    const maskedWechat = EncryptionManager.maskSensitiveData(customer.wechat, 'wechat');
    
    card.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">${customer.name}</div>
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 4px;">公司：${customer.company || '-'}</div>
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 4px;">规模：${customer.companySize || '-'}</div>
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 4px;">微信：${maskedWechat}</div>
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 4px;">来源：${customer.source || '-'}</div>
        <div style="font-size: 12px; color: var(--text-sub); margin-bottom: 8px;">评分：${customer.score || 0}</div>
        ${customer.tags && customer.tags.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
            ${customer.tags.map(tag => `
                <span style="background: rgba(37, 99, 235, 0.1); color: var(--primary-color); padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600;">${tag}</span>
            `).join('')}
        </div>
        ` : ''}
        <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
            <button class="btn btn-sm btn-outline" style="font-size: 10px; padding: 2px 6px;" onclick="event.stopPropagation(); updateCustomerStatus('${customer.id}', 'lead')">线索</button>
            <button class="btn btn-sm btn-outline" style="font-size: 10px; padding: 2px 6px;" onclick="event.stopPropagation(); updateCustomerStatus('${customer.id}', 'following')">跟进</button>
            <button class="btn btn-sm btn-outline" style="font-size: 10px; padding: 2px 6px;" onclick="event.stopPropagation(); updateCustomerStatus('${customer.id}', 'high-intent')">高意向</button>
            <button class="btn btn-sm btn-outline" style="font-size: 10px; padding: 2px 6px;" onclick="event.stopPropagation(); updateCustomerStatus('${customer.id}', 'closed')">已成交</button>
            <button class="btn btn-sm btn-outline" style="font-size: 10px; padding: 2px 6px;" onclick="event.stopPropagation(); updateCustomerStatus('${customer.id}', 'lost')">已流失</button>
        </div>
        <button class="btn btn-sm btn-danger" style="font-size: 10px; padding: 2px 6px; margin-top: 8px;" onclick="handleDeleteCustomer('${customer.id}', event)">删除</button>
    `;
    
    return card;
}

// 处理删除客户
window.handleDeleteCustomer = function(customerId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    console.log('删除客户:', customerId);
    if (confirm('确定要删除这个客户吗？')) {
        console.log('确认删除,开始执行...');
        LeadgenManager.deleteCustomer(customerId).then(function() {
            console.log('删除成功,开始渲染列表...');
            renderCustomerLists().then(function() {
                console.log('渲染完成');
                alert('客户删除成功！');
            }).catch(function(err) {
                console.error('渲染失败:', err);
                alert('客户删除成功！(列表刷新失败)');
            });
        }).catch(function(err) {
            console.error('删除失败:', err);
            alert('删除失败: ' + err.message);
        });
    }
};

// 更新客户状态
function updateCustomerStatus(customerId, status) {
    StorageManager.loadCustomers().then(customers => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            customer.status = status;
            StorageManager.saveCustomer(customer).then(() => {
                renderCustomerLists();
                alert('客户状态更新成功！');
            }).catch(error => {
                console.error('更新客户状态失败:', error);
                alert('更新客户状态失败：' + error.message);
            });
        }
    }).catch(error => {
        console.error('加载客户失败:', error);
        alert('加载客户失败：' + error.message);
    });
}

// 显示客户详情
function showCustomerDetail(customerId) {
    StorageManager.loadCustomers().then(customers => {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            // 显示客户详情模态框
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
            
            modal.innerHTML = `
                <div class="modal" style="background: var(--card-bg); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: var(--primary-color); font-size: 18px;">客户详情</h2>
                        <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-sub);">&times;</button>
                    </div>
                    <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
                            <div style="font-weight: 600; color: var(--text-main);">姓名</div>
                            <div>${customer.name}</div>
                            <div style="font-weight: 600; color: var(--text-main);">公司</div>
                            <div>${customer.company || '-'}</div>
                            <div style="font-weight: 600; color: var(--text-main);">公司规模</div>
                            <div>${customer.companySize || '-'}</div>
                            <div style="font-weight: 600; color: var(--text-main);">微信</div>
                            <div>${EncryptionManager.maskSensitiveData(customer.wechat, 'wechat')}</div>
                            <div style="font-weight: 600; color: var(--text-main);">来源</div>
                            <div>${customer.source || '-'}</div>
                            <div style="font-weight: 600; color: var(--text-main);">状态</div>
                            <div>${getStatusText(customer.status)}</div>
                            <div style="font-weight: 600; color: var(--text-main);">评分</div>
                            <div>${customer.score || 0}</div>
                            <div style="font-weight: 600; color: var(--text-main);">标签</div>
                            <div>${customer.tags && customer.tags.length > 0 ? customer.tags.join(', ') : '-'}</div>
                            <div style="font-weight: 600; color: var(--text-main);">创建时间</div>
                            <div>${formatDate(customer.createdAt)}</div>
                        </div>
                    </div>
                    <div class="modal-footer" style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                        <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 10px 20px;">关闭</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
    }).catch(error => {
        console.error('加载客户详情失败:', error);
        alert('加载客户详情失败：' + error.message);
    });
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        lead: '线索',
        following: '跟进',
        'high-intent': '高意向',
        closed: '已成交',
        lost: '已流失'
    };
    return statusMap[status] || status;
}

// 搜索客户
function searchCustomers() {
    const keyword = document.getElementById('leadgenSearchInput').value.toLowerCase();
    StorageManager.loadCustomers().then(customers => {
        const filteredCustomers = customers.filter(customer => {
            return customer.name.toLowerCase().includes(keyword) ||
                   (customer.company && customer.company.toLowerCase().includes(keyword)) ||
                   (customer.source && customer.source.toLowerCase().includes(keyword)) ||
                   (customer.tags && customer.tags.some(tag => tag.toLowerCase().includes(keyword)));
        });
        
        // 显示搜索结果
        const statuses = ['lead', 'following', 'high-intent', 'closed', 'lost'];
        statuses.forEach(status => {
            const container = document.getElementById(`${status}List`);
            if (container) {
                const statusCustomers = filteredCustomers.filter(customer => customer.status === status);
                container.innerHTML = '';
                
                statusCustomers.forEach(customer => {
                    const card = renderCustomerCard(customer);
                    container.appendChild(card);
                });
                
                // 更新状态计数
                const countElement = document.getElementById(`${status}Count`);
                if (countElement) {
                    countElement.textContent = statusCustomers.length;
                }
            }
        });
    }).catch(error => {
        console.error('搜索客户失败:', error);
        alert('搜索客户失败：' + error.message);
    });
}

// 清空搜索
function clearSearch() {
    document.getElementById('leadgenSearchInput').value = '';
    renderCustomerLists();
}

// 导出客户数据
function exportCustomers(format) {
    StorageManager.loadCustomers().then(customers => {
        if (format === 'json') {
            const jsonData = JSON.stringify(customers, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else if (format === 'csv') {
            const headers = ['姓名', '公司', '公司规模', '微信', '来源', '状态', '评分', '标签', '创建时间'];
            const csvContent = [
                headers.join(','),
                ...customers.map(customer => [
                    customer.name,
                    customer.company || '',
                    customer.companySize || '',
                    customer.wechat || '',
                    customer.source || '',
                    getStatusText(customer.status),
                    customer.score || 0,
                    customer.tags && customer.tags.length > 0 ? customer.tags.join(';') : '',
                    customer.createdAt
                ].join(','))
            ].join('\n');
            
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }).catch(error => {
        console.error('导出客户数据失败:', error);
        alert('导出客户数据失败：' + error.message);
    });
}

// 导入客户数据
function importCustomers() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            let customers;
            if (file.name.endsWith('.json')) {
                customers = JSON.parse(e.target.result);
            } else if (file.name.endsWith('.csv')) {
                const csvContent = e.target.result;
                const lines = csvContent.split('\n');
                const headers = lines[0].split(',');
                customers = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const customer = {};
                    headers.forEach((header, index) => {
                        customer[header] = values[index];
                    });
                    return customer;
                });
            } else {
                alert('不支持的文件格式，请使用 JSON 或 CSV 文件');
                return;
            }
            
            // 导入客户数据
            customers.forEach(customer => {
                addNewCustomer(customer);
            });
            
            alert(`成功导入 ${customers.length} 个客户！`);
        } catch (error) {
            console.error('导入客户数据失败:', error);
            alert('导入客户数据失败：' + error.message);
        }
    };
    reader.readAsText(file);
    fileInput.value = '';
}

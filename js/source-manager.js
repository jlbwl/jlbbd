// 客户来源管理系统
class SourceManager {
    static getSources() {
        try {
            const sources = localStorage.getItem('leadgen_sources');
            return sources ? JSON.parse(sources) : this.getDefaultSources();
        } catch (error) {
            console.error('获取来源列表失败:', error);
            return this.getDefaultSources();
        }
    }
    
    static getDefaultSources() {
        return ['官网', '展会', '推荐', '社交媒体', '广告', '其他'];
    }
    
    static saveSources(sources) {
        try {
            localStorage.setItem('leadgen_sources', JSON.stringify(sources));
            return true;
        } catch (error) {
            console.error('保存来源列表失败:', error);
            return false;
        }
    }
    
    static addSource(source) {
        const sources = this.getSources();
        if (!sources.includes(source) && source.trim()) {
            sources.push(source.trim());
            return this.saveSources(sources);
        }
        return false;
    }
    
    static removeSource(source) {
        const sources = this.getSources();
        const filtered = sources.filter(s => s !== source);
        if (filtered.length !== sources.length) {
            return this.saveSources(filtered);
        }
        return false;
    }
    
    static updateSource(oldSource, newSource) {
        const sources = this.getSources();
        const index = sources.indexOf(oldSource);
        if (index !== -1 && newSource.trim() && !sources.includes(newSource.trim())) {
            sources[index] = newSource.trim();
            return this.saveSources(sources);
        }
        return false;
    }
}

// 填充客户来源下拉框
function populateSourceDropdown(selectId, selectedValue = '') {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    
    // 清空现有选项（保留请选择）
    selectElement.innerHTML = '<option value="">请选择</option>';
    
    // 添加来源选项
    const sources = SourceManager.getSources();
    sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        if (source === selectedValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

// 显示来源管理器
function showSourceManager() {
    const modal = document.createElement('div');
    modal.id = 'sourceManagerModal';
    modal.className = 'modal-overlay';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 10000;';
    
    const sources = SourceManager.getSources();
    
    modal.innerHTML = `
        <div class="modal" style="background: var(--card-bg); border-radius: 12px; padding: 24px; max-width: 450px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: var(--primary-color); font-size: 18px;">📋 客户来源管理</h2>
                <button class="close-btn" onclick="closeSourceManagerModal()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-sub);">&times;</button>
            </div>
            <div class="modal-body" style="display: flex; flex-direction: column; gap: 16px;">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="newSourceInput" placeholder="输入新的客户来源" style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; box-sizing: border-box;">
                    <button class="btn btn-primary" onclick="addSource()" style="padding: 10px 16px;">添加</button>
                </div>
                <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; max-height: 300px; overflow-y: auto;">
                    ${sources.length > 0 ? sources.map((source, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-color);">
                            <div style="flex: 1;">${source}</div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-sm btn-outline" onclick="editSource('${source}')" style="font-size: 12px; padding: 4px 8px;">编辑</button>
                                <button class="btn btn-sm btn-danger" onclick="removeSource('${source}')" style="font-size: 12px; padding: 4px 8px;">删除</button>
                            </div>
                        </div>
                    `).join('') : '<div style="text-align: center; color: var(--text-sub); padding: 20px;">暂无客户来源</div>'}
                </div>
            </div>
            <div class="modal-footer" style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-outline" onclick="closeSourceManagerModal()" style="padding: 10px 20px;">取消</button>
                <button class="btn btn-primary" onclick="closeSourceManagerModal()" style="padding: 10px 20px;">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 关闭来源管理器
function closeSourceManagerModal() {
    const modal = document.getElementById('sourceManagerModal');
    if (modal) {
        modal.remove();
    }
    // 刷新所有来源下拉框
    populateSourceDropdown('newCustomerSource');
    if (document.getElementById('editCustomerSource')) {
        populateSourceDropdown('editCustomerSource');
    }
}

// 添加新来源
function addSource() {
    const input = document.getElementById('newSourceInput');
    if (input) {
        const source = input.value.trim();
        if (source) {
            if (SourceManager.addSource(source)) {
                showSourceManager(); // 重新显示管理器以更新列表
            } else {
                alert('来源已存在或添加失败！');
            }
        }
    }
}

// 编辑来源
function editSource(source) {
    const newSource = prompt('请输入新的来源名称:', source);
    if (newSource !== null) {
        if (SourceManager.updateSource(source, newSource)) {
            showSourceManager(); // 重新显示管理器以更新列表
        } else {
            alert('来源名称已存在或更新失败！');
        }
    }
}

// 删除来源
function removeSource(source) {
    if (confirm(`确定要删除来源 "${source}" 吗？`)) {
        if (SourceManager.removeSource(source)) {
            showSourceManager(); // 重新显示管理器以更新列表
        } else {
            alert('删除失败！');
        }
    }
}

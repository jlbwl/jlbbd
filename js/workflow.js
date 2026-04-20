// ==================== 工作流管理器 ====================
class WorkflowManager {
    static init() {
        if (!App.workflows) {
            App.workflows = [];
        }
        console.log('✅ 工作流管理器已初始化');
    }
    
    static createWorkflow(name, description, steps) {
        const workflow = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name,
            description,
            steps,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
        };
        
        App.workflows.push(workflow);
        App.saveData();
        return workflow;
    }
    
    static updateWorkflow(workflowId, updates) {
        const index = App.workflows.findIndex(w => w.id === workflowId);
        if (index !== -1) {
            App.workflows[index] = {
                ...App.workflows[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            App.saveData();
            return App.workflows[index];
        }
        return null;
    }
    
    static deleteWorkflow(workflowId) {
        const index = App.workflows.findIndex(w => w.id === workflowId);
        if (index !== -1) {
            App.workflows.splice(index, 1);
            App.saveData();
            return true;
        }
        return false;
    }
    
    static getWorkflow(workflowId) {
        return App.workflows.find(w => w.id === workflowId);
    }
    
    static getAllWorkflows() {
        return App.workflows;
    }
    
    static executeWorkflow(workflowId, data) {
        const workflow = this.getWorkflow(workflowId);
        if (!workflow) return { success: false, message: '工作流不存在' };
        
        try {
            for (const step of workflow.steps) {
                switch (step.type) {
                    case 'email':
                        console.log('发送邮件:', step.config);
                        // 模拟邮件发送
                        break;
                    case 'webhook':
                        console.log('调用Webhook:', step.config.url, data);
                        // 模拟Webhook调用
                        break;
                    case 'notification':
                        console.log('发送通知:', step.config.message);
                        // 模拟通知发送
                        break;
                    case 'data-transform':
                        console.log('数据转换:', step.config);
                        // 模拟数据转换
                        break;
                }
            }
            return { success: true, message: '工作流执行成功' };
        } catch (error) {
            console.error('工作流执行失败:', error);
            return { success: false, message: '工作流执行失败' };
        }
    }
    
    static renderWorkflowList() {
        const workflowList = document.getElementById('workflowList');
        if (!workflowList) return;
        
        workflowList.innerHTML = '';
        
        if (App.workflows.length === 0) {
            workflowList.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 40px; color: var(--text-sub);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text-main);">暂无工作流</h3>
                    <p style="font-size: 14px; margin-bottom: 20px;">您可以创建工作流来自动化表单提交后的处理流程</p>
                    <button class="btn btn-primary" onclick="WorkflowManager.openCreateWorkflowModal()">➕ 创建工作流</button>
                </div>
            `;
            return;
        }
        
        App.workflows.forEach(workflow => {
            const card = document.createElement('div');
            card.className = 'workflow-card';
            card.style.cssText = `
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                transition: all 0.3s ease-in-out;
                cursor: pointer;
                position: relative;
                overflow: hidden;
            `;
            card.onmouseenter = () => {
                card.style.transform = 'translateY(-4px)';
                card.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                card.style.borderColor = 'var(--primary-color)';
            };
            card.onmouseleave = () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                card.style.borderColor = 'var(--border-color)';
            };
            
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 16px; font-weight: 600; color: var(--text-main); margin: 0;">${workflow.name}</h3>
                        ${workflow.description ? `<p style="font-size: 13px; color: var(--text-sub); margin: 5px 0 0 0; line-height: 1.4;">${workflow.description}</p>` : ''}
                    </div>
                    <span class="status-tag ${workflow.status === 'active' ? 'status-settled' : 'status-unsettled'}">
                        ${workflow.status === 'active' ? '启用' : '禁用'}
                    </span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 11px; padding: 2px 8px; background: rgba(37, 99, 235, 0.1); color: var(--primary-color); border-radius: 10px;">${workflow.steps.length} 个步骤</span>
                    <span style="font-size: 11px; padding: 2px 8px; background: rgba(16, 185, 129, 0.1); color: var(--success-color); border-radius: 10px;">创建于 ${new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: var(--text-sub);">最后更新: ${new Date(workflow.updatedAt).toLocaleString()}</span>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); WorkflowManager.editWorkflow('${workflow.id}')" title="编辑">✏️</button>
                        <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); WorkflowManager.testWorkflow('${workflow.id}')" title="测试">🧪</button>
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); WorkflowManager.deleteWorkflow('${workflow.id}')" title="删除">🗑️</button>
                    </div>
                </div>
            `;
            
            card.onclick = (e) => {
                if (!e.target.closest('button')) {
                    WorkflowManager.showWorkflowDetail(workflow.id);
                }
            };
            
            workflowList.appendChild(card);
        });
    }
    
    static openCreateWorkflowModal() {
        openModal('createWorkflowModal', {
            title: '创建工作流',
            titleId: 'createWorkflowModalTitle',
            onOpen: () => {
                const modalBody = document.getElementById('createWorkflowModalBody');
                modalBody.innerHTML = `
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流名称</label>
                            <input type="text" id="workflowName" placeholder="请输入工作流名称" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流描述</label>
                            <textarea id="workflowDescription" placeholder="请输入工作流描述" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流步骤</label>
                            <div id="workflowSteps" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; background: rgba(0,0,0,0.02);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                    <h4 style="margin: 0; font-size: 14px; color: var(--text-main);">步骤列表</h4>
                                    <button class="btn btn-primary btn-sm" onclick="WorkflowManager.addWorkflowStep()">➕ 添加步骤</button>
                                </div>
                                <div id="stepsContainer">
                                    <!-- 步骤将在这里动态添加 -->
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    static addWorkflowStep() {
        const stepsContainer = document.getElementById('stepsContainer');
        const stepIndex = stepsContainer.children.length;
        
        const stepDiv = document.createElement('div');
        stepDiv.className = 'workflow-step';
        stepDiv.style.cssText = `
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        `;
        
        stepDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h5 style="margin: 0; font-size: 13px; color: var(--text-main);">步骤 ${stepIndex + 1}</h5>
                <button class="btn btn-danger btn-sm" onclick="this.parentElement.parentElement.remove()">删除</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
                <label style="font-size: 13px; font-weight: 600; color: var(--text-main);">步骤类型</label>
                <select class="step-type" style="padding: 8px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    <option value="email">发送邮件</option>
                    <option value="webhook">调用Webhook</option>
                    <option value="notification">发送通知</option>
                    <option value="data-transform">数据转换</option>
                </select>
            </div>
            <div class="step-config" style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.02); border-radius: 6px;">
                <!-- 配置将根据步骤类型动态添加 -->
            </div>
        `;
        
        stepsContainer.appendChild(stepDiv);
        
        // 绑定步骤类型变化事件
        const stepTypeSelect = stepDiv.querySelector('.step-type');
        stepTypeSelect.addEventListener('change', () => {
            WorkflowManager.updateStepConfig(stepDiv, stepTypeSelect.value);
        });
        
        // 初始化配置
        WorkflowManager.updateStepConfig(stepDiv, stepTypeSelect.value);
    }
    
    static updateStepConfig(stepDiv, stepType) {
        const configDiv = stepDiv.querySelector('.step-config');
        
        switch (stepType) {
            case 'email':
                configDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">收件人</label>
                        <input type="email" class="step-config-email" placeholder="请输入邮箱地址" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">主题</label>
                        <input type="text" class="step-config-subject" placeholder="请输入邮件主题" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: start;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">内容</label>
                        <textarea class="step-config-content" placeholder="请输入邮件内容" rows="2" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; resize: vertical;"></textarea>
                    </div>
                `;
                break;
            case 'webhook':
                configDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">Webhook URL</label>
                        <input type="url" class="step-config-url" placeholder="请输入Webhook URL" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">方法</label>
                        <select class="step-config-method" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                            <option value="POST">POST</option>
                            <option value="GET">GET</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                `;
                break;
            case 'notification':
                configDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">通知类型</label>
                        <select class="step-config-type" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                            <option value="system">系统通知</option>
                            <option value="email">邮件通知</option>
                            <option value="sms">短信通知</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: start;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">消息内容</label>
                        <textarea class="step-config-message" placeholder="请输入通知内容" rows="2" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px; resize: vertical;"></textarea>
                    </div>
                `;
                break;
            case 'data-transform':
                configDiv.innerHTML = `
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; margin-bottom: 8px;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">转换类型</label>
                        <select class="step-config-transform-type" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                            <option value="format-date">格式化日期</option>
                            <option value="uppercase">转为大写</option>
                            <option value="lowercase">转为小写</option>
                            <option value="trim">去除空格</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
                        <label style="font-size: 12px; font-weight: 600; color: var(--text-main);">目标字段</label>
                        <input type="text" class="step-config-target" placeholder="请输入目标字段名" style="padding: 6px; border: 1px solid var(--border-color); border-radius: 6px; font-size: 13px;">
                    </div>
                `;
                break;
        }
    }
    
    static editWorkflow(workflowId) {
        const workflow = this.getWorkflow(workflowId);
        if (!workflow) return;
        
        window.currentWorkflowId = workflowId;
        
        openModal('editWorkflowModal', {
            title: '编辑工作流',
            titleId: 'editWorkflowModalTitle',
            onOpen: () => {
                const modalBody = document.getElementById('editWorkflowModalBody');
                modalBody.innerHTML = `
                    <div style="padding: 20px;">
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流名称</label>
                            <input type="text" id="editWorkflowName" value="${workflow.name}" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px;">
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流描述</label>
                            <textarea id="editWorkflowDescription" rows="3" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; resize: vertical;">${workflow.description || ''}</textarea>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-main);">工作流状态</label>
                            <select id="editWorkflowStatus" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px;">
                                <option value="active" ${workflow.status === 'active' ? 'selected' : ''}>启用</option>
                                <option value="inactive" ${workflow.status === 'inactive' ? 'selected' : ''}>禁用</option>
                            </select>
                        </div>
                    </div>
                `;
            }
        });
    }
    
    static testWorkflow(workflowId) {
        const result = this.executeWorkflow(workflowId, { test: 'data' });
        if (result.success) {
            alert('✅ 工作流测试成功！');
        } else {
            alert('❌ 工作流测试失败：' + result.message);
        }
    }
    
    static showWorkflowDetail(workflowId) {
        const workflow = this.getWorkflow(workflowId);
        if (!workflow) return;
        
        openModal('workflowDetailModal', {
            title: workflow.name + ' - 工作流详情',
            titleId: 'workflowDetailModalTitle',
            onOpen: () => {
                const modalBody = document.getElementById('workflowDetailModalBody');
                modalBody.innerHTML = `
                    <div style="padding: 20px;">
                        <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: var(--text-main);">工作流信息</h3>
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">工作流名称</div>
                                <div style="font-size: 13px; color: var(--text-sub);">${workflow.name}</div>
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">工作流描述</div>
                                <div style="font-size: 13px; color: var(--text-sub);">${workflow.description || '无'}</div>
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">状态</div>
                                <div style="font-size: 13px; color: var(--text-sub);">${workflow.status === 'active' ? '启用' : '禁用'}</div>
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">创建时间</div>
                                <div style="font-size: 13px; color: var(--text-sub);">${new Date(workflow.createdAt).toLocaleString()}</div>
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">最后更新</div>
                                <div style="font-size: 13px; color: var(--text-sub);">${new Date(workflow.updatedAt).toLocaleString()}</div>
                            </div>
                        </div>
                        <div style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px;">
                            <h3 style="margin: 0 0 10px 0; font-size: 16px; color: var(--text-main);">工作流步骤</h3>
                            ${workflow.steps.length > 0 ? `
                                <div style="space-y: 10px;">
                                    ${workflow.steps.map((step, index) => `
                                        <div style="background: rgba(0,0,0,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                <h4 style="margin: 0; font-size: 14px; color: var(--text-main);">步骤 ${index + 1}: ${this.getStepTypeName(step.type)}</h4>
                                            </div>
                                            <div style="font-size: 13px; color: var(--text-sub);">
                                                ${this.getStepConfigDisplay(step.config)}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div style="text-align: center; padding: 20px; color: var(--text-sub);">
                                    <p>暂无步骤</p>
                                </div>
                            `}
                        </div>
                    </div>
                `;
            }
        });
    }
    
    static getStepTypeName(type) {
        const typeNames = {
            email: '发送邮件',
            webhook: '调用Webhook',
            notification: '发送通知',
            'data-transform': '数据转换'
        };
        return typeNames[type] || type;
    }
    
    static getStepConfigDisplay(config) {
        if (!config) return '无配置';
        
        const configDisplay = [];
        for (const [key, value] of Object.entries(config)) {
            configDisplay.push(`${key}: ${value}`);
        }
        return configDisplay.join('<br>');
    }
}

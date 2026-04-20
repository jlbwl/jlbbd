// 立即检测是否是扫码访问，在页面加载的最早阶段
(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const publishData = urlParams.get('publish');
    
    if (publishData) {
        // 是扫码访问，立即处理，不加载主应用
        document.addEventListener('DOMContentLoaded', function() {
            try {
                console.log('收到数据:', publishData);
                
                let rawPublishInfo;
                
                // 优先尝试解析完整编码数据（确保跨设备可用）
                try {
                    // 将URL安全的Base64转换回标准Base64
                    let base64Data = publishData.replace(/-/g, '+').replace(/_/g, '/');
                    while (base64Data.length % 4) {
                        base64Data += '=';
                    }
                    
                    let dataString;
                    try {
                        dataString = decodeURIComponent(atob(base64Data));
                    } catch (e) {
                        dataString = decodeURIComponent(escape(atob(base64Data)));
                    }
                    
                    console.log('解析完整编码数据:', dataString);
                    rawPublishInfo = JSON.parse(dataString);
                } catch (e) {
                    console.log('完整编码解析失败，尝试 localStorage');
                    // 尝试从 localStorage 读取数据（旧格式）
                    const storedData = localStorage.getItem(publishData);
                    if (storedData) {
                        console.log('从 localStorage 读取数据成功');
                        rawPublishInfo = JSON.parse(storedData);
                    } else {
                        throw new Error('无法解析数据');
                    }
                }
                
                // 将紧凑格式转换为标准格式
                const publishInfo = {
                    forms: (rawPublishInfo || []).map(form => ({
                        id: form.i,
                        name: form.n,
                        description: '',
                        brokerLink: form.b || '',
                        components: (form.c || []).map(comp => ({
                            id: comp.i,
                            title: comp.t,
                            type: comp.y,
                            placeholder: '',
                            required: comp.r === 1,
                            hidden: comp.h === 1,
                            value: comp.v,
                            options: null
                        }))
                    }))
                };
                
                // 当前选中的表单
                let selectedForm = null;
                let formValues = {};
                
                // 清空文档内容
                document.body.innerHTML = '';
                
                // 设置基本样式
                document.body.style.cssText = `
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    background-color: #f1f5f9;
                    color: #1e293b;
                `;
                
                // 创建主容器
                const mainContainer = document.createElement('div');
                mainContainer.style.cssText = `
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                `;
                
                // 渲染表单列表
                function renderFormList() {
                    mainContainer.innerHTML = '';
                    
                    const header = document.createElement('div');
                    header.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                    `;
                    header.innerHTML = `<h2 style="color: #2563eb; margin: 0;">📋 请选择表单</h2><p style="color: #64748b; margin-top: 5px;">共 ${publishInfo.forms.length} 个开放表单</p>`;
                    
                    mainContainer.appendChild(header);
                    
                    const content = document.createElement('div');
                    content.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                    `;
                    
                    if (publishInfo.forms.length > 0) {
                        publishInfo.forms.forEach((form, index) => {
                            const formCard = document.createElement('div');
                            formCard.style.cssText = `
                                background: white;
                                border: 2px solid #e2e8f0;
                                border-radius: 12px;
                                padding: 20px;
                                margin-bottom: 15px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                                cursor: pointer;
                                transition: all 0.3s;
                            `;
                            formCard.onmouseover = () => {
                                formCard.style.borderColor = '#2563eb';
                                formCard.style.transform = 'translateY(-2px)';
                                formCard.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)';
                            };
                            formCard.onmouseout = () => {
                                formCard.style.borderColor = '#e2e8f0';
                                formCard.style.transform = 'translateY(0)';
                                formCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            };
                            formCard.onclick = () => {
                                selectedForm = form;
                                formValues = {};
                                renderFormFill();
                            };
                            
                            formCard.innerHTML = `
                                <h3 style="font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 8px 0;">${form.name}</h3>
                                ${form.description ? `<p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">${form.description}</p>` : ''}
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">开放</span>
                                    <span style="color: #2563eb; font-size: 14px; font-weight: 600;">点击填写 →</span>
                                </div>
                            `;
                            
                            content.appendChild(formCard);
                        });
                    } else {
                        content.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;"><div style="font-size: 32px; margin-bottom: 12px;">📋</div><p style="font-size: 16px;">暂无开放表单</p></div>';
                    }
                    
                    mainContainer.appendChild(content);
                    document.body.appendChild(mainContainer);
                }
                
                // 当前问题索引
                let currentQuestionIndex = 0;
                
                // 渲染表单填写页面（单问题格式）
                function renderFormFill() {
                    mainContainer.innerHTML = '';
                    
                    const header = document.createElement('div');
                    header.style.cssText = `
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                    `;
                    header.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="color: #2563eb; margin: 0; font-size: 20px;">📝 ${selectedForm.name}</h2>
                                ${selectedForm.description ? `<p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">${selectedForm.description}</p>` : ''}
                            </div>
                            <button id="backBtn" style="background: #e2e8f0; color: #475569; border: none; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">返回</button>
                        </div>
                    `;
                    
                    mainContainer.appendChild(header);
                    
                    const formContainer = document.createElement('div');
                    formContainer.style.cssText = `
                        background: white;
                        padding: 24px;
                        border-radius: 12px;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        border: 1px solid #e2e8f0;
                    `;
                    
                    const visibleComponents = selectedForm.components ? selectedForm.components.filter(c => !c.hidden) : [];
                    
                    if (visibleComponents.length > 0) {
                        // 显示进度条
                        const progressContainer = document.createElement('div');
                        progressContainer.style.cssText = `
                            margin-bottom: 20px;
                        `;
                        
                        const progressBar = document.createElement('div');
                        progressBar.style.cssText = `
                            width: 100%;
                            height: 8px;
                            background: #e2e8f0;
                            border-radius: 4px;
                            overflow: hidden;
                        `;
                        
                        const progressFill = document.createElement('div');
                        const progress = ((currentQuestionIndex + 1) / visibleComponents.length) * 100;
                        progressFill.style.cssText = `
                            width: ${progress}%;
                            height: 100%;
                            background: #2563eb;
                            border-radius: 4px;
                            transition: width 0.3s ease;
                        `;
                        
                        progressBar.appendChild(progressFill);
                        progressContainer.appendChild(progressBar);
                        
                        const progressText = document.createElement('div');
                        progressText.style.cssText = `
                            text-align: right;
                            margin-top: 8px;
                            font-size: 12px;
                            color: #64748b;
                        `;
                        progressText.textContent = `${currentQuestionIndex + 1}/${visibleComponents.length}`;
                        progressContainer.appendChild(progressText);
                        
                        formContainer.appendChild(progressContainer);
                        
                        // AI识别按钮
                        if (currentQuestionIndex === 0) {
                            const aiButton = document.createElement('button');
                            aiButton.style.cssText = `
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 8px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.3s ease;
                            `;
                            aiButton.innerHTML = '🤖 AI识别填表';
                            aiButton.onclick = () => openAiRecognitionModal();
                            formContainer.appendChild(aiButton);
                        }
                        
                        // 显示当前问题
                        const component = visibleComponents[currentQuestionIndex];
                        
                        const fieldWrapper = document.createElement('div');
                        fieldWrapper.style.cssText = 'margin-bottom: 30px;';
                        
                        const labelDiv = document.createElement('div');
                        labelDiv.style.cssText = 'margin-bottom: 16px; display: flex; align-items: center; gap: 8px;';
                        
                        const label = document.createElement('label');
                        label.style.cssText = 'font-size: 18px; font-weight: 600; color: #1e293b; line-height: 1.4;';
                        label.textContent = component.title;
                        labelDiv.appendChild(label);
                        
                        if (component.required) {
                            const requiredMark = document.createElement('span');
                            requiredMark.style.cssText = 'color: #ef4444; font-weight: 700; font-size: 18px;';
                            requiredMark.textContent = '*';
                            labelDiv.appendChild(requiredMark);
                            
                            const requiredText = document.createElement('span');
                            requiredText.style.cssText = 'font-size: 12px; color: #ef4444; background: #fef2f2; padding: 2px 8px; border-radius: 4px;';
                            requiredText.textContent = '必填';
                            labelDiv.appendChild(requiredText);
                        }
                        
                        fieldWrapper.appendChild(labelDiv);
                        
                        let input;
                        if (component.type === 'radio' && component.options) {
                            const radioGroup = document.createElement('div');
                            radioGroup.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';
                            
                            component.options.forEach((option, optIndex) => {
                                const radioWrapper = document.createElement('label');
                                radioWrapper.style.cssText = 'display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 14px; border: 2px solid #e2e8f0; border-radius: 10px; transition: all 0.2s;';
                                
                                const radioInput = document.createElement('input');
                                radioInput.type = 'radio';
                                radioInput.name = `radio_${component.id}`;
                                radioInput.value = option;
                                radioInput.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';
                                
                                if (formValues[component.id] === option) {
                                    radioInput.checked = true;
                                    radioWrapper.style.borderColor = '#2563eb';
                                    radioWrapper.style.background = '#eff6ff';
                                }
                                
                                radioInput.onchange = () => {
                                    formValues[component.id] = option;
                                    // 自动前进到下一个问题
                                    if (currentQuestionIndex < visibleComponents.length - 1) {
                                        currentQuestionIndex++;
                                        renderFormFill();
                                    }
                                };
                                
                                radioWrapper.onmouseover = () => {
                                    if (formValues[component.id] !== option) {
                                        radioWrapper.style.borderColor = '#cbd5e1';
                                    }
                                };
                                
                                radioWrapper.onmouseout = () => {
                                    if (formValues[component.id] !== option) {
                                        radioWrapper.style.borderColor = '#e2e8f0';
                                    }
                                };
                                
                                const optionLabel = document.createElement('span');
                                optionLabel.style.cssText = 'font-size: 16px; color: #334155;';
                                optionLabel.textContent = option;
                                
                                radioWrapper.appendChild(radioInput);
                                radioWrapper.appendChild(optionLabel);
                                radioGroup.appendChild(radioWrapper);
                            });
                            
                            input = radioGroup;
                        } else if (component.type === 'textarea') {
                            input = document.createElement('textarea');
                            input.rows = 4;
                            input.placeholder = component.placeholder || `请输入${component.title}`;
                            input.value = formValues[component.id] || '';
                            input.style.cssText = `
                                width: 100%;
                                padding: 14px;
                                border: 2px solid #e2e8f0;
                                border-radius: 8px;
                                font-size: 16px;
                                resize: vertical;
                                box-sizing: border-box;
                                transition: all 0.2s;
                            `;
                            input.onfocus = () => {
                                input.style.borderColor = '#2563eb';
                                input.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                            };
                            input.onblur = () => {
                                input.style.borderColor = '#e2e8f0';
                                input.style.boxShadow = 'none';
                                // 自动前进到下一个问题
                                if (currentQuestionIndex < visibleComponents.length - 1) {
                                    currentQuestionIndex++;
                                    renderFormFill();
                                }
                            };
                            input.oninput = () => {
                                formValues[component.id] = input.value;
                            };
                        } else {
                            input = document.createElement('input');
                            input.type = component.type === 'phone' ? 'tel' : (component.type === 'email' ? 'email' : 'text');
                            input.placeholder = component.placeholder || `请输入${component.title}`;
                            input.value = formValues[component.id] || '';
                            input.style.cssText = `
                                width: 100%;
                                padding: 14px;
                                border: 2px solid #e2e8f0;
                                border-radius: 8px;
                                font-size: 16px;
                                box-sizing: border-box;
                                transition: all 0.2s;
                            `;
                            input.onfocus = () => {
                                input.style.borderColor = '#2563eb';
                                input.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
                            };
                            input.onblur = () => {
                                input.style.borderColor = '#e2e8f0';
                                input.style.boxShadow = 'none';
                                // 自动前进到下一个问题
                                if (currentQuestionIndex < visibleComponents.length - 1) {
                                    currentQuestionIndex++;
                                    renderFormFill();
                                }
                            };
                            input.oninput = () => {
                                formValues[component.id] = input.value;
                            };
                            // 回车键自动前进
                            input.onkeypress = (e) => {
                                if (e.key === 'Enter' && currentQuestionIndex < visibleComponents.length - 1) {
                                    currentQuestionIndex++;
                                    renderFormFill();
                                }
                            };
                        }
                        
                        fieldWrapper.appendChild(input);
                        formContainer.appendChild(fieldWrapper);
                        
                        // 导航按钮
                        const navigationContainer = document.createElement('div');
                        navigationContainer.style.cssText = `
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #e2e8f0;
                        `;
                        
                        // 后退按钮
                        const prevBtn = document.createElement('button');
                        prevBtn.textContent = '上一步';
                        prevBtn.style.cssText = `
                            padding: 12px 20px;
                            background: ${currentQuestionIndex > 0 ? '#f1f5f9' : '#e2e8f0'};
                            color: ${currentQuestionIndex > 0 ? '#475569' : '#94a3b8'};
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: ${currentQuestionIndex > 0 ? 'pointer' : 'not-allowed'};
                            transition: all 0.2s;
                        `;
                        prevBtn.onclick = () => {
                            if (currentQuestionIndex > 0) {
                                currentQuestionIndex--;
                                renderFormFill();
                            }
                        };
                        
                        // 下一步或提交按钮
                        const nextBtn = document.createElement('button');
                        nextBtn.textContent = currentQuestionIndex === visibleComponents.length - 1 ? '提交表单' : '下一步';
                        nextBtn.style.cssText = `
                            padding: 12px 24px;
                            background: ${currentQuestionIndex === visibleComponents.length - 1 ? '#2563eb' : '#3b82f6'};
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: all 0.2s;
                        `;
                        nextBtn.onmouseover = () => {
                            nextBtn.style.transform = 'translateY(-1px)';
                            nextBtn.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                        };
                        nextBtn.onmouseout = () => {
                            nextBtn.style.transform = 'translateY(0)';
                            nextBtn.style.boxShadow = 'none';
                        };
                        nextBtn.onclick = () => {
                            if (currentQuestionIndex === visibleComponents.length - 1) {
                                submitForm();
                            } else {
                                currentQuestionIndex++;
                                renderFormFill();
                            }
                        };
                        
                        navigationContainer.appendChild(prevBtn);
                        navigationContainer.appendChild(nextBtn);
                        formContainer.appendChild(navigationContainer);
                    } else {
                        formContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #64748b;"><div style="font-size: 32px; margin-bottom: 12px;">📝</div><p style="font-size: 16px;">表单无可用字段</p></div>';
                    }
                    
                    mainContainer.appendChild(formContainer);
                    document.body.appendChild(mainContainer);
                    
                    // 绑定返回按钮事件
                    const backBtn = document.getElementById('backBtn');
                    if (backBtn) {
                        backBtn.onclick = renderFormList;
                    }
                }
                
                // 提交表单
                function submitForm() {
                    console.log('提交表单:', formValues);
                    
                    // 验证必填字段
                    const visibleComponents = selectedForm.components ? selectedForm.components.filter(c => !c.hidden) : [];
                    const missingFields = [];
                    
                    visibleComponents.forEach(component => {
                        if (component.required && !formValues[component.id]) {
                            missingFields.push(component.title);
                        }
                    });
                    
                    if (missingFields.length > 0) {
                        alert(`请填写必填字段：${missingFields.join('、')}`);
                        return;
                    }
                    
                    // 模拟提交
                    LoadingManager.show('提交中...');
                    
                    setTimeout(() => {
                        LoadingManager.hide();
                        
                        // 显示提交成功页面
                        mainContainer.innerHTML = '';
                        
                        const successContainer = document.createElement('div');
                        successContainer.style.cssText = `
                            background: white;
                            padding: 40px;
                            border-radius: 12px;
                            text-align: center;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                            border: 1px solid #e2e8f0;
                        `;
                        
                        successContainer.innerHTML = `
                            <div style="font-size: 64px; margin-bottom: 20px;">✅</div>
                            <h2 style="color: #16a34a; margin: 0 0 16px 0;">提交成功！</h2>
                            <p style="color: #64748b; margin: 0 0 32px 0;">感谢您的反馈，我们会尽快处理您的信息。</p>
                            <button id="backToListBtn" style="
                                background: #2563eb;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 8px;
                                font-size: 14px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.2s;
                            ">返回表单列表</button>
                        `;
                        
                        mainContainer.appendChild(successContainer);
                        document.body.appendChild(mainContainer);
                        
                        // 绑定返回按钮事件
                        const backToListBtn = document.getElementById('backToListBtn');
                        if (backToListBtn) {
                            backToListBtn.onclick = renderFormList;
                        }
                    }, 1500);
                }
                
                // 打开AI识别模态框
                function openAiRecognitionModal() {
                    // 模拟AI识别功能
                    alert('AI识别功能开发中，敬请期待！');
                }
                
                // 初始渲染表单列表
                renderFormList();
                
            } catch (error) {
                console.error('处理扫码数据失败:', error);
                document.body.innerHTML = `
                    <div style="max-width: 600px; margin: 40px auto; padding: 20px; text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                        <h2 style="color: #dc2626; margin: 0 0 16px 0;">数据解析失败</h2>
                        <p style="color: #64748b; margin: 0;">无法解析扫码数据，请重试。</p>
                    </div>
                `;
            }
        });
    }
})();

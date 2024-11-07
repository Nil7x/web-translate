// 创建翻译弹窗
const createTranslatePopup = () => {
    const popup = document.createElement('div');
    popup.id = 'translate-popup';
    popup.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, .2);
    display: none;
    z-index: 9;
    `;
    document.body.appendChild(popup);
    return popup;
}

// 初始化划词功能
const initializeSelection = () => {
    const popup = createTranslatePopup();

    document.addEventListener('mouseup', async (e) => {
        const selectedText = window.getSelection().toString().trim();

        if (!selectedText) {
            popup.style.display = 'none';
            return;
        }

        // 获取选中的文本位置
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 显示弹窗
        popup.style.display = 'block';
        popup.style.left = `${rect.left + window.scrollX}px`;
        popup.style.top = `${rect.bottom + window.scrollY + 10}px`;

        // 显示加载状态
        popup.innerHTML = `翻译中...`;

        try {
            // 发送消息给 background script 请求翻译
            const response = await chrome.runtime.sendMessage({
                type: 'translate',
                text: selectedText
            })

            // 显示翻译结果
            popup.innerHTML = `
            <div class="translate-result">
                <div class="word">${selectedText}</div>
                <div class="meaning">${response.translation}</div>
                <button class="save-btn">添加到单词本</button>
            </div>
            `;

            // 添加保存按钮事件
            const saveBtn = popup.querySelector('.save-btn');
            saveBtn.addEventListener('click', ()=> {
                chrome.runtime.sendMessage({
                    type: 'SAVE_WORD',
                    word: {
                        text: selectedText,
                        transaction: response.translation,
                        timestamp: new Date().toISOString()
                    }
                });
                popup.style.display = `none`;
            })
        } catch (error) {
            popup.innerHTML = `翻译失败${error}`
        }
    });
}

initializeSelection();
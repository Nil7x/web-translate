// 处理来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type === 'TRANSLATE') {
        handleTranslation(message.text)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message}));
        return true;
    }


})

// 翻译功能
async function handleTranslation(text) {
    try {
        const response = await fetch(`https://openapi.youdao.com/api`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                target: 'zh'
            })
        });

        const data = await response.json();
        return {
            translation: data.translation,
            success: data.success
        }
    }catch (error) {
        console.error('translation error: ', error);
        throw new Error(error);
    }
}

// 保存单词
async function saveWorld(word) {
    try {
        const words = await chrome.storage.local.get('words') || { words: []};
        words.push(word);
        await chrome.storage.local.set({words});
        return {success: true};
    } catch (error) {
        console.error('saveWorld error: ', error);
        throw new Error('保存失败');
    }
}
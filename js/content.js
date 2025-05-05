// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveContent') {
        // 获取页面标题作为文件名
        const title = document.title;
        // 获取页面主要内容
        const content = document.body.innerText;
        
        // 发送给background.js处理保存
        chrome.runtime.sendMessage({
            action: 'saveToFile',
            title: title,
            content: content
        });
    }
});
// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveToFile') {
        // 获取保存路径
        chrome.storage.sync.get(['savePath'], (result) => {
            const path = result.savePath || 'C:\\Downloads';
            // 这里需要实现实际的文件保存逻辑
            console.log(`将保存文件到: ${path}`);
            console.log(`文件名: ${request.title}.txt`);
            console.log(`内容长度: ${request.content.length}`);
        });
    }
});
// background.js

/**
 * 监听插件安装或更新事件
 * @param {object} details - 事件详情
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details);
  // 初始化默认配置
  chrome.storage.sync.get('savePath', (data) => {
    if (!data.savePath) {
      // 如果没有设置保存路径，可以设置一个默认值，或者留空让用户在配置页设置
      // chrome.storage.sync.set({ savePath: 'Downloads/SavedMediumArticles' });
      console.log('Save path not set. Please configure it in the options page.');
    }
  });
});

/**
 * 监听来自 content script 或 popup 的消息
 * @param {object} request - 请求对象
 * @param {object} sender - 发送者信息
 * @param {function} sendResponse - 发送响应的回调函数
 * @returns {boolean} - 返回 true 以表明是异步响应
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === 'saveToFile') {
    chrome.storage.sync.get('savePath', (data) => {
      const savePath = data.savePath || 'SavedMediumArticles'; // 使用默认路径或配置路径
      const filename = `${savePath}/${request.title.replace(/[^a-z0-9\.\-\_]/gi, '_')}.txt`;

      // 使用 chrome.downloads API 保存文件
      // 注意：直接写入本地文件系统需要 Native Messaging Host，比较复杂
      // 使用 downloads API 是更常见的 Chrome 插件文件保存方式
      try {
        const blob = new Blob([request.content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        chrome.downloads.download({
          url: url,
          filename: filename,
          saveAs: false // true 会弹出另存为对话框，false 直接下载到默认或指定目录
        }, (downloadId) => {
          if (chrome.runtime.lastError) {
            console.error('Download failed:', chrome.runtime.lastError);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else {
            console.log('File saved successfully with download ID:', downloadId);
            // 释放 Object URL
            URL.revokeObjectURL(url);
            sendResponse({ success: true });
          }
        });
      } catch (e) {
        console.error('Error creating blob or downloading:', e);
        sendResponse({ success: false, error: e.message });
      }
    });
    return true; // 表明是异步响应
  }
});
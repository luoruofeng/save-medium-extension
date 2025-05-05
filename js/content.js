// js/content.js

/**
 * 监听来自 popup 或 background 的消息
 * @param {object} request - 请求对象
 * @param {object} sender - 发送者信息
 * @param {function} sendResponse - 发送响应的回调函数
 * @returns {boolean} - 返回 true 以表明是异步响应
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  if (request.action === 'getContent') {
    try {
      // --- 修改后的标题和内容提取逻辑 ---
      // 尝试使用基于 class, data-testid, data-selectable-paragraph (排除 id) 的更精确选择器获取标题
      const titleMarkElement = document.querySelector('h1.pw-post-title[data-testid="storyTitle"][data-selectable-paragraph] mark');
      let title = 'Untitled'; // 默认标题
      if (titleMarkElement) {
        title = titleMarkElement.innerText.trim();
      } else {
        // 如果特定选择器找不到，回退到查找第一个 h1
        const genericTitleElement = document.querySelector('h1');
        if (genericTitleElement) {
          title = genericTitleElement.innerText.trim();
        }
      }

      // 获取文章内容
      const specificContentSelector = '#root > div > div.l.c > div.ab > div.bz.bg > div > div.gq.gr.gs.gt.gu.l > article > div > div > section > div > div.gp.io.ia.ip.iq > div.ab.ca > div.ch.bg.gv.gw.gx.gy';
      let contentElement = document.querySelector(specificContentSelector);
      let contentText = 'No content found.'; // 默认内容

      if (contentElement) {
        // 如果找到特定选择器对应的元素，获取其所有文本内容
        contentText = contentElement.innerText.trim();
      } else {
        // 如果特定选择器找不到，回退到查找 article, main, 或 body
        contentElement = document.querySelector('article') || document.querySelector('main') || document.body;
        if (contentElement) {
          // 获取回退元素的文本内容
          contentText = contentElement.innerText.trim();
        }
      }
      // --- 修改后的逻辑结束 ---

      console.log('Extracted Title:', title);
      console.log('Extracted Content Length:', contentText.length);

      sendResponse({ success: true, title: title, content: contentText });
    } catch (error) {
      console.error('Error extracting content:', error);
      sendResponse({ success: false, error: error.message });
    }
    // 注意：这里不返回 true，因为 sendResponse 是同步调用的
  }
});

console.log('Content script loaded.');
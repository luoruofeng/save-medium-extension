// js/popup.js

document.addEventListener('DOMContentLoaded', () => {
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  /**
   * 给保存按钮添加点击事件监听器
   */
  saveButton.addEventListener('click', () => {
    // 按钮点击动画
    anime({
      targets: saveButton,
      scale: [1, 0.9, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });

    statusDiv.textContent = 'Processing...';
    statusDiv.className = 'mt-2 text-info';

    // 向 content script 发送消息，请求获取页面内容
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getContent' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message to content script:', chrome.runtime.lastError);
          statusDiv.textContent = 'Error: Could not communicate with the page. Try reloading the page.';
          statusDiv.className = 'mt-2 text-danger';
          return;
        }

        if (response && response.title && response.content) {
          // 获取到内容后，发送消息给 background script 保存文件
          chrome.runtime.sendMessage({ action: 'saveToFile', title: response.title, content: response.content }, (saveResponse) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message to background script:', chrome.runtime.lastError);
              statusDiv.textContent = 'Error saving file: ' + chrome.runtime.lastError.message;
              statusDiv.className = 'mt-2 text-danger';
            } else if (saveResponse && saveResponse.success) {
              statusDiv.textContent = 'Content saved successfully!';
              statusDiv.className = 'mt-2 text-success';
              // 成功动画
              anime({
                targets: statusDiv,
                opacity: [0, 1],
                translateY: [-10, 0],
                duration: 500,
                easing: 'easeOutExpo'
              });
            } else {
              statusDiv.textContent = 'Error saving file: ' + (saveResponse ? saveResponse.error : 'Unknown error');
              statusDiv.className = 'mt-2 text-danger';
            }
          });
        } else {
          statusDiv.textContent = 'Error: Could not get content from the page. ' + (response ? response.error : 'No response');
          statusDiv.className = 'mt-2 text-danger';
        }
      });
    });
  });
});
// js/options.js

document.addEventListener('DOMContentLoaded', () => {
  const savePathInput = document.getElementById('savePathInput');
  const saveButton = document.getElementById('saveButton');
  const statusDiv = document.getElementById('status');

  /**
   * 加载已保存的设置
   */
  function loadOptions() {
    chrome.storage.sync.get('savePath', (data) => {
      if (data.savePath) {
        savePathInput.value = data.savePath;
      }
    });
  }

  /**
   * 保存设置
   */
  function saveOptions() {
    const savePath = savePathInput.value.trim();

    // 按钮动画
    anime({
      targets: saveButton,
      scale: [1, 0.9, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });

    chrome.storage.sync.set({ savePath: savePath }, () => {
      // 显示保存成功的消息
      statusDiv.textContent = 'Settings saved successfully!';
      statusDiv.className = 'mt-2 text-success';

      // 成功消息动画
      anime({
        targets: statusDiv,
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 500,
        easing: 'easeOutExpo',
        complete: () => {
          // 动画完成后 2 秒淡出消息
          setTimeout(() => {
            anime({
              targets: statusDiv,
              opacity: 0,
              duration: 500,
              easing: 'easeOutExpo',
              complete: () => { statusDiv.textContent = ''; } // 清空文本
            });
          }, 2000);
        }
      });

      console.log('Save path set to:', savePath);
    });
  }

  // 页面加载时加载设置
  loadOptions();

  // 给保存按钮添加点击事件监听器
  saveButton.addEventListener('click', saveOptions);
});
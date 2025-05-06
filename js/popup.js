// 获取保存按钮和配置按钮
const saveBtn = document.getElementById('saveBtn');
const configBtn = document.getElementById('configBtn');
const popupCountdown = document.getElementById('popupCountdown');

// 保存按钮点击处理
saveBtn.addEventListener('click', async () => {
  // 禁用按钮并添加样式
  saveBtn.disabled = true;
  saveBtn.classList.add('disabled');
  
  // 显示全屏倒计时容器
  popupCountdown.style.display = 'flex';
  
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'saveHTML'});
  });
  
  // 操作完成后恢复按钮状态
  saveBtn.disabled = false;
  saveBtn.classList.remove('disabled');
  popupCountdown.style.display = 'none';
});

// 配置按钮点击处理
configBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 移除所有 script 标签
document.querySelectorAll('script').forEach(el => el.remove());
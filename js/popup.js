// 获取保存按钮和配置按钮
const saveBtn = document.getElementById('saveBtn');
const popupCountdown = document.getElementById('popupCountdown');
const configBtn = document.getElementById('configBtn');
const configForm = document.getElementById('configForm');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const openaiUrlInput = document.getElementById('openaiUrl');
const openaiKeyInput = document.getElementById('openaiKey');
const openaiModelInput = document.getElementById('openaiModel');

// 配置按钮点击显示/隐藏表单
configBtn.addEventListener('click', () => {
  configForm.style.display = configForm.style.display === 'none' ? 'block' : 'none';
});

// 展示url、key、model内容
function showConfigInfo(url, key, model) {
  const configShow = document.getElementById('configShow');
  if (url && key && model) {
    configShow.innerText = `URL: ${url}\nKEY: ${key}\nMODEL: ${model}`;
  } else {
    configShow.innerText = '';
  }
}

// 打开popup时自动填充配置并展示
chrome.storage.sync.get(['openaiUrl', 'openaiKey', 'openaiModel'], (result) => {
  if (result.openaiUrl) {
    openaiUrlInput.value = result.openaiUrl;
  } else {
    openaiUrlInput.value = '@https://dashscope.aliyuncs.com/compatible-mode/v1/';
  }
  if (result.openaiKey) openaiKeyInput.value = result.openaiKey;
  if (result.openaiModel) openaiModelInput.value = result.openaiModel;
  showConfigInfo(openaiUrlInput.value, openaiKeyInput.value, openaiModelInput.value || 'qwen-max-latest');
});

// 保存配置
saveConfigBtn.addEventListener('click', () => {
  const url = openaiUrlInput.value.trim();
  const key = openaiKeyInput.value.trim();
  const model = openaiModelInput.value.trim() || 'qwen-max-latest';
  if (!url || !key) {
    alert('请填写完整的URL和KEY');
    return;
  }
  chrome.storage.sync.set({ openaiUrl: url, openaiKey: key, openaiModel: model }, () => {
    alert('配置已保存');
    configForm.style.display = 'none';
    showConfigInfo(url, key, model);
  });
});

// 保存按钮点击处理
saveBtn.addEventListener('click', async () => {
  // 禁用所有按钮并显示蒙版
  document.querySelectorAll('button').forEach(btn => btn.disabled = true);
  document.getElementById('popupMask').style.display = 'flex';
  document.getElementById('saveStatus').innerText = '';
  // 校验配置
  chrome.storage.sync.get(['openaiUrl', 'openaiKey', 'openaiModel'], (result) => {
    if (!result.openaiUrl || !result.openaiKey) {
      alert('请先设置OpenAI API的URL和KEY 123');
      configForm.style.display = 'block';
      // 恢复按钮和蒙版
      document.querySelectorAll('button').forEach(btn => btn.disabled = false);
      document.getElementById('popupMask').style.display = 'none';
      return;
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'saveHTML'}, (resp) => {
        // 操作完成后恢复按钮和蒙版
        document.querySelectorAll('button').forEach(btn => btn.disabled = false);
        document.getElementById('popupMask').style.display = 'none';
        // 判断resp是否有错误
        if(resp && resp.error) {
          document.getElementById('saveStatus').innerText = `下载失败，错误原因为：${resp.error}`;
        } else if(resp && resp.filePath) {
          document.getElementById('saveStatus').innerText = `下载成功，文件保存到了：${resp.filePath}`;
        } else if(resp === undefined) {
          document.getElementById('saveStatus').innerText = '下载失败，未收到响应。';
        } else {
          document.getElementById('saveStatus').innerText = '下载成功';
        }
      });
    });
  });
});

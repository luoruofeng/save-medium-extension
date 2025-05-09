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
// 修改配置保存时的显示逻辑
document.getElementById('saveConfigBtn').addEventListener('click', () => {
    const openaiUrl = document.getElementById('openaiUrl').value;
    const openaiKey = document.getElementById('openaiKey').value;
    const openaiModel = document.getElementById('openaiModel').value;
    const translateToChinese = document.getElementById('translateToChinese').checked;
    const afterPrompt = document.getElementById('afterPrompt').value;
    chrome.storage.sync.set({ 
        openaiUrl,
        openaiKey,
        openaiModel,
        translateToChinese,
        afterPrompt  // 新增参数存储
    }, () => {
        document.getElementById('configShow').innerHTML = 
            `当前配置：<br>
            API地址：${openaiUrl}<br>
            模型：${openaiModel}<br>
            翻译中文：${translateToChinese ? '是' : '否'}<br>
            后操作指令：${afterPrompt || '未设置'}`; 
            
        // 隐藏配置表单
        document.getElementById('configForm').style.display = 'none';
    });
});

// 修改配置加载时的显示初始化
// 修改配置加载函数
function loadConfig() {
    chrome.storage.sync.get(['openaiUrl', 'openaiKey', 'openaiModel', 'translateToChinese', 'afterPrompt'], (result) => {
        document.getElementById('translateToChinese').checked = result.translateToChinese || false;
        document.getElementById('afterPrompt').value = result.afterPrompt || '';
        // 初始化配置显示
        document.getElementById('configShow').innerHTML = 
            `当前配置状态：<br>
            翻译中文：${result.translateToChinese ? '✅已启用' : '❌未启用'}<br>
            后处理指令：${result.afterPrompt ? '✅已设置' : '❌未设置'}`;
    });
}

// 在DOM加载完成后立即执行初始化
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    // 保持原有的配置加载逻辑...
});

// 修改配置保存回调
document.getElementById('saveConfigBtn').addEventListener('click', () => {
    const openaiUrl = document.getElementById('openaiUrl').value;
    const openaiKey = document.getElementById('openaiKey').value;
    const openaiModel = document.getElementById('openaiModel').value;
    const translateToChinese = document.getElementById('translateToChinese').checked;
    const afterPrompt = document.getElementById('afterPrompt').value;
    chrome.storage.sync.set({ 
        openaiUrl,
        openaiKey,
        openaiModel,
        translateToChinese,
        afterPrompt
    }, () => {
        // 更新显示最新状态
        document.getElementById('configShow').innerHTML = 
            `当前配置状态：<br>
            翻译中文：${translateToChinese ? '✅已启用' : '❌未启用'}<br>
            后处理指令：${afterPrompt ? '✅已设置' : '❌未设置'}`;
        // 隐藏配置表单
        document.getElementById('configForm').style.display = 'none';
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

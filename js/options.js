// 加载保存的路径
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['savePath'], (result) => {
        document.getElementById('savePath').value = result.savePath || '';
    });
});

// 保存路径设置
document.getElementById('saveBtn').addEventListener('click', () => {
    const path = document.getElementById('savePath').value;
    chrome.storage.sync.set({savePath: path}, () => {
        alert('设置已保存');
    });
});
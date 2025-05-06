// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveHTML') {
        // 1. 页面右下角显示倒计时浮窗
        let floatDiv = document.createElement('div');
        floatDiv.id = 'save-html-countdown-float';
        floatDiv.style.cssText = 'position:fixed;right:30px;bottom:30px;z-index:99999;background:rgba(0,0,0,0.7);color:#fff;padding:12px 20px;border-radius:8px;font-size:18px;';
        document.body.appendChild(floatDiv);

        let seconds = 4;
        floatDiv.textContent = `休眠${seconds}秒...`;
        let timer = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                floatDiv.textContent = `休眠${seconds}秒...`;
            } else {
                floatDiv.textContent = '正在保存...';
                clearInterval(timer);
            }
        }, 1000);

        setTimeout(() => {
            // 2. 获取页面内容并去除所有标签属性
            let html = document.body.innerHTML;
            // 用正则去除所有标签属性（只保留标签名）
            html = html.replace(/<([a-zA-Z0-9-]+)[^>]*>/g, '<$1>');

            // 清理HTML中的脚本和SVG标签
            function cleanHTML(html) {
              // 使用正则表达式删除<script>标签及其内容
              html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
              // 使用正则表达式删除<svg>标签及其内容
              html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
              return html;
            }

            // 3. 生成文件名
            const now = new Date();
            const fileName = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}.txt`;

            chrome.storage.sync.get(['savePath'], (result) => {
                const savePath = result.savePath || '';
                const fullPath = savePath ? `${savePath}/${fileName}` : fileName;
                const blob = new Blob([html], {type: 'text/plain;charset=utf-8'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fullPath;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // 4. 移除倒计时浮窗
                if (floatDiv) floatDiv.remove();

                // 5. 通知popup保存完成
                if (sendResponse) sendResponse();
            });
        }, 4000);
        return true; // 允许异步回调
    }
});
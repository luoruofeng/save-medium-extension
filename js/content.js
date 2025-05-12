// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveHTML') {
        // 1. 页面右下角显示倒计时浮窗
        let floatDiv = document.createElement('div');
        floatDiv.id = 'save-html-countdown-float';
        floatDiv.style.cssText = 'position:fixed;right:30px;bottom:30px;z-index:99999;background:rgba(0,0,0,0.7);color:#fff;padding:12px 20px;border-radius:8px;font-size:18px;';
        document.body.appendChild(floatDiv);

        let seconds = 2;
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
                html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');// 使用正则表达式删除<script>标签及其内容
                html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');// 使用正则表达式删除<svg>标签及其内容
                html = html.replace(/<(\w+)[^>]*>\s*<\/\1>|<(\w+)[^>]*\/>/gi, '');
                html = html.replace(/<[^>]+>/g, '');
                html = html.replace(/^\s*[\r\n]/gm, '');
                
                return html;
            }
            html = cleanHTML(html)
            
            // 设置OpenAI API参数的方法
            window.setOpenAIConfig = function(url, key, model,translateToChinese,afterPrompt) {
                // 新增配置参数日志
                console.log("[配置参数] URL:", url, "Model:", model, "翻译:", translateToChinese, "后操作提示:", afterPrompt);
                // 如果${baseURL}是"/"结尾则去掉
                if (url.endsWith("/")) {
                    url = url.slice(0, -1); // 去掉最后一个字符
                    console.log(`将${url} 改为 ${url}`)
                }
                window.OPENAI_API_URL = url;
                window.OPENAI_API_KEY = key;
                window.OPENAI_API_MODEL = model;
                window.OPENAI_API_TRANSLATE_TO_CHINESE = translateToChinese;
                window.OPENAI_API_AFTER_PROMPT = afterPrompt;
                console.log("设置OpenAI API参数:"+window.OPENAI_API_URL, window.OPENAI_API_KEY, window.OPENAI_API_MODEL, window.OPENAI_API_TRANSLATE_TO_CHINESE)
            }


            // 调用 DashScope 兼容 OpenAI API 的方法
            async function askOpenAI(question) {
                console.log("调用DashScope API")
                console.log(question)
                console.log(window.OPENAI_API_URL, window.OPENAI_API_KEY, window.OPENAI_API_MODEL)

                
                if(!window.OPENAI_API_URL || !window.OPENAI_API_KEY || !window.OPENAI_API_MODEL) {
                    console.error("OpenAI API参数未设置")
                    return '';
                }
                try {
                    const apiKey = window.OPENAI_API_KEY;
                    const baseURL = window.OPENAI_API_URL;
                    const model = window.OPENAI_API_MODEL;
                    const response = await fetch(`${baseURL}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [
                                { role: "system", content: "你是一个有用的助手。" },
                                { role: "user", content: question }
                            ]
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
                    }

                    const data = await response.json();
                    console.log(data.choices[0].message.content);
                    return data.choices[0].message.content;
                } catch (error) {
                    console.error('调用API时出错:' ,error);
                    alert(`请求失败: ${error.message}`);
                    return '';
                }
            }

            // 用于同步等待OpenAI API的辅助函数
            function askOpenAISync(question) {
                return new Promise((resolve) => {
                    askOpenAI(question).then(res => resolve(res));
                });
            }

            // 调用OpenAI API处理内容
            (async () => {
                try {
                    const result = await getStorageSync(['openaiUrl', 'openaiKey', 'openaiModel', 'translateToChinese', 'afterPrompt']);
                    window.setOpenAIConfig(
                        result.openaiUrl, 
                        result.openaiKey, 
                        result.openaiModel, 
                        result.translateToChinese || false,
                        result.afterPrompt || ''
                    );

                    const prompt = '根据文章语义将下面文章中的无效和错误内容去掉，返回正确内容，不要返回其他任何信息：' + html;
                    html = await askOpenAISync(prompt);

                    // 翻译逻辑
                    if(window.OPENAI_API_TRANSLATE_TO_CHINESE) {
                        const translatePrompt = '将下面文章翻译为中文：' + html;
                        html = await askOpenAISync(translatePrompt);
                    }
                    
                    
                    // 提取文件名和内容（保持原有逻辑）
                    // 3. 提取第一句话作为文件名和标题，并删除第一句话
                    let firstSentence = '';
                    let restContent = '';
                    // 匹配第一个段落（以两个换行符为分隔）
                    const match = html.match(/^([^\n\r]+)([\n\r]+|$)/);
                    if (match) {
                        firstSentence = match[1].trim();
                        restContent = html.slice(match[0].length).trim();
                    } else {
                        firstSentence = html.trim();
                        restContent = '';
                    }
                    restContent = firstSentence +"\n"+ restContent // 后面的内容第一行还是标题
                    const fileName = firstSentence + '.txt';
                    // 后处理逻辑（新增）
                    if(window.OPENAI_API_AFTER_PROMPT) {
                        const afterPrompt = `${window.OPENAI_API_AFTER_PROMPT}:\n\n${restContent}`;
                        restContent = await askOpenAISync(afterPrompt);
                    }
                    const restContentLength = restContent.length;  // 新增变量获取内容长度
                    console.log(`[文件操作] 生成文件名: ${fileName} 内容长度: ${restContentLength}`);  // 移动到此处

                    const fullPath = fileName;
                    const blob = new Blob([restContent], {type: 'text/plain;charset=utf-8'});
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fullPath;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    // 4. 更新浮窗显示结果（移除浮窗移除代码）
                    // 修改成功后的浮窗处理逻辑（移除自动渐隐）
                    if (floatDiv) {
                        floatDiv.textContent = `保存成功：${fullPath}`;
                        floatDiv.style.backgroundColor = '#4CAF50'; // 保持绿色背景
                        // 删除所有setTimeout调用
                    }
                    
                    // 修改失败后的浮窗处理逻辑（移除自动渐隐）
                    if (floatDiv) {
                        floatDiv.textContent = `保存失败：${e.message}`;
                        floatDiv.style.backgroundColor = '#ff4444'; 
                        // 删除所有setTimeout调用
                    }
                    
                    // 添加自动渐隐效果
                    setTimeout(() => {
                        floatDiv.style.opacity = '0';
                        setTimeout(() => floatDiv.remove(), 1000);
                    }, 5000);
                    
                    // 5. 通知popup保存完成，返回文件路径
                    if (sendResponse) sendResponse({filePath: fullPath});
                } catch (e) {
                    if (floatDiv) {
                        floatDiv.textContent = `保存失败：${e.message}`; // 显示错误信息
                        floatDiv.style.backgroundColor = '#ff4444'; // 改为红色背景
                        // 添加自动渐隐效果
                        setTimeout(() => {
                            floatDiv.style.opacity = '0';
                            setTimeout(() => floatDiv.remove(), 1000);
                        }, 5000);
                    }
                    if (sendResponse) sendResponse({error: e.message || String(e)});
                }
            })();
        }, 2000);
        return true; // 允许异步回调
    }
});

function getStorageSync(keys) {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, (result) => {
            resolve(result);
        });
    });
}

async function demo() {
    const result = await getStorageSync(['key']);
    console.log(result);
    // 这里的代码会等到 getStorageSync 完成后再执行
}
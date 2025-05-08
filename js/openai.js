// dashscope-api.js
class OpenAIAPI {
    constructor(config = {}) {
      this.baseURL = config.baseURL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
      this.apiKey = config.apiKey || "";
      this.defaultModel = config.defaultModel || "qwen-plus";
    }
  
    setConfig({ baseURL, apiKey, model }) {
      if (baseURL) this.baseURL = baseURL;
      if (apiKey) this.apiKey = apiKey;
      if (model) this.defaultModel = model;
    }
  
    async call(messages, model) {
      if (!this.apiKey) {
        throw new Error("API Key未设置");
      }
  
      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: model || this.defaultModel,
            messages: messages
          })
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('调用API时出错:', error);
        throw error;
      }
    }
  
    async simpleCall(userMessage, systemMessage = "You are a helpful assistant.", model) {
      return this.call([
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ], model);
    }
  }
  
  // 导出实例和类
  const dashScopeAPI = new OpenAIAPI();
  export { dashScopeAPI, OpenAIAPI as DashScopeAPI };
  
  // 使用示例
  // 1. 设置配置
  dashScopeAPI.setConfig({
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "",
    defaultModel: "qwen-max-latest"
  });
  
  // 2. 调用API
  (async () => {
    try {
      const response = await dashScopeAPI.simpleCall("你是谁？");
      console.log(response);
    } catch (error) {
      console.error("API调用失败:", error);
    }
  })();
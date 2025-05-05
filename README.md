# Save Medium Extension

一个Chrome浏览器扩展，用于将网页内容保存为TXT文件。

## 功能特点

- 一键保存网页指定部分内容为TXT文件
- 自定义保存路径配置
- 美观的用户界面，使用Bootstrap和anime.js
- 支持UTF-8编码保存文本

## 安装方法

1. 下载此仓库的代码
2. 打开Chrome浏览器，进入扩展管理页面 (chrome://extensions/)
3. 开启开发者模式
4. 点击"加载已解压的扩展程序"按钮
5. 选择项目文件夹

## 使用方法

1. 点击浏览器工具栏中的扩展图标
2. 在弹出窗口中点击"保存内容"按钮
3. 扩展会自动提取页面标题和内容，并保存为TXT文件

## 配置选项

1. 右键点击扩展图标，选择"选项"
2. 在选项页面中，可以设置TXT文件的保存路径

## 技术栈

- Chrome 插件 API
- JavaScript
- HTML
- CSS
- Bootstrap 5
- anime.js

## 项目结构

```
├── css/                  # 样式文件
│   ├── options.css       # 选项页面样式
│   └── popup.css         # 弹出窗口样式
├── images/               # 图标和图片资源
│   ├── icon16.png        # 16x16 图标
│   ├── icon48.png        # 48x48 图标
│   └── icon128.png       # 128x128 图标
├── js/                   # JavaScript 文件
│   ├── background.js     # 后台脚本
│   ├── content.js        # 内容脚本
│   ├── options.js        # 选项页面脚本
│   └── popup.js          # 弹出窗口脚本
├── manifest.json         # 扩展清单文件
├── options.html          # 选项页面
└── popup.html            # 弹出窗口
```

## 许可证

MIT
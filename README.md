# 相册管理系统

基于 uni-app 开发的跨平台相册管理系统，支持多端运行，提供完整的相册管理功能。

> [前往后端](https://github.com/lemon-puls/txing-oj-backend)

> [前往 Web 端](https://github.com/lemon-puls/ws-home)

## ✨ 特性

- 📱 跨平台支持：一套代码，同时运行在 iOS、Android、H5、以及各种小程序平台
- 🎨 现代化 UI：采用 wot-design-uni 组件库，提供美观的用户界面
- 🔒 数据安全：支持本地存储和云端同步，确保数据安全
- 🚀 高性能：基于 Vue 3 + TypeScript 开发，提供流畅的用户体验
- 📦 模块化：采用组件化开发，代码结构清晰，易于维护
- 🌈 主题定制：支持自定义主题，满足个性化需求

## 📸 小程序演示

|                      首页                      |                      登录页                      |                      相册列表                      |
| :--------------------------------------------: | :----------------------------------------------: | :------------------------------------------------: |
| <img src="static/imgs/首页.png" width="200" /> | <img src="static/imgs/登录页.png" width="200" /> | <img src="static/imgs/相册列表.png" width="200" /> |

|                      相册详情                      |                      统计数据                      |
| :------------------------------------------------: | :------------------------------------------------: |
| <img src="static/imgs/相册详情.png" width="200" /> | <img src="static/imgs/统计数据.png" width="200" /> |

## 🛠️ 技术栈

- 框架：Vue 3 + TypeScript
- 跨端框架：uni-app
- 状态管理：Pinia
- UI 组件：wot-design-uni
- 构建工具：Vite
- 代码规范：ESLint + Prettier
- 包管理器：pnpm

## 📦 安装

```bash
# 1. 克隆项目
git clone git@github.com:lemon-puls/ws-home.uniapp.git

# 2. 进入项目目录
cd ws-home.uniapp

# 3. 安装依赖
pnpm install

# 4. 复制一份配置文件目录 env.sample 为 env 修改其中的配置，一般主要需要修改 .env 文件中 VITE_SERVER_BASEURL（后端请求地址） 配置即可，如果是小程序的话，注意要填写 appId

# 5. 启动（推荐直接使用 HBuilderX 运行或发布，会更方便）
pnpm dev:h5  # 开发 H5 版本
pnpm dev:mp-weixin  # 开发微信小程序版本
pnpm dev:app  # 开发 App 版本

pnpm build:h5  # 构建 H5 版本
pnpm build:mp-weixin  # 构建微信小程序版本
pnpm build:app  # 构建 App 版本
```

## 🚀 开发

步骤基本和【安装】的说明一致，需要特别说明的是，本项目接入了 openapi 用于直接根据后端接口文档生成 api 代码，极大程度上方便了在前端业务代码中对接口的调用。所以若设计到接口的改动，开发步骤如下：

1. 后端接口完成修改后，启动后端
2. 在前端运行以下命令生成 api 代码，生成的代码在 src/api 目录下

```bash
pnpm run generate:api
```

3. 修改 src/api/core/request.ts 文件，确保使用 uni.request 发请求

   由于上一步使用 openapi 生成的代码是使用 axios 发请求的，这在小程序等平台下使用是不兼容的，所以需要修改为使用 uni.request 发请求，当前项目中 src/api/core/request.ts 已经是修改好了的，重新生成代码后当前的 request.ts 会被覆盖，可以使用当前的再覆盖回去新生成的即可。

4. 更改 src/api/core/OpenAPI.ts 文件，确保配置文件中配置的接口 base url 生效

   需要把该文件中的 OpenAPI 对象的 BASE 字段留空，否则会覆盖掉 .env 文件中配置的接口地址。

## 📁 项目结构

```
├── src                    # 源代码目录
│   ├── api               # API 接口
│   ├── components        # 公共组件
│   ├── pages            # 页面文件
│   ├── static           # 静态资源
│   ├── store            # 状态管理
│   ├── utils            # 工具函数
│   └── style            # 全局样式
├── env.sample           # 环境变量示例
├── vite.config.ts       # Vite 配置
└── package.json         # 项目依赖
```

## 🔧 环境要求

- Node.js >= 18
- pnpm >= 7.30

## 📝 开发规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 和 Prettier 的代码规范
- 使用 Git Flow 工作流
- 遵循组件化开发原则

## 🤝 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feat/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feat/AmazingFeature`)
5. 开启一个 Pull Request

感谢所有为本项目做出贡献的开发者！

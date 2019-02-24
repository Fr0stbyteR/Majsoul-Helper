# 雀魂麻将牌效辅助 ![License](https://img.shields.io/github/license/Fr0stbyteR/majsoul-helper.svg)
> 使用天凤牌理规则，根据牌效将推荐的两枚切牌染色。

  ![Demo](./example.png)

> 挤房间功能

### 安装方法
- 安装油猴脚本 TamperMonkey 
- 导入 **main.js** 或打开 [此链接](https://greasyfork.org/zh-CN/scripts/378059-majsoul-helper) 安装脚本

### 使用方法
- 牌效染色默认开启

- 自动和了按钮默认开启

- 自动打牌功能

  如需开启电脑自动打牌，请打开控制台 (F12) 输入 `helper.auto = true;`

  若要关闭，输入 `helper.auto = false;`
- 高速加入房间功能

  如需高速加入房间（如房间 0000 ），请打开控制台 输入 `add = new AddRoom(0000).start();`

  停止加入，请输入 `add.stop();`

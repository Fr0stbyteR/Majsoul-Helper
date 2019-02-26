# 雀魂麻将牌效辅助 ![License](https://img.shields.io/github/license/Fr0stbyteR/majsoul-helper.svg)
- 感谢 [FlyingBamboo](https://github.com/FlyingBamboo) 的巨大贡献

> 使用天凤牌理规则，根据牌效将推荐的两枚切牌染色。(无视牌河)

> 挤房间功能

> 显示玩家段位

  ![Demo](./example1.png)
  ![Demo](./example2.png)

### 安装方法 - 浏览器
- 安装油猴脚本 TamperMonkey 
- 导入 **main.js** 或打开 [此链接](https://greasyfork.org/zh-CN/scripts/378059-majsoul-helper) 安装脚本

### 安装方法 - Majsoul Plus
- 在resources\app\execute中新建文件夹
- 将execute.json和main.js文件复制到该文件夹

### 使用方法
- 牌效染色默认开启

- 自动和了按钮默认开启

- 高速加入房间功能

  如需高速加入房间（如房间 0000 ），请打开控制台 输入 `add = new AddRoom(0000).start();`

  停止加入，请输入 `add.stop();`

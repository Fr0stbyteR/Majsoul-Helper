# 雀魂麻将牌效辅助 ![License](https://img.shields.io/github/license/Fr0stbyteR/majsoul-helper.svg)
感谢 [FlyingBamboo](https://github.com/FlyingBamboo) 的巨大贡献

1. 使用天凤牌理规则，根据牌效将推荐的切牌染色。

2. 使用 **main-river.js** 选牌时对河牌、副露牌进行染色，包括：

   - 别家，红：筋，蓝：现物，黄：壁；颜色越深越有用。

   - 自家，仅显示河牌和副露牌中的壁和现物

3. 摸切的河牌灰色提示

4. 挤房间功能

5. 显示玩家段位

  ![Demo](./example1.png)
  ![Demo](./example2.png)
  ![Demo](./example3.png)

### 安装方法 - 浏览器
- 安装油猴脚本 TamperMonkey 
- 导入 **main.js** 或 **main-river.js** (带牌河提示版本) 或打开 [此链接](https://greasyfork.org/scripts/378059-majsoul-helper) 或 [牌河提示版本](https://greasyfork.org/scripts/378321-majsoul-helper-river-indication) 安装脚本

### 安装方法 - Majsoul Plus
- 在 **resources\app\execute** 中新建文件夹
- 将 **execute.json** 、 **main.js** 和 **main-river.js** 文件复制到该文件夹
- 如需使用牌河提示版本，请修改 **execute.json** 中 **entry** 的键值为 **"main-river.js"**

### 使用方法
- 牌效染色默认开启

- 自动和了按钮默认开启

- 高速加入房间功能

  如需高速加入房间（如房间 0000 ），请打开控制台 输入 `add = new AddRoom(0000).start();`

  停止加入，请输入 `add.stop();`

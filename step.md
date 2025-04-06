# 1. 初始化

```
 yo code extensionProject
```

package.json 中配置发布者

```bash
"publisher": "lx815",
```

# 2. 编码

在`extension.js`中实现核心逻辑：

# 3. 调试

按下`F5`键，打开插件调试功能

# 4. 发布

```bash
vsce package
```

查询发布账号https://dev.azure.com/2192798424/_usersSettings/tokens

```bash
vsce login lx815
```

```bash
vsce publish
```

# 查看发布的插件

https://marketplace.visualstudio.com/manage/publishers/lx815

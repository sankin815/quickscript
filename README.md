# 一个快速执行 package.json 中 script 的插件

1. 进入一个文件，点击右上角 play 按钮，然后选择需要执行的 script

![1743934558692](images/README/1743934558692.png)

2. script 列表的来源是当前文件向上递归，找到最近的 package.json，然后取出其中的 name、scripts
3. 将 name+selectedScript 作为终端名称，如果已经存在了同名的终端，会将其关闭（防止终端中存在正在运行的任务，eg: webpack --watch），然后创建一个新的终端

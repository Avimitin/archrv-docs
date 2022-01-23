# 如何给 Arch 报 BUG

首先请通读这篇 wiki <https://wiki.archlinux.org/title/Bug_reporting_guidelines>。

然后搜索你要报 BUG 的包: <https://archlinux.org/packages/>，在详情页的右边有一个
Package Action 的小方框。点击其中第二行第一个 "Bug Reports"，看看有没有人已经提交
你遇到的 BUG。如果有就可以等着了。如果是急包的话你可以先自己动手修。

如果没有人提交过相似的 BUG，那么点击第二行第二个 "Add New Bug"，新的页面会生成好模板，
按照提示填写即可。左边的那些菜单项不用自己修改。

如果是普通的无法构建，SUMMARY 那一行填 FTBFS 即可，然后在底下描写遇到了什么错误。
报 BUG 的时候带上怎么修优先于自己在 RISCV 的仓库修。(在 Arch 报有效的 BUG 也算在工作量里的)

如果是 outdated 的包，不要报 BUG。在 Package Action 那一栏有 "Flag Package Out-of-Date" 的功能。

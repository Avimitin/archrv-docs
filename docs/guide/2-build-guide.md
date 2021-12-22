# 构建指引

我们的工作是把 https://archriscv.felixc.at/.status/status.htm
上的包都处理好。

在状态页里，有两种状态的包裹需要我们处理。

## FTBFS (Fail To Build From Source)

这个状态代表包无法构建，等待我们修复。基本流程如下：

1. 在 [archlinuxriscv](https://github.com/felixonmars/archriscv-packages)
repository 找这个包相关的 PR
2. 在 https://plct-archrv.ax64.workers.dev/
上查看这个包的状态（是否有人在处理了）
3. 使用命令 /add `{PKGNAME}` 领取这个包
4. 修复
5. 提交 PR 并等待合并
6. 使用命令 /merge `{PKGNAME}` 释放包裹

### Q&A

* 有的包有 FTBFS 状态，但是却能在本地成功构建

可能是版本更新之类的问题，使用机器人命令 /mark `PACKAGE ready`
标记这个包为等待状态。

* 修复了几次也修不好

/mark `PKGNAME stuck`

* 释放一个包裹

/merge `PKGNAME`

* 撤销标记

/unmark `PKGNAME` `STATUS`

* kbd:[/unmark] 用法：

/mark `pkg` `status`

* 什么时候标记 QEMU？

只有比如说测试跑不过，或者 qemu 神奇 bug 导致的，才标 #noqemu

* 什么时候标记 outdated_dep？

依赖（包）过期了，需要在repo里滚/上游滚。

* 可用的 status 包括

unknown, upstreamed, outdated, outdated_dep, stuck, noqemu, ready, pending

## Leaf package, port it!

这些是尚未来得及构建的包，你有空可以搞这些包。

如果能直接构建成功，回复 `PACKAGE NAME` 直接出包
到[这条消息上](https://t.me/c/1525629125/11840)。

如果构建失败，那么就把这个包当作 FTBFS 来修。

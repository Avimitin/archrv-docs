# 构建指引

我们的工作是把 https://archriscv.felixc.at/.status/status.htm
上的包都处理好。

在状态页里，有两种状态的包裹需要我们处理。

## FTBFS (Fail To Build From Source)

这个状态代表包无法构建，等待我们修复。基本流程如下：

1. 在 [archlinuxriscv](https://github.com/felixonmars/archriscv-packages)
repository 找这个包相关的 PR
2. 在工会页 https://plct-archrv.ax64.workers.dev/
上查看这个包的状态（是否有人在处理了）
3. 使用命令 /add `{PKGNAME}` 领取这个包
4. 修复
5. 提交 PR 并等待合并
6. 使用命令 /merge `{PKGNAME}` 释放包裹


### Q&A

* 修是怎么一个流程呢？

在 devtools 的打包教程里，你应该用过了 asp 这个工具。
修包的流程和那个流程相似，具体就是 `asp checkout`，进入 trunk 文件夹，
修改 PKGBUILD 或者源码尝试构建并运行。修好之后：把修好的源码发回上游/
把 PKGBUILD 的补丁发到肥猫仓库。

> Reference
>
> https://github.com/felixonmars/archriscv-packages/wiki/asp-%E4%BD%BF%E7%94%A8%E5%8F%82%E8%80%83

* 怎么构建 PKGBUILD 呢？

假设你要构建 `PACKAGE` 这个包，用 `asp checkout PACKAGE` 之后，当前目录
会有一个同名的文件夹。用 `cd PACKAGE/trunk` 进入文件夹之后，把 arch 修改成
riscv [`(ref)`](../record/collection#xx-is-not-available-for-the-riscv64-architecture)
之后，创建一个干净的文件夹，使用 extra-riscv64-build 进行构建。

```console title=console
# Create a temporary directory and add the path to variable BUILD_DIR
export BUILD_DIR=$(mktemp -d -t "pacman_cache_$(date +%m%d)_XXX")

# Use the temporary directory to store pacman cache
extra-riscv64-build -- -d "$BUILD_DIR:/var/cache/pacman/pkg"
```

* 有的包有 FTBFS 状态，但是却能在本地成功构建

可能是版本更新之类的问题，使用机器人命令 `/mark PACKAGE ready`
标记这个包为等待状态。

---

或者这个包原本依赖过时，现在又能用了，那也可以标记 ready。(仍需讨论)

* 修复了几次也修不好

`/mark PKGNAME stuck`

* 释放一个包裹

`/merge PKGNAME`

* 撤销标记

`/unmark PKGNAME` `STATUS`

* /unmark 用法：

`/mark pkg status`

* 什么时候标记 QEMU？

只有比如说测试跑不过，或者 qemu 神奇 bug 导致的，才标 #noqemu

* 什么时候标记 outdated_dep？

依赖（包）过期了，需要在repo里滚/上游滚。

* 可用的 mark 包括

unknown, upstreamed, outdated, outdated_dep, stuck, noqemu, ready, pending

* 工会页的可用查询参数

工会页支持 URL 查询参数，可用的参数有

  * name: 包名，user: 用户名，
  * work: 目前工作状态 (merged, working, pull requested)，
  * mark: 包的标记 (和 bot 的标记一样)，
  * mkby: 打标记的人名 (可以用来追踪 outdated)，
  * sort: 可以 sort=name, sort=user, sort=mark, sort=work...。也可以组合使用

比如你要查询谁打过标记：

```text
https://plct-archrv.ax64.workers.dev/?mkby=*-x64,%E7%93%9C
```

比如你想让工会页以工作状态排序：

```text
https://plct-archrv.ax64.workers.dev/?sort=work
```

## Leaf package, port it!

这些是尚未来得及构建的包，你有空可以搞这些包。

如果能直接构建成功，回复 `PACKAGE NAME` 直接出包
到[这条消息上](https://t.me/c/1525629125/11840)。

如果构建失败，那么就把这个包当作 FTBFS 来修。

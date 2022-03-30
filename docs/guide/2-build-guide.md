# 工作流介绍

肥猫（项目主负责人）会不断的将 x86-64 源里的软件包脚本在 RISC-V 上进行编译。
成功的将会直接加入 RISC-V 的源里，失败的会把日志文件放在
<https://archriscv.felixc.at/.status/status.htm> 里并对这个包标记上 FTBFS 标志。
FTBFS 是 "Fail To Build From Source" 的缩写。我们的任务就是尝试修复这些包。

日常你不需要在上面那个网页搜，我们还有一个工会页记录了包的状态：

<https://plct-archrv.ax64.workers.dev/>

其中，左边是包的名字，点击包的名字可以直接跳转到上一次包构建的日志。
你需要注意看右边的 mark 标记，上面会记录着每一个包当前的状态。
你可以把鼠标移动到标记上来查看详细信息。

## 领取包

找到一个想修的包，查看第三排的状态，看看是不是已经有人正在修，或者已经修好了。
如果是一个没人处理的包，你可以到群里用 `/add` 命令来获取这个包的锁，让同事
知道你已经在处理这个包了。比如你现在想修 rust，那么发送 `/add rust` 即可。

> 如果你是普通路人，那么只需要去仓库看看有没有冲突 pr 即可。

## 修包

1. 下载构建脚本文件

```console
asp checkout rust
```

2. 修改架构

上一步的命令会将上游的构建脚本 clone 到当前文件夹。
你需要进入包目录下的 trunk 目录，修改 PKGBUILD 的构建架构。

```console
cd rust/trunk
setconf PKGBUILD "('x86_64' 'riscv64')"
```

这一步可以允许我们在 riscv64 架构下运行这个编译脚本。

3. 创建缓存文件夹

我们还需要构建一个文件夹作为包的缓存。在编译过程中，pacman 会下载脚本
需要的依赖包，如果缓存文件夹复用，不干净就会导致构建时依赖安装失败等问题。

```console
# 你可以直接创建一个固定的文件夹
mkdir ~/.cache/pkgcache

# 也可以随便创建一个临时文件夹
mktemp -d -t "pkgcache_XXX"
```

4. 开始构建

安装好 archlinuxcn 源里的 devtools 之后，我们会有 RISC-V 专用的
`extra-riscv64-build` 工具来帮助我们构建。

```console
export CACHE_DIR="YOUR CACHE DIRECTORY"
extra-riscv64-build -- -d "$CACHE_DIR:/var/cache/pacman/pkg"
```

这里的 -d 函数会把 `$CACHE_DIR` 到 `/var/cache/pacman/pkg` 的路径映射参数
传到下一层的 makechrootpkg 程序。在 chroot 里下载的软件包可以在 `$CACHE_DIR`
里找到。

### Q&A

* 我有一些额外资讯，如何附带在包的标签上呢？

在命令 `/mark package status` status 之后的所有字符都会当作附录加入标签里。
比如你想说 neovim 包因为上游的一个改动导致编译失败了，可以这样用机器人：

```text
/mark package upstreamed Fail to build because https://github.com/xxxxxxx
                         ^
                         从这里开始的所有文字都会被记录
```

* 有的包有 FTBFS 状态，但是却能在本地成功构建

可能最近包修好了没有 rebuild，使用机器人命令 `/mark PACKAGE ready` 让肥猫知道，
等肥猫重新编译。

* 修复了几次也修不好，或者包特别难修，比如很多 x86 的汇编，想转让给别人来修：

```text
/mark PKGNAME stuck
/drop PKGNAME
```

* 释放一个包裹

`/drop PKGNAME`

* 撤销标记

`/unmark PKGNAME STATUS`

* 什么时候标记 QEMU？

只有比如说测试跑不过，或者 qemu 神奇 bug 导致的，才标 #noqemu。

注意，如果只有 QEMU 里才会出错，开发板没有问题的话，不要修，直接标 qemu。

* 什么时候标记 outdated_dep？

依赖（包）过期了，需要在repo里滚/上游滚。

注意：现在机器人会自动检查依赖并自动 unmark outdated 了，你需要用特殊的语法来标记依赖：

```text
/mark xxx outdated_dep [aaa]
```

当 aaa 更新的时候，xxx 这个包就会被自动解除依赖过期标记，同时你也会被通知。

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

# Leaf package, port it!

在肥猫的包状态页里，有些包被标记了 leaf 状态。

这些是尚未来得及构建的包，如果没什么好修的包，你可以处理一下他们。

如果构建失败，那么就把这个包当作 FTBFS 来修，如果构建成功，标记一个 ready 通知肥猫即可。

# rotten

rotten 代表原来这个包的 patch 打不上了。这通常是因为 Arch Linux 的上游 PKGBUILD 更新了导致
patch 对不上位置。这样的包有很多，而且通常很简单，请尽量修复。

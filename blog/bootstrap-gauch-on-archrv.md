---
title: '给 gauche 写个 bootstrap 脚本'
date: '2022-02-13'
tag: ['Arch Linux', 'RISC-V']
author: "Avimitin"
---

## 前言

上周在给 Arch 打包的时候看到了一个还没进仓库的包 gauche 需要 bootstrap。
因为我以前没打过 bootstrap 的包，有点想学，遂尝试挑战了一下。

gauche 的 x86 版本的 PKGBUILD 在 
[GitHub](https://github.com/archlinux/svntogit-community/blob/packages/gauche/trunk/PKGBUILD)
上可以找到，我修改后的 PKGBUILD 在 
[PR #804](https://github.com/felixonmars/archriscv-packages/pull/804) 。
现在还没有 merge，请以肥猫 review 后的版本为准。
如果你对这篇文章感兴趣，推荐你对照着这两个 PKGBUILD 文件来阅读。

<!--truncate-->

## 准备

首先打开 gauche 这个包的 PKGBUILD 文件查看一下依赖。

```bash
depends=(libatomic_ops libxcrypt slib)
makedepends=(autoconf gauche git)
```

> depends 数组声明这个包构建和运行时的依赖，而 makedepends 声明
> 这个包构建时的依赖。

其中 depends 数组里的依赖 RISCV 的仓库里都有了，makedepends 里的
git 和 autoconf RISCV 仓库里也有。只差 gauche 自己了。

如果像我一样没听说过 bootstrap ，你可能会觉得很奇怪，怎么要靠自己来编译
自己呢？这不是陷入了先有蛋还是先有鸡的悖论中了吗？

实际上有些软件会尝试用旧版本的自己去辅助构建，
或者用旧版本的自己来编译新版本的自己。比如 Rust，你在编译新版本的
rustc 的时候会需要用到旧版的 rustc。
假如运气不好遇到几个版本都不兼容的问题，
可能会导致你需要一个版本一个版本的往上编译。

所以当某个编译器可以自编译了之后，
后续版本就会依赖自己了。我即将要尝试的 gauche 就是如此，
他写了一些 scm 脚本来辅助编译，
这些 scm 脚本依赖兼容语法的 gauche 解释器来执行。

> 这种的 bootstrap 是最简单的一种，即该软件本身就是可以不依赖自身编译出来。
> 比较麻烦的是那些完全自举了的，一般有两种思路。
> 1. 一种是，从他没有完成自举的版本一个个编译器过去，比如 Rust 就要从最初的
> OCaml 原型编译器开始编译，GCC 需要从最后的 C 版本甚至于最初的 ASM 开始编译
> （不过这两个实际上可以采取下面说的第二种方法）
> 2. 第二种方法是在其他架构交叉编译，典型例子是 GCC，Rust 和 JDK。
>
> -- By [Coelacanthus](https://github.com/CoelacanthusHex)

所以我需要写一个新的构建脚本来构建一个新的包，给 gauche 这个包提供他自己。

依赖理清了，下一步要做的是找到 gauche 的文档和源码。
打包的人通常都会在 PKGBUILD 的 url 变量里声明官网。
在 source 数组里的地址也可以提供源码的位置。

在 gauche 的 PKGBUILD 里是这样的：

```bash
url='https://practical-scheme.net/gauche/'
source=("$pkgname::git+https://github.com/shirok/Gauche#commit=d028d2e291957b066572aae4a76dbd7a75a528d7")
```

从这两个声明能拿到 gauche 的网站是 <https://practical-scheme.net/gauche/>，
而源码在 GitHub 上托管 <https://github.com/shirok/Gauche>。

翻阅 gauche 网站，我发现不依赖 gauche 进行编译并不难。
在 download 的页面里有提供源码的 tarball 文件，
只需要简单的跑个 `make` 就可以编译了。

然后在 gauche 的 README 文件里，我发现他强调了一句：
> " If it is your first time to build Gauche, you should start from the release
> tarball instead of git clone."

这意味着我们需要把 source 里的源码地址修改一下，
更换成 release 页的地址。

看起来大概没什么问题了，于是我先把源码丢到 QEMU 的 RISCV 虚拟机里尝试
`make && make check`。

## 脚本变量

在虚拟机里编译和测试都顺利的完成之后，下一步就是写 PKGBUILD。

首先把原来 x86 的 PKGBUILD 拷贝一份出来，把原来的 pkgname 存到另外一个变量里，
然后填上新的名字。

```bash
_pkgname=gauche
pkgname=gauche-bootstrap-riscv64
```

因为这是一个新的包，这里我把 pkgrel 改为 1。
接着把 makedepends 里的 gauche 给删了，我给他再加上两个新变量 provides 和 conflicts，
表明这个包可以提供 gauche 包，而且与 gauche 包冲突。

```bash
provides=(gauche)
conflicts=(gauche)
```

因为源地址我要改成 release 里的 tarball 文件，只需要 curl 下载就行了，
所以再把 makedepends 里的 git 依赖删掉。

最后把 arch 变量改为 'riscv64'，表明这个包只能在 64 位 RISCV 环境下构建，
以及在 pkgdesc 变量里补充一句 "(for riscv64 bootstrapping)"，前半部分就完成了。

```bash
arch=(riscv64)
pkgdesc='R7RS Scheme implementation (includes gosh) (for riscv64 bootstrapping)'
```

接下来就是替换源文件地址。分析了一下这个作者发 release 文件的格式通常是：

```text
https://github.com/shirok/Gauche/releases/download/release0_9_11/Gauche-0.9.11.tgz
---
https://github.com/shirok/Gauche/releases/download/{tag}/Gauche-{version}.tgz
```

这里的 version 他常用 `X.Y.Z` 的格式，但他打 tag 的格式却是 `releaseX_Y_Z` 这样的格式。
为了复用变量，这里我们只好对 pkgver 这个变量的值进行一些文本替换操作。

```bash
source=("$_pkgname-$pkgver.tgz"::https://github.com/shirok/Gauche/releases/download/release${pkgver//\./_}/Gauche-$pkgver.tgz)
```

双冒号的前半部分定义了下载后的文件名，后半部分指定了下载路径。
我用 sed 把这里的 `.` 换成了 `_`。经过替换后就能获得正确的文件地址：

```text
https://github.com/shirok/Gauche/releases/download/release0_9_11/Gauche-0.9.11.tgz
```

由于是新文件，需要跑一下 `updpkgsums` 这个脚本给源文件生成一个 sha256sums 用于校验文件。

## 脚本函数

这些必要的变量写完之后，接下来就是修改 `build` 和 `prepare` 这两个函数。

由于我把 source 数组里的文件名改成了 `$_pkgname-$pkgver` 的形式，
首先要把 cd 给改了。这里的 gosh 是 gauche 的可执行文件名，
因为我 bootstrapping 没有 gosh 给我用，这一行可以删了。
而 CFLAGS 是 LTO 的时候的优化 flag，在实际编译测试中没有需要，所以我也删了。
`DIST gen` 也是依赖 gauche 解释的脚本，同样也删了。
最后剩下的 configure 和 make 就是最终需要的编译命令。

package 函数里只需要修改一下 cd 的目录即可。

## 问题

实际跑 archbuild 的时候遇到了两个问题。

1. 在 package 函数执行的过程中会出现 `qemu: unknown option -ftest`
2. 在 QEMU 环境里执行 `make install` 会出现 `shared library libgauche.*.so not found`

这两个问题花了我一段时间去整明白。第一个问题其实有点怪。
在解释这个问题之前，我先讲一下 `package()` 函数做了什么事情。
首先会执行 `make install-pkg` 命令。而这个命令会尝试调用刚新鲜出炉编译好的 `gosh` 可执行去解释
作者写的 scheme 脚本，然后用这些 scm 脚本去安装 gosh 运行时的库。 `-ftest` 是 gosh
的一个额外参数，可以让 `gosh` 在源码目录里运行，而不是尝试在系统目录里找依赖。具体行为
在这个函数里可以看到 [main.c#L464](https://github.com/shirok/Gauche/blob/master/src/main.c#L464)

但是为什么 `-ftest` 参数传给了 QEMU 呢？阅读源码的时候发现，`gosh` 使用了 glibc 的
`getopt` 函数来尝试解析命令行参数，当解析到 `-f` 的时候，把额外的参数传入到
`further_option()` 函数里 [(main.c#390)](https://github.com/shirok/Gauche/blob/master/src/main.c#L390)，
而 `further_option()` 在遇到 `test` 参数时，仅仅只是把 `test_mode`
标志设置为 true 而已 ([main.c#311](https://github.com/shirok/Gauche/blob/master/src/main.c#L311))。

这个问题没有搞懂源头，但好在瓜瓜提醒了一句可能是 `argv[0]` 的问题，
我把这个包丢到了 riscv 的主板上跑，确实就成功的出包了。

第二个问题倒是很快解决了。出现了第一个问题之后，我把构建到一半的文件夹
丢进 QEMU 虚拟机里，想试着手动跑一下，然后 gosh 就报了这个错误。

翻了一下 [StackOverflow](https://stackoverflow.com/questions/15117836/adding-shared-library-path-to-makefile)，
找到了 `LD_LIBRARY_PATH` 这个变量来帮助设置
运行时链接动态库的路径，然后用 `fd 'libgauche' .` 这个命令找到
编译好的 so 文件的路径，在手动跑 `make install` 前提前设置好就行。
编译的过程中 Makefile 会自己 export 这个变量，所以直接运行 PKGBUILD 脚本
不会出现这个问题。

## 自举

bootstrap 包出包之后，
在 PKGBUILD 的同目录下会有打包好的同名 `.pkg.tar.zst` 文件，
把这个文件和 x86 上的 gauche PKGBUILD 文件放在一起，在跑 archbuild
的时候带上参数 `-I gauche-bootstrap-riscv64-ver.pkg.tar.zst`。
这个参数会传给 `makechrootpkg`，向 chroot 环境添加这个包。这样 gauche 
包就能找到 gauche 依赖了。

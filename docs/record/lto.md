# lto 相关的问题

## lto 相关介绍

目前 LTO 选项在 Arch Linux 上是默认开启的，这可能导致一些打包时的编译错误。

### 视频资源

- [刘阳 - LTO 算法简介](https://www.bilibili.com/video/BV1LL4y1t7Pz)

## 开 LTO 卡在单任务上

开着 LTO 会有时候会卡在一个任务上，然后跑满一个核心。
实际上并不是卡，只是慢，这是 lto 的过程。

## 如何关掉 lto

在 PKGBUILD 里加上一行：

```diff
+options(!lto)
```

可以把 lto 关闭。

## 关掉 lto 之后...

最好是给 Arch 报一下这个 BUG，并且要慎重检查这个包是不是真的和 lto 有关，
最后再提交 patch。

## 可能和 lto 有关的错误

### Rust 包

很多 Rust 包在开着 lto 的时候编译会遇到类似于下面的问题：

```text
/usr/bin/ld: project.abcdeg.xxx.xxx.o: undefined reference to `xxxxx`
```

### 其他

- clang 没过 sancheck
- `ld: /tmp/lto-llvm-*.o: can't link soft-float modules with double-float modules`[^1]

[^1]: 其实这个并不完全是 lto 的锅，只是 lto 的时候错误的假设了 float 的情况。

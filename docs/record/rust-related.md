# Rust 相关的一些记录

## cargo 命令行参数

* `--frozen`: 需要 Cargo.lock 文件和缓存是最新的。

## 我遇到的一些错误

### riscv64gc-unknown-linux-gnu

这个问题源自于 Rust 和 LLVM 的 Triple 定义不一致。
Rust 学 GCC 搞 `rv64<ext>` 这样的风格。
前者是 `riscv64gc-unknown-linux-gnu`，
而后者是 `riscv64-unknown-linux-gnu`。

可行的解决方法是用一个 if 语句把传参换成 `riscv64-...`。

修复的方式可以参考这个：
https://github.com/alexcrichton/cc-rs/pull/428/files

> References:
>
> - https://github.com/sodiumoxide/sodiumoxide/pull/474/commits/6dd994493ac592cf59798df75c293c6212c973a9#diff-6651588311ef4e5d49026d64fe43063739e047195958490a79c64146a719bd28R152
> - https://github.com/rust-lang/rust/issues/62117
> - https://github.com/lowRISC/riscv-llvm/blob/master/0002-RISCV-Recognise-riscv32-and-riscv64-in-triple-parsin.patch

### Cargo component is not applicable...

```text
error:
  the 'cargo' binary, normally provided by the 'cargo' component,
  is not applicable to the 'stable-2020-12-31-x86_64-unknown-linux-gnu' toolchain
```

这个错误源自于 rustup 因为更新中断或其他错误，
只部分更新了工具链。
这个问题不是很好修，我的建议是重新安装 cargo 工具链，
能更快解决问题。

```bash title=bash
# uninstall cargo/component/library/environment/rustup
rustup self uninstall
# reinstall
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### xxx have differnt source paths...

我的想法是针对不同的环境使用不同的依赖版本。
比如像下面这样，在普通的环境使用 4.4.0 版本，
在 riscv64 里用我 fork 并修好的版本。

```toml title=Cargo.toml
[depedencies.ffmepg-sys-next]
version="4.4.0-next.2"
default-features=false

[target.'cfg(target_arch="riscv64")'.dependencies.ffmpeg-sys-next]
git="https://github.com/Avimitin/rust-ffmpeg-sys"
branch="risc-v"
```

但是这样是无法编译的：

```text title=Output
Caused by:
  Dependency 'ffmpeg-sys-next' has different source paths depending on the build target.
  Each dependency must have a single canonical source path irrespective of build target.
```

Cargo 不支持对同一个依赖使用不同的源。
你可以这么写：

```toml title=Cargo.toml
[depedencies]
A
B

[target.'cfg(target_arch="riscv64")'.dependencies]
C
D
```

但是不能这么写：

```toml title=Cargo.toml
[depedencies]
A = { git = "https://github.com/UserA/crate" }

[target.'cfg(target_arch="riscv64")'.dependencies]
A = { git = "https://github.com/UserB/crate" }
```

### 在依赖里用了 git 之后指定的 feature 无效了

当这样设置依赖的时候，指定的 feature 不会被编译

```toml title=toml
[dependencies.dashmap]
git = "https://github.com/Avimitin/dashmap"
branch = "risc-v"
features = ["serde"]
```

暂时不知道什么原因。
会导致编译的时候有的 trait 没有实现在 struct
上导致传参失败之类的错误等等。

如果遇到某个模块没法编译 features 进去的话，
优先把他这个包修了然后发 PR 到上游。

### 编译时遇到了奇怪的 SIGSEGV

Example: `signal:11, SIGSEGV: invalid memory reference` 。

可能的解决方案：把 `opt-level` 调低到 2 或者 1 试试。

### libicuuc not found/OCaml

icu 滚动更新之后炸了。先暂停 rustc 相关的工作吧

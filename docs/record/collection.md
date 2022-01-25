# 奇奇怪怪的错误们

## 阿里云上遇到 sigsegv

如果在阿里云上遇到奇奇怪怪的 `segmentation fault`，
首先确认 rustc 的[优化](./rust-related.md#编译时遇到了奇怪的-sigsegv)
有无问题，如果查不出来问题的话，
默认认为阿里云的虚拟化有问题。

## 把 jemallocator 换成 tikv-jemallocator

Read: https://github.com/meilisearch/MeiliSearch/pull/1692

## Executable "wasm-ld" doesn't exist! (STUCK)

要安装 lld，wasm-ld 只在 lld 里面有。

---

Firefox 的话，引入 lld 会带来另外的问题。lld 是需要默认关闭的，
问题来源于 `-mno-relax` 和 `-mrelax` 。

可以查看这个 PR 了解详情 https://github.com/felixonmars/archriscv-packages/pull/139

## pthread related issue

如果是 pthread 引起的 atomic 引用最好找 `-lpthread` 替换成 `-pthread`。

gcc/clang应该从十几年前就要求用 -pthread 了，现在还残留的 -lpthread
绝大多数是写错了。

给上游提交的时候可以说：

```text
This has been already discussed lengthly in GCC.
The answer is that -lpthead is only linking with the thread library,
while -pthread actually means enabling thread support,
which includes in the case of riscv64 -latomic,
but also correctly define some macros when compiling code.
In short this is not considered as a GCC bug.
```

StackOverflow 也有相关讨论：
  https://stackoverflow.com/questions/23250863/difference-between-pthread-and-lpthread-while-compiling

---

关于如何跟上游对线的参考：
<https://github.com/juce-framework/JUCE/issues/995>

## gcc atomic

gcc 的 1B 2B atomic 实现在 riscv64 有问题。gcc 的 1B 2B atomic 实现需要跑到 libatomic，
于是没法在编译期判断是否无锁

> ref: https://code.videolan.org/videolan/vlc/-/issues/20683
>
> The GCC docs make it clear that -pthread is the correct way to use the pthread
> library on POSIX systems.  Not only does it add extra necessary linker options
> for some targets, but it also adds some extra necessary preprocessor options
> for many targets.  There is also the issue that the library is called -lpthread
> on some systems, and -lpthreads on others.  The -pthread option handles this
> correctly.
>
> **It is a known problem that the RISC-V gcc atomic support needs more work.
> RISC-V only supports 4 and 8 byte atomic operations in hardware.  1 and 2 byte
> operations are implemented using instruction sequences with locks, and this is
> currently done via a call into libatomic.**  However, mixing lock free and
> non-locking atomic sequences can potentially cause run-time failures.  We need
> to instead emit instruction sequences using 4 and/or 8 byte atomic instructions
> without locks.  This is on the list of things that need to be fixed, but there
> are a lot of things that need to be fixed and we haven't gotten around to
> fixing this one yet.  This definitively needs to be fixed before gcc 9, and
> hopefully much sooner than that.
>
> While the RISC-V gcc port does need to be fixed, it is still true that you
> should be using -pthread instead of -lpthread.

除此之外还有一个很诡异的事情：就是在 gcc 里，`std::atomic<bool>::is_always_lock_free`
是 false，`std::atomic<int>::is_always_lock_free` 是 true。但是如果你在运行的时候
整一个 bool b; `std::atomic_is_lock_free(&b)`，你会发现它是 true，而且是，不管怎么试，
在哪试，它都是 true。

在 gcc 里面大概 ATOMIC_BOOL_LOCK_FREE 是 1（1 for the built-in atomic types
that are sometimes lock-free)

> ref: https://www.mail-archive.com/gcc-bugs@gcc.gnu.org/msg664254.html
>
> tldr: 只能等 gcc 的人实现 sub-word lock-free atomic 了
>
> All atomic types except for std::atomic_flag may be implemented using mutexes
> or other locking operations, rather than using the lock-free atomic CPU
> instructions. Atomic types are also allowed to be sometimes lock-free, e.g. if
> only aligned memory accesses are naturally atomic on a given architecture,
> misaligned objects of the same type have to use locks.
>
> Thanks for the detailed writeup!
>
> Your analysis is basically correct, but I would add that ICC's behavior here is
> unsound (it only appears to "implement[] this behavior correctly" in simple cases)
> whereas the GCC/Clang behavior is sound but surprising. For GCC, ICC, and Clang, `identity <fp>`
> and `identity<float>` are the same type. Therefore it's not possible for `identity <fp>::type`
> and `identity<float>::type` to have different alignments, because they're
> the same type. So, for an example such as this:

```cpp
typedef float fp  __attribute__((aligned(16)));
std::cout << alignof(typename identity<fp>::type) << std::endl;
std::cout << alignof(typename identity<float>::type) << std::endl;
```

> under GCC and Clang, both lines print out 4, whereas under ICC, they either both
> print out 4 or both print out 16 depending on which one happens to appear first
> in the program (and in general you can encounter ODR violations when using ICC despite
> there being nothing wrong at the source level).

> Fundamentally, the 'aligned' attribute is a GCC extension, so the GCC folks get
> to define how it works. And they chose that instead of it resulting in a different
> type that's *almost* like the original type (for example, treating it as a type
> qualifier), it results in the same type, but that in some contexts that same type
> behaves differently. That's a semantic disaster, but it's what we live with. And
> in particular, the only way for template instantiation to be sound in the presence
> of this semantic disaster is for it to ignore all such attributes on template type
> arguments.

## -fno-common

**Q**: -fno-common 取代了 -fcommon, 这种情况优先 -fno-common 还是 patch source？

**A**: 优先 patch source。
一般来说能不动flags尽量不动。
少数例外是，比如，这个项目死了十年了，连个repo都找不到。

不过如果是 -fcommon 这种，比较推荐的是先提给上游，咱们patch着打。
这样下次上游发版本arch那边更新的时候，就会莫名其妙好了，他们不用做什么，我们也只用删掉patch。

## -Wno-format

如果遇到
`cc1: error: -Wformat-security ignored without -Wformat [-Werror=format-security]`，
这个错误是因为代码被编译的时候，`CFLAG` 选项多了一个 `-Wno-format`，这个选项会关闭
`-Wformat`，但 `-Werror=format-security` 仍然保留着。

解决方案首先是让上游修，然后引用 patch，参考上面那一章节。

如果是一万年不更新的代码仓库，那可以酌情使用
`${CFLAG#-Werror=format-security}` 或者 `sed -i 's/ -Werror=format-security // Makefile`
把这个选项删除。

但是尽量现在群里讨论，问问前辈的意见。

## -Werror=format-security

```text title=manpage
-Wformat-security
   If -Wformat is specified, also warn about uses of format functions that represent possible security problems.  At present, this warns about calls to "printf" and "scanf" functions where the
   format string is not a string literal and there are no format arguments, as in "printf (foo);".  This may be a security hole if the format string came from untrusted input and contains %n.
   (This is currently a subset of what -Wformat-nonliteral warns about, but in future warnings may be added to -Wformat-security that are not included in -Wformat-nonliteral.)
```

首先，优先给上游发补丁。从 manpage 也可以看的出来，只需要把 `printf` 改成 `printf("%s")` 的形式即可。

除非上游十多年没动静，才可以选择把这个选项删掉。
可以用： `CFLAGS=${CFLAGS/-Werror=format-security/}`

如果上游很难沟通，或者上游代码不太好修，优先自己修，然后和群里的前辈商量一下解决方案。

> Reference:
> https://github.com/felixonmars/archriscv-packages/pull/559

## 如何快捷生成 sum

用 [updpkgsums](https://archlinux.org/packages/community/x86_64/pacman-contrib/)

## 修代码优先还是改编译 flag 优先？

优先修代码。

> 参考：
> https://build.opensuse.org/package/view_file/devel:ARM:Factory:Contrib:ILP32/presage/presage-0.9.1-gcc11.patch?expand=0

## noqemu

能 patch 使用 generic 分支的就不要 noqemu

## Rust

参考 [_Rust 相关的一些记录_](./rust-related)

## SSE Related issue

Disable the build flag:

```diff title=riscv64.patch
+    -DOCIO_USE_SSE=OFF
```

Delete build flag:

```diff title=riscv64.patch
 build() {
   cd SuiteSparse-$pkgver

-  BLAS=-lblas LAPACK=-llapack TBB=-ltbb SPQR_CONFIG=-DHAVE_TBB MY_METIS_LIB=/usr/lib/libmetis.so make
+  BLAS=-lblas LAPACK=-llapack MY_METIS_LIB=/usr/lib/libmetis.so make
 }
```

## Go

### Patch `go dep`

```bash title=console
go mod edit -replace github.com/prometheus/client_golang=github.com/prometheus/client_golang@efe7aa7
go mod download github.com/prometheus/client_golang

# 这个是根据不加 go get 的报错提示来添加的
# 没报错可以不用加，注意要去掉版本号（@ 后面的部分）
go get github.com/prometheus/client_golang/prometheus

go generate  # if necessary
cd cmd/traefik
go build
```

> 具体参考：
> https://github.com/felixonmars/archriscv-packages/pull/346/files

### 给 go 包的依赖（的依赖）打patch的正确方式

Go 比较特殊，Go 是在 build 的时候 install。
假设有一系列的依赖链：`a->b->c->d->e`。
如果需要修 d，则 bcd 都需要 fork，修好 d 之后 bc 改依赖。

Go 还可以在 go.mod 里用 replace 语法来替换依赖：

```text title=go.mod
replace github.com/creack/goselect => github.com/creack/goselect v0.1.2
```

> 具体参考：
> https://github.com/felixonmars/archriscv-packages/pull/387/commits/ad0e66c31b21efd93fff93be8cce5b9e13b59953

## 版本号

版本号不要超过主线，尽量以催更为主。
如果实在不行就加一行注释，提一下上游的进度，让以后维护的人有个参考。

## 循环依赖

有些包可以一起打，但在状态页上显示互相缺了对方，这种需要 bootstrap。

> 详细参考 ghc bootstrap Patch:
> https://github.com/felixonmars/archriscv-packages/pull/17/commits/36279fff5314fbcd212549ede73db5257ef10b1d

## Intel related

Intel 的一些包，没留 Generic 实现，只有 x86 simd 的，比如 hyperscan，
这种包就直接跳过不管了。

## Qmake

使用 qmake 构建的包构建时提示 `Could not find qmake spec 'default'.`

这种情况目前需要去板子上打包。

## XX is not available for the 'riscv64' architecture

有些包需要修改 arch 的值才能编译，
否则会遇到 `==> ERROR: cern-vdt is not available for the 'riscv64' architecture`。

但请不要把 arch 改为 any，这里填 `riscv64` 即可。

你可以用 sed 快速替换值：

```console title=console
# sed doesn't support Extend RegEx(ERE) by default, need `-E` option to manually enable
sed -i -E "s/arch=\('?x86_64'?\)/arch=\('riscv64'\)/" PKGBUILD
```

还有请注意
[不要提交修改后的 arch](../guide/PR-guide#%E4%B8%8D%E8%A6%81%E6%8F%90%E4%BA%A4-archany)

## msse

Error: `c++: error: unrecognized command-line option '-msse'`

这是因为 -msse 这个编译选项暂时还不支持 `x86_64` 以外的 Arch，
你需要查看一下这个项目的 CMakeList 选项，暂时把他关闭。

比如 `cmake -DSSE=OFF`。

## Unknown public key `[a-zA-Z0-9]+`

这是因为本地的 gpg 数据库没有这个开发者的公钥。你可以用命令
`gpg --recv-key keyid` 下载并导入这个 key。

---

如果遇到了 `gpg: keyserver receive failed: No data` 这样的错误，
大概率是 keyserver 被橄榄了。建议直接去项目主页找他们的 public key
手动导入。

> sks pool 因为是单增的，无法满足 GDPR 对被遗忘权的规定，
> 被欧盟法律橄榄了。

---

如果实在是找不到 key，可以用参数 `--skippgpcheck` 暂时跳过检查。

或者可以参考这个：
<https://github.com/archlinuxcn/lilac/blob/master/recv_gpg_keys>

## Electron

v8 版本低于 9.0 的就不用修了，从 9.0 开始有实验性的 risc-v 支持。

## node-sass

node-sass v6 就是不支持 node v17 的，node-sass 对 njs v17 的支持始于版本 7.0.0，
6.x 支持的 njs version：12, 14, 15, 16，所以要么就把 dependency 从 nodejs 改成 nodejs-lts-gallium，
要么就催上游更新 package.json 里 node-sass 的版本，which is nonsense，因为大版本号的更新往往带来不兼容。

## 关于 upstream

如果上游的 maintainer 是肥猫的话，可以直接在群里 @ 肥猫。

## Python 2to3

Python 的包不管 major version 都要跑一次 2to3。

## 测试

如果有的包不在乎测试是否通过，比如 `test || echo`，那就直接把测试注释掉。

## 访问一些会在编译期被删除的文件

有一个比较脏的做法：往 PKGBUILD 里塞一个 bash，然后就用这个 subshell 来交互。

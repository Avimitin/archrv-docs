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
sed -E "s/arch=\('?x86_64'?\)/arch=\('riscv64'\)/"
```

还有请注意
[不要提交修改后的 arch](../guide/PR-guide#%E4%B8%8D%E8%A6%81%E6%8F%90%E4%BA%A4-archany)

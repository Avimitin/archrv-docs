# PR 的指引

提 PR 的一些建议。

## 基本概念

1. 所有 PR 优先提交上游，
然后在 rv64 中引用上游 patch。（提交上游的patch会加钱)

2. PR 中需要具体写清楚修改的原因。
以后方便维护，看着这个修改就知道原因

3. 修改 pkgbuild 中的内容也需要写清楚修改原因，
特别是添加 make 参数， 修改 cflags 之类的。
需要写一下这么修改的原因

4. 如果这个 patch 应该需要反馈上游或者交给 Arch，要在
改动里注明给上游的 PR 的链接，或者给 Arch 的 BUG Report 链接。

## 如何创建 patch

### 还未 stage 修改

```bash title=bash
git diff > riscv64.patch
```

### 已经 stage 了修改

```bash title=bash
git diff --cached > riscv64.patch
```

### 如果有二进制文件被修改

```bash title=bash
git diff --cached --binary > riscv64.patch
```

### 如何用 git 打补丁

```bash title=bash
git apply riscv64.patch
```

### 补丁的格式

用上述方法打出来的补丁通常是以下的格式：

```diff title=riscv64.patch
diff --git a/trunk/PKGBUILD b/trunk/PKGBUILD
--- a/trunk/PKGBUILD
+++ b/trunk/PKGBUILD
```

你需要删除掉所有的 `a/trunk` 和 `b/trunk` 字符：

```diff title=riscv64.patch
diff --git PKGBUILD PKGBUILD
--- PKGBUILD
+++ PKGBUILD
```

也可以用下面这个脚本来直接去除这些字符：

```bash title=console
git diff --no-index --no-prefix PKGBUILD.orig PKGBUILD | filterdiff --clean --strip=1 > riscv64.patch
```

## 提交 PR 的一些格式注意事项

### 数组的格式

```bash title=PKGBUILD
source=("http://www.frodo.looijaard.name/system/files/software/${pkgname}/${pkgname}-${pkgver}.tar.gz"
        'psiconv.patch')

md5sums=('286e427b10f4d10aaeef1944210a2ea6'
         '4fb974d3ae3058de435050d1595f269b')
```

> Reference:
> https://github.com/felixonmars/archriscv-packages/pull/148/commits/839b90f662cc942f9c1b1f80284d93e4d48dd5a5

### 不要提交 `arch=(any)`

有些包只需要把 arch 改成 any 就能编译了，
这种包不需要 PR，
在群里用命令 `/mark {PACKAGE} ready` 就行。

在提交补丁的时候，
如果为了在 RISC-V 里编译改了 arch 的值，
提 PR 的时候记得删掉这部分的修改。

> Reference:
> https://github.com/felixonmars/archriscv-packages/pull/488/commits/116365a132e9e973ab152514d59ed6688fdc3799

### 如果上游把这个包修好了

- 用 cherry-pick

```diff title=PKGBUILD
 prepare() {
   cd $pkgname
+  git cherry-pick -n 508c0f94e5f182e50ff61be6e04f72574dee97cb  # patch: Don't alter or try to write [GtkChild] fields
+  git cherry-pick -n e8a0aeec350ea80349582142c0e8e3cd3f1bce38  # patch: Reference of [GtkChild] fields is handled by GtkBuilder, type must be unowned
 }
```

- 直接从上游下载 patch

```diff title=PKGBUILD
+source=(https://github.com/MegaGlest/megaglest-source/releases/download/${pkgver}/megaglest-source-${pkgver}.tar.xz{,.asc}
+        ftp-fixes.patch::https://github.com/MegaGlest/megaglest-source/commit/5a3520540276a6fd06f7c88e571b6462978e3eab.patch)

+prepare() {
+  cd megaglest-${pkgver}
+
+  patch -Np1 -i ../ftp-fixes.patch
+}
```

> Reference:
>
> * https://github.com/felixonmars/archriscv-packages/pull/165
> * https://github.com/felixonmars/archriscv-packages/pull/345
> * https://github.com/felixonmars/archriscv-packages/pull/348
> * https://github.com/felixonmars/archriscv-packages/pull/405

## 如何把 PR 的内容以 patch 形式下载

找到 PR 的那条 commit，在 URL 后边加 .patch/.diff 就能拿到 raw contents。
比如
[PR #470](https://github.com/felixonmars/archriscv-packages/pull/470/commits/95242a8b610854ef64c8b5e304756ba6a4d4302d),
去掉 commit 后的那一串，直接加上 .patch。

```diff title=diff
-...kages/pull/470/commits/95242a8b610854ef64c8b5e304756ba6a4d4302d

+...kages/pull/470.patch
```

现在 GitHub 也已经提供了超链接跳转，点击即可跳转。

![image](../asserts/github-pr-patch-button.png)

## 本地版本过老

假设发布的版本特别晚，引用 patch 会行数不对应冲突的话，优先发 issue
催上游发新版本。

## 修改 PKGREL

pkgrel 不能超过 x86 主线，如果需要重新打包，推荐 0.1 往上加。

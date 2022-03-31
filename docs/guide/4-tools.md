# 工具介绍

## archbuild

关于什么是 extra-riscv64-build，你可以参考这一篇指引：
<https://github.com/felixonmars/archriscv-packages/wiki/archbuild-%E8%84%9A%E6%9C%AC%E8%A7%A3%E8%AF%BB>。

### FAQ

* 如何清理缓存？

可以用 `extra-riscv64-build -c`，他会检查有没有别人在干活，然后再删除。

* 如何给不同的架构加不同的编译依赖？

PKGBUILD 支持 `makedepened_{architecture}` 这样的依赖声明，因此你可以给
不同的架构声明不同的依赖。

具体可以参考酸鸽的这个 PR：
https://github.com/felixonmars/archriscv-packages/pull/752/commits/104ffb2b0652343ad9bcfba4686cbda39c8eb31d

## makechrootpkg

* 如何把不在仓库里的依赖塞进编译环境里

```bash
extra-x86_64-build -- -I /var/cache/pacman/pkg/your-package-0-x86_64.pkg.tar.xz
```

reference:

- https://felixc.at/2017/08/introduction-to-arch-linux-devtools-build-packages-from-a-clean-chroot/

## patch

你可以用 `git` 或者 `patch` 来尝试打补丁

```bash title=bash
git apply riscv64.patch

patch -Ni riscv64.patch
```

有一个需要注意的点。patch 有一个 `-p` 参数用来裁剪 patch 的路径。
比如 patch 里写的路径是 `/a/b/c/d`，使用 `-p 3` 参数后，patch 只会打在
`c/d` 上。

可能会有人和我一样以为不带上 `-p` 参数就是按照原路径来打补丁。但其实这里有个小坑，
如果你不特意指定 `-p0` 既不裁剪路径，patch 默认是只对最后的文件名打补丁。

比如上述的例子，如果用 `-p0` patch 才会把补丁打到 `/a/b/c/d` 上，如果不指定 `-p`
参数，那 patch 会直接在本地找 `d` 文件并尝试打 patch 到 `d` 文件上。

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

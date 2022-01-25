# 工具介绍

## archbuild

关于什么是 extra-riscv64-build，你可以参考这一篇指引：
<https://github.com/felixonmars/archriscv-packages/wiki/archbuild-%E8%84%9A%E6%9C%AC%E8%A7%A3%E8%AF%BB>。

### FAQ

* 如何清理缓存？

可以用 `extra-riscv64-build -c`，他会检查有没有别人在干活，然后再删除。

## makechrootpkg

* 如何把不在仓库里的依赖塞进编译环境里

```bash
extra-x86_64-build -- -I /var/cache/pacman/pkg/your-package-0-x86_64.pkg.tar.xz
```

reference:

- https://felixc.at/2017/08/introduction-to-arch-linux-devtools-build-packages-from-a-clean-chroot/

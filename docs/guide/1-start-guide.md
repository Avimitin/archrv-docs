# 设置 RISC-V QEMU 环境

目前 RISC-V 的开发板相对比较少，而且性能较差。
我们在平常编译和测试时通常使用 [QEMU](https://en.wikipedia.org/wiki/QEMU)
虚拟机来模拟 RISC-V 的环境。

所以在贡献之前，你需要首先部署好 QEMU 环境。

跟着
[项目 WiKi 里的环境搭建教程](https://github.com/felixonmars/archriscv-packages/wiki/%E4%BD%BF%E7%94%A8Qemu%E5%92%8Csystemd-nspawn%E6%90%AD%E5%BB%BARISC-V%E8%BD%BB%E9%87%8F%E7%BA%A7%E7%94%A8%E6%88%B7%E6%A8%A1%E5%BC%8F%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83#%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA)
的指引一步一步来设置即可。

**Tips**:
有可能你会遇到无法下载镜像文件的问题，
这是因为原来的镜像站 wsyu.edu.cn 的证书过期了。
你需要用另一个镜像源来下载。

```bash title=bash
wget -c https://archriscv.felixc.at/images/archriscv-20210601.tar.zst
```

# 给 devtools 打补丁

我们需要 `extra-riscv64-build` 来帮我们在 RISC-V 里执行编译包的脚本。
现在 devtools 已经加进了 archlinuxcn 的上游源，你只需要把 archlinuxcn 源
加入 pacman 的源里就好了。

Arch Linux CN 源指引：[usage](https://github.com/archlinuxcn/repo#usage)

然后执行

```console
pacman -Syu devtools-riscv64
```

## 开始修包！

上面两步做好之后就可以了解我们的工作流并尝试打包了。
详细请看 [构建相关](./2-build-guide.md) 。

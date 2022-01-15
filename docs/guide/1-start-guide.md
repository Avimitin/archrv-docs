# 环境部署

## 设置 RISC-V QEMU 环境

跟着
[QEMU Wiki](https://github.com/felixonmars/archriscv-packages/wiki/%E4%BD%BF%E7%94%A8Qemu%E5%92%8Csystemd-nspawn%E6%90%AD%E5%BB%BARISC-V%E8%BD%BB%E9%87%8F%E7%BA%A7%E7%94%A8%E6%88%B7%E6%A8%A1%E5%BC%8F%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83#%E7%8E%AF%E5%A2%83%E6%90%AD%E5%BB%BA)
的指引来设置。

**Tips**:
有可能你会遇到无法下载镜像文件的问题，
这是因为原来的镜像站 wsyu.edu.cn 的证书过期了。
你需要用另一个镜像源来下载。

```bash title=bash
wget -c https://archriscv.felixc.at/images/archriscv-20210601.tar.zst
```

## 给 devtools 打补丁

我们需要 `extra-riscv64-build` 来帮我们在 RISC-V 里打包。
所以这里需要给官方的 `extra-x86_64-build` 工具打补丁。

跟着
[wiki](https://github.com/felixonmars/archriscv-packages/wiki/archbuild-%E8%84%9A%E6%9C%AC%E8%A7%A3%E8%AF%BB#%E5%AE%89%E8%A3%85-devtools)
的指引构建。

## 开始修包！

上面两步做好之后就可以开始修包了。
详细请看 [构建相关](./2-build-guide.md) 。

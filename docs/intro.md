---
sidebar_position: 1
---

# 简介

archriscv-packages 是一个为 Arch Linux x86-64 源里无法在 RISC-V 里直接
编译的软件包提供补丁的项目。贡献者们的终极目标是将这个项目里的所有补丁
减少至 0，既我们要努力让所有的软件包不需要修改就能在 RISC-V 上运行。

这篇文档会首先会对编译软件包的流程进行介绍和指引，
同时会记录 archriscv 打包团队在尝试编译软件包时遇到的各种困难和解决方案。

- [入门指引](./guide/1-start-guide.md)
- [问题合集](./record/collection.md)

我们的项目目前部署在 GitHub 上：
[felixonmars/archriscv-packages](https://github.com/felixonmars/archriscv-packages)

本文档使用 [docusarus](https://docusaurus.io/) 进行静态网页生成，
通过 [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/) 开源于 [GitHub](https://github.com/Avimitin/RISC-V_Daily_Notes)

目前主要由 [Avimitin](https://github.com/Avimitin) 进行维护，
你可以通过邮件 [avimitin@gmail.com](mailto:avimitin@gmail.com) 来联系。

:::caution

这篇文档是摘抄/转录/直接复制粘贴于群友的日常经验和总结，本人(Avimitin) 仅作收录。
著作权和解释权完全归整个打包团队所有。

:::

# 随时会过时的记录

## OCaml

有大量依赖 OCaml 的包过期了，等待上游滚动更新 pkgrel。

## Python 3.10

```text title=Error
importlib.metadata.PackageNotFoundError: No package metadata was found for meson
```

原因: meson 没 rebuild against py3.10，目前暂时所有的 Python
包都是挂的。

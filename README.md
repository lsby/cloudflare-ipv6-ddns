# cloudflare-ipv6-ddns

新增或修改cloudflare给定域名的ipv6地址为本机地址.

## 安装

```
npm i -g @lsby/cloudflare-ipv6-ddns
```

## 使用

在命令行执行以下命令, windows和linux略有不同.

- 设置环境变量的写法不同, windows是`set`, linux是`export`.

下面的示例使用windows的写法:

```
set CLOUDFLARE_API_TOKEN=<cloudflare的token>
set CLOUDFLARE_ZONE_ID=<cloudflare域名的区域id>
export DOMAIN=<要设置ddns的完整域名>

lsby-cloudflare-ipv6-ddns
```

只会执行一次, 如需定时执行, 请使用其他软件配合.

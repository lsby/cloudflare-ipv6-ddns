# cloudflare-ipv6-ddns

新增或修改cloudflare给定域名的ipv6地址为本机地址.

## 安装

```
npm i -g @lsby/cloudflare-ipv6-ddns
```

## 用法

```
export CLOUDFLARE_API_TOKEN=<你的token>
export CLOUDFLARE_ZONE_ID=<域名的区域id>
export DOMAIN=<要设置ddns的完整域名>

lsby-cloudflare-ipv6-ddns
```

只会执行一次, 如需定时执行, 请使用其他软件配合.

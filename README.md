# cloudflare-ipv6-ddns

用于动态设置cloudflare给定域名的ipv6地址.

## 安装

```
npm i -g @lsby/cloudflare-ipv6-ddns
```

## 用法

```
export CLOUDFLARE_API_TOKEN=<你的token>
export CLOUDFLARE_ZONE_ID=<域名的区域id>
export DOMAIN=<要设置ddns的完整域名>
export UPDATE_TIME=<同步间隔时间(毫秒)>

lsby-cloudflare-ipv6-ddns
```

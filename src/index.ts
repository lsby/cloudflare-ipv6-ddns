#!/usr/bin/env node
import Cloudflare from 'cloudflare'
import dotenv from 'dotenv'
import { axios请求 } from './tools/axios.js'

async function 获取IPv6地址(): Promise<string> {
  try {
    console.log('开始获取本机ipv6地址...')
    const 响应 = await axios请求<{
      ip: string
    }>({ method: 'GET', url: 'https://api6.ipify.org/?format=json' })
    console.log('成功获取本机ipv6地址: %O', 响应.ip)
    return 响应.ip
  } catch (e) {
    console.log('无法获得ipv6地址')
    throw e
  }
}

async function 增加或更新dns记录(
  cf句柄: Cloudflare,
  区域id: string,
  域名: string,
  ip地址: string,
  类型: 'A' | 'AAAA',
  使用代理: boolean = false,
  ttl: number = 1,
): Promise<void> {
  console.log('开始增加或修改dns记录...')

  console.log('查询dns记录列表...')
  const 列表 = await cf句柄.dns.records.list({ zone_id: 区域id })

  var 目标 = 列表.result.filter((a) => a.name == 域名)[0]
  if (目标 == null) {
    console.log('没有找到域名%O对应的记录, 将新增该记录...', 域名)
    await cf句柄.dns.records.create({
      zone_id: 区域id,
      content: ip地址,
      name: 域名,
      proxied: 使用代理,
      type: 类型,
      comment: '',
      ttl: ttl,
      tags: [],
    })
    console.log('新增记录成功')
    return
  }

  if (目标.id == null) throw new Error('无法获得需要的信息')
  if (目标.content == ip地址) {
    console.log('找到域名%O对应的记录, 发现ip没有变化, 什么都不做', 域名)
    return
  }

  console.log('找到域名%O对应的记录, 发现ip有变化, 将修改该记录', 域名)
  await cf句柄.dns.records.edit(目标.id, {
    zone_id: 区域id,
    content: ip地址,
    name: 域名,
    // 截至 2024年5月2日, 接口实际返回的值包括proxiable和proxied, proxiable总为true, 所以这里使用proxied.
    proxied: (目标 as any).proxied == null ? 使用代理 : (目标 as any).proxied,
    type: 类型,
    comment: 目标.comment || '',
    ttl: 目标.ttl || ttl,
    tags: 目标.tags || [],
  })
  console.log('修改记录成功')
}

async function main(): Promise<void> {
  console.log('开始运行...')

  dotenv.config()

  const 令牌 = process.env['CLOUDFLARE_API_TOKEN']
  const 区域id = process.env['CLOUDFLARE_ZONE_ID']
  const 域名 = process.env['DOMAIN']

  if (!令牌 || !区域id || !域名) {
    console.log('未提供必要的环境变量：CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, DOMAIN')
    process.exit(1)
  }

  const cloudflare = new Cloudflare({ apiToken: 令牌 })

  const ipv6地址 = await 获取IPv6地址()
  await 增加或更新dns记录(cloudflare, 区域id, 域名, ipv6地址, 'AAAA')
}

await main().catch(console.log)

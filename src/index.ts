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
  ttl: number = 3600,
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

  console.log('找到域名%O对应的记录, 将修改该记录', 域名)
  await cf句柄.dns.records.edit(目标.id, {
    zone_id: 区域id,
    content: ip地址,
    name: 域名,
    proxied: 目标.proxiable || 使用代理,
    type: 类型,
    comment: 目标.comment || '',
    ttl: 目标.ttl || ttl,
    tags: 目标.tags || [],
  })
  console.log('修改记录成功')
}
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function 执行DDNS(cloudflare: Cloudflare, 区域id: string, 域名: string): Promise<void> {
  const ipv6地址 = await 获取IPv6地址()
  await 增加或更新dns记录(cloudflare, 区域id, 域名, ipv6地址, 'AAAA')
}

async function main(): Promise<void> {
  console.log('开始运行...')

  dotenv.config()

  const 令牌 = process.env['CLOUDFLARE_API_TOKEN']
  const 区域id = process.env['CLOUDFLARE_ZONE_ID']
  const 域名 = process.env['DOMAIN']
  const 刷新时间字符串 = process.env['UPDATE_TIME']

  if (!令牌 || !区域id || !域名 || !刷新时间字符串) {
    console.log('未提供必要的环境变量：CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID, DOMAIN, UPDATE_TIME')
    process.exit(1)
  }
  const 刷新时间 = parseInt(刷新时间字符串)
  if (isNaN(刷新时间)) {
    console.log('无法解析UPDATE_TIME')
    process.exit(1)
  }

  const cloudflare = new Cloudflare({ apiToken: 令牌 })

  while (1) {
    console.log('=================== 执行DDNS ===================')
    await 执行DDNS(cloudflare, 区域id, 域名)
    console.log('执行完成, 将在%O秒后重新执行', 刷新时间 / 1000)
    await sleep(刷新时间)
  }
}
while (1) {
  try {
    await main()
  } catch (e) {
    console.log(e)
  }
}

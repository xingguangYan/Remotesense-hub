import { PrismaClient } from "@prisma/client"
import { hashToken } from "../src/lib/tokens"

const prisma = new PrismaClient()

// 本地预览用的演示 token（仅 seed 使用，勿用于生产）
const DEMO_MANAGE_TOKEN = "seed-demo-manage-token"
const DEMO_VERIFY_TOKEN = "seed-demo-verify-token"
export const DEMO_TOKENS = { DEMO_MANAGE_TOKEN, DEMO_VERIFY_TOKEN }

async function main() {
  // 幂等保护：已有数据则跳过，便于部署期安全调用
  const existing = await prisma.demand.count()
  if (existing > 0) {
    console.log(`数据库已有 ${existing} 条需求，跳过种子写入。`)
    return
  }

  const now = Date.now()
const daysAgo = (d: number) => new Date(now - d * 86_400_000)
const daysAhead = (d: number) => new Date(now + d * 86_400_000)

  const demands = [
    {
      id: "seed-demand-1",
      title: "长江中下游水稻种植面积遥感监测专题制图",
      category: "THEMATIC_MAPPING",
      region: "长江中下游",
      area: "约 12 万平方公里",
      resolution: "10m",
      timeRange: "2026 年 4 月–9 月生育期",
      startAt: daysAhead(3),
      deadlineAt: daysAhead(75),
      budget: "BETWEEN_50K_200K",
      description:
        "为省级农业统计提供水稻种植面积本底数据，需要覆盖长江中下游稻主产区的多期卫星影像，完成水稻种植范围提取、面积统与专题图制作。成果包括矢量边界、分类栅格、面积统计表和 A0 专题图。要求在 2026 年 9 月底前交付，中间需配合一次到两次数据质量评审。",
      contactName: "王工",
      contactPhone: "13812345678",
      contactEmail: "wangwei@example.com",
      company: "某省农业科学院",
      status: "published",
      allowDirectContact: true,
      viewCount: 128,
      createdAt: daysAgo(2),
      manageTokenHash: hashToken(DEMO_MANAGE_TOKEN),
    },
    {
      id: "seed-demand-2",
      title: "某市全域 0.5 米高分正射影像获取与数据生产",
      category: "IMAGE_ACQUISITION",
      region: "华东某地级市全域",
      area: "约 8600 平方公里",
      resolution: "0.5m",
      timeRange: "2026 年内完成拍摄与交付",
      deadlineAt: daysAhead(120),
      budget: "OVER_200K",
      description:
        "需要获取该市全域 0.5 米分辨率彩色正射影像（DOM），含航空或卫星拍摄、空三加密、DEM 编辑、正射纠正与镶嵌裁切，成果按 1:2000 图幅分幅交付，元数据齐全。供应商需具备测绘航空摄影资质，能提供项目案例，签订保密协议。",
      contactName: "李工",
      contactPhone: "13998765432",
      contactEmail: "liengineer@example.com",
      company: "市自然资源局信息中心",
      status: "published",
      allowDirectContact: true,
      viewCount: 96,
      createdAt: daysAgo(4),
    },
    {
      id: "seed-demand-3",
      title: "基于多源遥感影像的城市违建变化检测模型训练",
      category: "MODEL_TRAINING",
      region: "华南某省会",
      area: "主城区约 1200 平方公里",
      resolution: "优于 2m",
      timeRange: "2026 年 Q1–Q2",
      deadlineAt: daysAhead(45),
      budget: "BETWEEN_10K_50K",
      description:
        "已有历年高分影像与标注样本，需要合作方完成变化检测模型的训练与调优，支持双期影像输入、输出变化矢量与置信度图。验收以测试集 F1 不低于 0.85 为标准，需交付模型文件、训练代码与推理服务接口文档，支持本地化部署。",
      contactName: "陈工",
      contactPhone: "13655558888",
      contactEmail: "chenhao@example.com",
      company: "某智慧城市科技公司",
      status: "published",
      allowDirectContact: false,
      viewCount: 73,
      createdAt: daysAgo(6),
    },
    {
      id: "seed-demand-4",
      title: "矿山生态修复区多时相遥感动态监测数据处理",
      category: "DATA_PROCESSING",
      region: "西南某矿区",
      area: "约 420 平方公里",
      resolution: "10m–30m",
      timeRange: "2026 年 3 月起按季度监测",
      budget: "BETWEEN_10K_50K",
      description:
        "对矿山生态修复区域开展多时相遥感动态监测，包括影像预处理（辐射校正、大气校正、配准）、植被覆盖度与地表温度反演、复垦效果评价。需要每季度提交一期监测报告与分析图件，合作期一年，数据来源可使用开源或商业影像均可，费用包含影像采购预算。",
      contactName: "赵工",
      contactPhone: "13722224444",
      contactEmail: "zhaojing@example.com",
      company: "某地质环境监测院",
      status: "published",
      allowDirectContact: true,
      viewCount: 54,
      createdAt: daysAgo(9),
    },
    {
      id: "seed-demand-5",
      title: "流域水环境遥感反演与年度水质专题报告",
      category: "CHANGE_DETECTION",
      region: "淮河中游",
      area: "干流及主要支流",
      resolution: "10m–30m",
      timeRange: "2026 年全年",
      budget: "NEGOTIABLE",
      description:
        "面向河长制考核需求，基于多源卫星影像开展流域水环境遥感反演，重点监测水体透明度、悬浮物浓度与富营养化指数变化趋势，每月生成一期专题图，年底形成年度水质遥感评价报告，并提供历史数据对比分析与异常预警说明。",
      contactName: "孙工",
      contactPhone: "13511112222",
      contactEmail: "sunli@example.com",
      company: "流域水资源保护局",
      status: "pending",
      allowDirectContact: true,
      viewCount: 0,
      createdAt: daysAgo(0),
      verifyTokenHash: hashToken(DEMO_VERIFY_TOKEN),
      verifyExpiresAt: new Date(now + 24 * 60 * 60 * 1000),
    },
  ]

  for (const d of demands) {
    await prisma.demand.create({ data: d })
  }

  await prisma.inquiry.createMany({
    data: [
      {
        name: "张经理",
        phone: "13900001111",
        email: "zhang@example.com",
        message:
          "我们有成熟的高分影像采集渠道和 DOM 生产线，8600 平方公里 0.5 米成果 45 天内可交付，案例可现场考察。",
        demandId: "seed-demand-1",
        createdAt: daysAgo(1),
      },
      {
        name: "刘工",
        phone: "13900002222",
        email: "liu@example.com",
        message: "具备测绘航空摄影甲级资质，近三年在华东完成 3 个同类地市项目，报价可面谈。",
        demandId: "seed-demand-1",
        createdAt: daysAgo(2),
      },
    ],
  })

  await prisma.cooperation.create({
    data: {
      name: "示范数据厂商",
      company: "某卫星数据有限公司",
      phone: "13900003333",
      email: "bd@example.com",
      message: "希望接入贵平台，提供自有卫星星座数据授权与增值服务。",
      createdAt: daysAgo(3),
    },
  })

  console.log("种子数据已写入：5 条需求（4 已发布 / 1 待验证）、2 条咨询、1 条合作咨询")
  console.log(`演示管理链接: /manage/${DEMO_MANAGE_TOKEN}`)
  console.log(`演示验证链接: /verify/${DEMO_VERIFY_TOKEN}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), "config", "chart-config.json")

    try {
      const configData = await fs.readFile(configPath, "utf-8")
      return NextResponse.json(JSON.parse(configData))
    } catch (error) {
      // Return default config if file doesn't exist
      const defaultConfig = {
        chart: {
          type: "bar",
          title: "示例柱状图",
          xAxis: { label: "X轴", unit: "", range: [0, 100], useDecimal: true },
          yAxis: { label: "Y轴", unit: "单位", range: [0, 50], usePercent: false },
          showValue: true,
          valuePosition: "top",
        },
        style: {
          theme: "default",
          backgroundColor: "transparent",
        },
      }
      return NextResponse.json(defaultConfig)
    }
  } catch (error) {
    return NextResponse.json({ error: "配置文件读取失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()
    const configPath = path.join(process.cwd(), "config", "chart-config.json")

    // Ensure config directory exists
    await fs.mkdir(path.dirname(configPath), { recursive: true })

    await fs.writeFile(configPath, JSON.stringify(config, null, 2))
    return NextResponse.json({ success: true, message: "配置保存成功" })
  } catch (error) {
    return NextResponse.json({ error: "配置保存失败" }, { status: 500 })
  }
}

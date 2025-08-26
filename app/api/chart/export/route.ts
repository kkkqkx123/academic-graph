import { type NextRequest, NextResponse } from "next/server"

// Define TypeScript interfaces for better type safety
interface ChartBar {
  name: string;
  value: number;
}

interface ChartAxis {
  label: string;
  unit: string;
}

interface ChartConfig {
  title: string;
  bars: ChartBar[];
  xAxis: ChartAxis;
  yAxis: ChartAxis;
  showValue: boolean;
  valuePosition: "top" | "center";
}

interface ChartData {
  chart: ChartConfig;
}

export async function POST(request: NextRequest) {
  try {
    const { format, chartData, config } = await request.json()

    if (format === "svg") {
      // Generate SVG content based on chart data
      const svgContent = generateSVG(chartData, config)

      return new NextResponse(svgContent, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": 'attachment; filename="chart.svg"',
        },
      })
    } else if (format === "png") {
      // For PNG export, we'll need to use a library like puppeteer or canvas
      // For now, return a placeholder response
      return NextResponse.json({
        message: "PNG导出功能正在开发中，请使用SVG格式",
      })
    }

    return NextResponse.json({ error: "不支持的导出格式" }, { status: 400 })
  } catch (error) {
    // Log the actual error for debugging purposes
    console.error("Chart export error:", error)
    
    // Return a generic error message to avoid exposing sensitive information
    return NextResponse.json({
      error: "导出失败",
      // Include error details in development mode for debugging
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error)
      })
    }, { status: 500 })
  }
}

function generateSVG(chartData: ChartData, config: { chart: ChartConfig }): string {
  const { chart } = config
  const width = 800
  const height = 600
  const margin = { top: 50, right: 50, bottom: 100, left: 100 }
  const chartWidth = width - margin.left - margin.right
  const chartHeight = height - margin.top - margin.bottom

  const maxValue = Math.max(...chart.bars.map((bar: ChartBar) => bar.value))
  const barWidth = (chartWidth / chart.bars.length) * 0.8
  const barSpacing = (chartWidth / chart.bars.length) * 0.2

  let svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .chart-title { font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; }
        .axis-label { font-family: Arial, sans-serif; font-size: 14px; }
        .bar-label { font-family: Arial, sans-serif; font-size: 12px; }
        .bar { fill: #3b82f6; }
      </style>
      
      <!-- Chart Title -->
      <text x="${width / 2}" y="30" text-anchor="middle" class="chart-title">${chart.title}</text>
      
      <!-- Y Axis -->
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="black" stroke-width="1"/>
      
      <!-- X Axis -->
      <line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="black" stroke-width="1"/>
      
      <!-- Y Axis Label -->
      <text x="20" y="${height / 2}" text-anchor="middle" transform="rotate(-90, 20, ${height / 2})" class="axis-label">${chart.yAxis.label} ${chart.yAxis.unit}</text>
      
      <!-- X Axis Label -->
      <text x="${width / 2}" y="${height - 20}" text-anchor="middle" class="axis-label">${chart.xAxis.label} ${chart.xAxis.unit}</text>
  `

  // Draw bars
  chart.bars.forEach((bar: ChartBar, index: number) => {
    const x = margin.left + index * (barWidth + barSpacing) + barSpacing / 2
    const barHeight = (bar.value / maxValue) * chartHeight
    const y = height - margin.bottom - barHeight

    svgContent += `
      <!-- Bar ${index + 1} -->
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" class="bar"/>
      
      <!-- Bar Label -->
      <text x="${x + barWidth / 2}" y="${height - margin.bottom + 20}" text-anchor="middle" class="bar-label">${bar.name}</text>
    `

    if (chart.showValue) {
      const valueY = chart.valuePosition === "top" ? y - 5 : y + barHeight / 2
      svgContent += `
        <!-- Bar Value -->
        <text x="${x + barWidth / 2}" y="${valueY}" text-anchor="middle" class="bar-label">${bar.value}</text>
      `
    }
  })

  svgContent += "</svg>"
  return svgContent
}

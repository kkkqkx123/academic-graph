"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"
import type { ChartConfig } from "./chart-dashboard"

interface ChartBar {
  name: string
  value: number | number[]
  values?: number[]
  group?: string
  color?: string
  borderColor?: string
  borderWidth?: number
  width?: number
  segmentColors?: string[]
}

interface ChartRendererProps {
  config: ChartConfig
}

export function ChartRenderer({ config }: ChartRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [isRendering, setIsRendering] = useState(false)
  const [lastRenderTime, setLastRenderTime] = useState<Date | null>(null)

  const renderChart = () => {
    setIsRendering(true)

    // Clear previous renders
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }

    // Render SVG chart
    renderSVGChart()

    // Render Canvas chart for PNG export
    renderCanvasChart()

    setLastRenderTime(new Date())
    setIsRendering(false)
  }

  const renderSVGChart = () => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const { chart, style, labels } = config

    console.log("[v0] Chart type:", chart.type)
    console.log("[v0] Chart bars:", chart.bars)

    // Chart dimensions
    const width = 800
    const height = 600
    const margin = { top: 80, right: 60, bottom: 120, left: 100 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // Clear previous content
    svg.innerHTML = ""

    // Set SVG attributes
    svg.setAttribute("width", width.toString())
    svg.setAttribute("height", height.toString())
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)

    // Background
    if (style.backgroundColor !== "transparent") {
      const background = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      background.setAttribute("width", width.toString())
      background.setAttribute("height", height.toString())
      background.setAttribute("fill", style.backgroundColor)
      svg.appendChild(background)
    }

    const isStackedChart = chart.type === "stackedPercentage"
    console.log("[v0] Is stacked chart:", isStackedChart)

    let allBars: ChartBar[] = []
    let maxValue = 0

    if (isStackedChart) {
      // For stacked charts, use the bars directly and calculate total values
      if (chart.bars && Array.isArray(chart.bars)) {
        allBars = chart.bars.filter((bar) => {
          if (!bar) return false
          // For stacked charts, check if bar has values array OR convert single value to array
          if (Array.isArray(bar.values) && bar.values.length > 0) {
            return true
          } else if (typeof bar.value === "number") {
            bar.values = [bar.value]
            return true
          }
          return false
        })
        console.log("[v0] Filtered stacked bars:", allBars)
        // For stacked percentage, max value is always 100%
        maxValue = 100
      }
    } else {
      // Regular chart logic - handle both grouped and ungrouped bars
      if (chart.bars && Array.isArray(chart.bars)) {
        allBars = chart.bars
          .map((bar) => {
            if (!bar) return null

            // If bar has array values (from stacked mode), convert to single value
            if (Array.isArray(bar.value)) {
              const singleValue = bar.value.reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0)
              return { ...bar, value: singleValue }
            }

            // If bar has single value, keep as is
            if (typeof bar.value === "number") {
              return bar
            }

            return null
          })
          .filter((bar) => bar && typeof bar.value === "number")

        console.log("[v0] Using chart.bars directly:", allBars)
      }

      // If no valid bars found and groups exist, try group structure
      if (allBars.length === 0 && chart.groups && Array.isArray(chart.groups) && chart.groups.length > 0) {
        chart.groups.forEach((group) => {
          if (group && group.bars && Array.isArray(group.bars)) {
            const validBars = group.bars.filter((bar) => bar && typeof bar.value === "number")
            allBars = allBars.concat(validBars)
          }
        })
        console.log("[v0] Using group structure:", allBars)
      }

      const validValues = allBars.map((bar) => bar.value).filter((val) => typeof val === "number")
      maxValue = validValues.length > 0 ? Math.max(...validValues, chart.yAxis.range[1]) : chart.yAxis.range[1]
    }

    const minValue = Math.min(0, chart.yAxis.range[0])
    const valueRange = maxValue - minValue

    if (allBars.length === 0) {
      console.log("[v0] No valid bars to render")
      // Create a message indicating no data
      const noDataText = document.createElementNS("http://www.w3.org/2000/svg", "text")
      noDataText.setAttribute("x", (width / 2).toString())
      noDataText.setAttribute("y", (height / 2).toString())
      noDataText.setAttribute("text-anchor", "middle")
      noDataText.setAttribute("fill", "#666")
      noDataText.textContent = "无数据可显示"
      svg.appendChild(noDataText)
      return
    }

    // ... existing code for chart setup, axes, labels, etc. ...

    // Create style element for academic themes
    const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style")
    styleElement.textContent = getAcademicStyles(style.theme)
    svg.appendChild(styleElement)

    // Chart title
    const title = document.createElementNS("http://www.w3.org/2000/svg", "text")
    title.setAttribute("x", (width / 2).toString())
    title.setAttribute("y", "40")
    title.setAttribute("text-anchor", "middle")
    title.setAttribute("class", "chart-title")
    title.textContent = chart.title
    svg.appendChild(title)

    // Y Axis
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line")
    yAxis.setAttribute("x1", margin.left.toString())
    yAxis.setAttribute("y1", margin.top.toString())
    yAxis.setAttribute("x2", margin.left.toString())
    yAxis.setAttribute("y2", (height - margin.bottom).toString())
    yAxis.setAttribute("class", "axis-line")
    svg.appendChild(yAxis)

    // X Axis
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line")
    xAxis.setAttribute("x1", margin.left.toString())
    xAxis.setAttribute("y1", (height - margin.bottom).toString())
    xAxis.setAttribute("x2", (width - margin.right).toString())
    xAxis.setAttribute("y2", (height - margin.bottom).toString())
    xAxis.setAttribute("class", "axis-line")
    svg.appendChild(xAxis)

    // Y Axis Label
    const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
    yLabel.setAttribute("x", "30")
    yLabel.setAttribute("y", (height / 2).toString())
    yLabel.setAttribute("text-anchor", "middle")
    yLabel.setAttribute("transform", `rotate(-90, 30, ${height / 2})`)
    yLabel.setAttribute("class", "axis-label")
    yLabel.textContent = `${chart.yAxis.label} ${chart.yAxis.unit}`.trim()
    svg.appendChild(yLabel)

    // X Axis Label
    const xLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
    xLabel.setAttribute("x", (width / 2).toString())
    xLabel.setAttribute("y", (height - 30).toString())
    xLabel.setAttribute("text-anchor", "middle")
    xLabel.setAttribute("class", "axis-label")
    xLabel.textContent = `${chart.xAxis.label} ${chart.xAxis.unit}`.trim()
    svg.appendChild(xLabel)

    // Y Axis Ticks and Labels
    const tickCount = 5
    for (let i = 0; i <= tickCount; i++) {
      const value = minValue + (valueRange * i) / tickCount
      const y = height - margin.bottom - (chartHeight * i) / tickCount

      // Tick line
      const tick = document.createElementNS("http://www.w3.org/2000/svg", "line")
      tick.setAttribute("x1", (margin.left - 5).toString())
      tick.setAttribute("y1", y.toString())
      tick.setAttribute("x2", margin.left.toString())
      tick.setAttribute("y2", y.toString())
      tick.setAttribute("class", "tick-line")
      svg.appendChild(tick)

      // Tick label
      const tickLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
      tickLabel.setAttribute("x", (margin.left - 10).toString())
      tickLabel.setAttribute("y", (y + 4).toString())
      tickLabel.setAttribute("text-anchor", "end")
      tickLabel.setAttribute("class", "tick-label")

      let displayValue = value.toString()
      if (isStackedChart || chart.yAxis.usePercent) {
        displayValue = `${value.toFixed(1)}%`
      } else if (chart.xAxis.useDecimal) {
        displayValue = value.toFixed(1)
      } else {
        displayValue = Math.round(value).toString()
      }

      tickLabel.textContent = displayValue
      svg.appendChild(tickLabel)

      // Grid line
      if (i > 0 && i < tickCount) {
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line")
        gridLine.setAttribute("x1", margin.left.toString())
        gridLine.setAttribute("y1", y.toString())
        gridLine.setAttribute("x2", (width - margin.right).toString())
        gridLine.setAttribute("y2", y.toString())
        gridLine.setAttribute("class", "grid-line")
        svg.appendChild(gridLine)
      }
    }

    if (isStackedChart && allBars.length > 0) {
      console.log("[v0] Rendering stacked chart with", allBars.length, "bars")
      const barSpacing = (chartWidth / allBars.length) * 0.3
      const barWidth = (chartWidth / allBars.length) * 0.7

      allBars.forEach((bar, barIndex) => {
        if (!bar || !Array.isArray(bar.values) || bar.values.length === 0) {
          console.log("[v0] Skipping invalid bar:", bar)
          return
        }

        console.log("[v0] Rendering bar", barIndex, "with values:", bar.values)

        const x = margin.left + barIndex * (barWidth + barSpacing) + barSpacing / 2
        const totalValue = bar.values.reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0)

        console.log("[v0] Total value for bar", barIndex, ":", totalValue)

        let cumulativeHeight = 0

        bar.values.forEach((value, segmentIndex) => {
          if (typeof value !== "number") return

          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0
          const segmentHeight = (percentage / 100) * chartHeight
          const y = height - margin.bottom - cumulativeHeight - segmentHeight

          console.log(
            "[v0] Segment",
            segmentIndex,
            "- value:",
            value,
            "percentage:",
            percentage,
            "height:",
            segmentHeight,
          )

          // Create segment rectangle
          const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
          rect.setAttribute("x", x.toString())
          rect.setAttribute("y", y.toString())
          rect.setAttribute("width", barWidth.toString())
          rect.setAttribute("height", segmentHeight.toString())

          // Use segment color if available
          if (bar.segmentColors && bar.segmentColors[segmentIndex]) {
            rect.setAttribute("fill", bar.segmentColors[segmentIndex])
          } else {
            rect.setAttribute("class", `bar bar-${segmentIndex % 5}`)
          }

          rect.setAttribute("stroke", style.borderColor || "#333")
          rect.setAttribute("stroke-width", (style.borderWidth || 1).toString())
          svg.appendChild(rect)

          cumulativeHeight += segmentHeight
        })

        // Bar label (name)
        const barLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
        barLabel.setAttribute("x", (x + barWidth / 2).toString())
        barLabel.setAttribute("y", (height - margin.bottom + 20).toString())
        barLabel.setAttribute("text-anchor", "middle")
        barLabel.setAttribute("class", "bar-label")
        barLabel.textContent = bar.name || ""
        svg.appendChild(barLabel)
      })
    } else {
      console.log("[v0] Rendering regular bars, total bars:", allBars.length)

      const validBars = allBars.filter((bar) => bar && typeof bar.value === "number" && bar.name)
      console.log("[v0] Valid bars for rendering:", validBars.length)

      if (validBars.length > 0) {
        // Group bars by their group property
        const groupedBars = new Map<string, any[]>()
        validBars.forEach((bar) => {
          const groupName = bar.group || "default"
          if (!groupedBars.has(groupName)) {
            groupedBars.set(groupName, [])
          }
          groupedBars.get(groupName)!.push(bar)
        })

        console.log("[v0] Grouped bars:", Array.from(groupedBars.entries()))

        // Calculate spacing and positioning
        const groups = Array.from(groupedBars.entries())
        const totalGroups = groups.length
        const totalBars = validBars.length

        // Get gap settings from config (with defaults)
        const intraGroupGap = config.chart.intraGroupGap || 10 // Gap within groups
        const interGroupGap = config.chart.interGroupGap || 30 // Gap between groups

        // Calculate available space and bar width
        const totalIntraGaps = totalBars - totalGroups // Gaps within all groups
        const totalInterGaps = totalGroups - 1 // Gaps between groups
        const totalGapSpace = totalIntraGaps * intraGroupGap + totalInterGaps * interGroupGap
        const availableBarSpace = chartWidth - totalGapSpace
        const barWidth = availableBarSpace / totalBars

        console.log("[v0] Group spacing - intra:", intraGroupGap, "inter:", interGroupGap, "barWidth:", barWidth)

        let currentX = margin.left

        groups.forEach(([groupName, groupBars], groupIndex) => {
          console.log("[v0] Rendering group:", groupName, "with", groupBars.length, "bars")

          groupBars.forEach((bar, barIndexInGroup) => {
            const barHeight = Math.max(0, ((bar.value - minValue) / valueRange) * chartHeight)
            const y = height - margin.bottom - barHeight

            const individualBarWidth = bar.width ? barWidth * bar.width : barWidth

            console.log(
              "[v0] Rendering bar:",
              bar.name,
              "at x:",
              currentX,
              "group:",
              groupName,
              "width:",
              individualBarWidth,
            )

            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
            rect.setAttribute("x", currentX.toString())
            rect.setAttribute("y", y.toString())
            rect.setAttribute("width", individualBarWidth.toString())
            rect.setAttribute("height", barHeight.toString())

            // Use individual bar color if available, otherwise use theme colors
            if (bar.color) {
              rect.setAttribute("fill", bar.color)
              rect.setAttribute("stroke", style.borderColor || "#333")
              rect.setAttribute("stroke-width", (style.borderWidth || 1).toString())
            } else {
              // Use a consistent color index based on the bar's position in the entire dataset
              const globalBarIndex = validBars.findIndex((b) => b === bar)
              rect.setAttribute("class", `bar bar-${globalBarIndex % 5}`)
            }

            svg.appendChild(rect)

            // Bar label (name)
            const barLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
            barLabel.setAttribute("x", (currentX + individualBarWidth / 2).toString())
            barLabel.setAttribute("y", (height - margin.bottom + 20).toString())
            barLabel.setAttribute("text-anchor", "middle")
            barLabel.setAttribute("class", "bar-label")
            barLabel.textContent = bar.name || ""
            svg.appendChild(barLabel)

            // Value label if enabled
            if (chart.showValue) {
              const valueLabel = document.createElementNS("http://www.w3.org/2000/svg", "text")
              valueLabel.setAttribute("x", (currentX + individualBarWidth / 2).toString())
              valueLabel.setAttribute("y", (y - 5).toString())
              valueLabel.setAttribute("text-anchor", "middle")
              valueLabel.setAttribute("class", "value-label")
              valueLabel.textContent = bar.value.toString()
              svg.appendChild(valueLabel)
            }

            // Move to next bar position
            currentX += individualBarWidth

            // Add intra-group gap if not the last bar in the group
            if (barIndexInGroup < groupBars.length - 1) {
              currentX += intraGroupGap
            }
          })

          // Add inter-group gap if not the last group
          if (groupIndex < groups.length - 1) {
            currentX += interGroupGap
          }
        })
      }
    }
  }

  const renderCanvasChart = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // This would be used for PNG export
    // For now, we'll keep it simple and focus on SVG rendering
    ctx.fillStyle = "#f0f0f0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#333"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Canvas rendering for PNG export", canvas.width / 2, canvas.height / 2)
  }

  const getAcademicStyles = (theme: string) => {
    const fontFamily = config.style.fontFamily || "times"
    const fontSize = config.style.fontSize || 12
    const borderWidth = config.style.borderWidth || 1
    const textColor = config.style.textColor || "#000"

    let fontFamilyCSS = "'Times New Roman', serif"
    switch (fontFamily) {
      case "arial":
        fontFamilyCSS = "Arial, sans-serif"
        break
      case "helvetica":
        fontFamilyCSS = "Helvetica, Arial, sans-serif"
        break
      case "calibri":
        fontFamilyCSS = "Calibri, Arial, sans-serif"
        break
    }

    const baseStyles = `
      .chart-title { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize + 6}px; 
        font-weight: bold; 
        fill: ${textColor}; 
      }
      .axis-label { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize + 2}px; 
        fill: ${textColor}; 
      }
      .tick-label { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize}px; 
        fill: ${textColor}; 
      }
      .bar-label { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize}px; 
        fill: ${textColor}; 
      }
      .value-label { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize - 1}px; 
        font-weight: bold; 
        fill: ${textColor}; 
      }
      .value-label-middle { 
        font-family: ${fontFamilyCSS}; 
        font-size: ${fontSize - 1}px; 
        font-weight: bold; 
        fill: #fff; 
      }
      .axis-line { 
        stroke: ${textColor}; 
        stroke-width: ${borderWidth + 0.5}; 
      }
      .tick-line { 
        stroke: ${textColor}; 
        stroke-width: ${borderWidth}; 
      }
      .grid-line { 
        stroke: #ddd; 
        stroke-width: ${config.style.gridThickness || 0.5}px; 
        stroke-opacity: ${config.style.gridOpacity || 0.3}; 
        stroke-dasharray: 2,2; 
        display: ${config.style.showGrid === false ? "none" : "block"};
      }
    `

    if (theme === "grayscale") {
      const chartBars = config.chart.bars && Array.isArray(config.chart.bars) ? config.chart.bars : []
      if (chartBars.length === 0) {
        return baseStyles // Return base styles if no bars available
      }

      const validBars = chartBars.filter((bar) => bar && typeof bar.value === "number")
      if (validBars.length === 0) {
        return baseStyles // Return base styles if no valid bars
      }

      const maxValue = Math.max(...validBars.map((bar) => bar.value))
      const minValue = Math.min(...validBars.map((bar) => bar.value))
      const valueRange = maxValue - minValue || 1 // Avoid division by zero

      let grayscaleStyles = baseStyles
      validBars.forEach((bar, index) => {
        const intensity = valueRange > 0 ? (bar.value - minValue) / valueRange : 0.5
        const grayValue = Math.round(255 - intensity * 180) // Range from 75 to 255
        const grayColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`

        grayscaleStyles += `
          .bar-${index} { fill: ${grayColor}; stroke: #333; stroke-width: ${borderWidth}; }
        `
      })
      return grayscaleStyles
    }

    switch (theme) {
      case "nature":
        return (
          baseStyles +
          `
          .bar-0 { fill: #1f77b4; }
          .bar-1 { fill: #ff7f0e; }
          .bar-2 { fill: #2ca02c; }
          .bar-3 { fill: #d62728; }
          .bar-4 { fill: #9467bd; }
        `
        )
      case "science":
        return (
          baseStyles +
          `
          .bar-0 { fill: #2E86AB; }
          .bar-1 { fill: #A23B72; }
          .bar-2 { fill: #F18F01; }
          .bar-3 { fill: #C73E1D; }
          .bar-4 { fill: #592E83; }
        `
        )
      case "ieee":
        return (
          baseStyles +
          `
          .bar-0 { fill: #0072CE; }
          .bar-1 { fill: #00A651; }
          .bar-2 { fill: #ED1C24; }
          .bar-3 { fill: #FF8200; }
          .bar-4 { fill: #732982; }
        `
        )
      case "minimal":
        return (
          baseStyles +
          `
          .bar-0, .bar-1, .bar-2, .bar-3, .bar-4 { 
            fill: white; 
            stroke: ${textColor}; 
            stroke-width: ${borderWidth + 1}; 
          }
        `
        )
      case "plos":
        return (
          baseStyles +
          `
          .bar-0 { fill: #1B9E77; }
          .bar-1 { fill: #D95F02; }
          .bar-2 { fill: #7570B3; }
          .bar-3 { fill: #E7298A; }
          .bar-4 { fill: #66A61E; }
        `
        )
      case "cell":
        return (
          baseStyles +
          `
          .bar-0 { fill: #E31A1C; }
          .bar-1 { fill: #1F78B4; }
          .bar-2 { fill: #33A02C; }
          .bar-3 { fill: #FF7F00; }
          .bar-4 { fill: #6A3D9A; }
        `
        )
      case "nejm":
        return (
          baseStyles +
          `
          .bar-0 { fill: #B2182B; }
          .bar-1 { fill: #2166AC; }
          .bar-2 { fill: #5AAE61; }
          .bar-3 { fill: #F46D43; }
          .bar-4 { fill: #762A83; }
        `
        )
      default:
        return (
          baseStyles +
          `
          .bar-0 { fill: #3b82f6; }
          .bar-1 { fill: #ef4444; }
          .bar-2 { fill: #10b981; }
          .bar-3 { fill: #f59e0b; }
          .bar-4 { fill: #8b5cf6; }
        `
        )
    }
  }

  const exportSVG = () => {
    if (!svgRef.current) return

    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const downloadLink = document.createElement("a")
    downloadLink.href = svgUrl
    downloadLink.download = `${config.chart.title || "chart"}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(svgUrl)
  }

  const exportPNG = async () => {
    if (!svgRef.current) return

    try {
      const response = await fetch("/api/chart/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "png",
          chartData: config.chart,
          config: config,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const downloadLink = document.createElement("a")
        downloadLink.href = url
        downloadLink.download = `${config.chart.title || "chart"}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        URL.revokeObjectURL(url)
      } else {
        const error = await response.json()
        alert(error.message || "PNG导出失败")
      }
    } catch (error) {
      alert("PNG导出失败")
    }
  }

  // Auto-render when config changes
  useEffect(() => {
    renderChart()
  }, [config])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            图表预览
            <div className="flex items-center space-x-2">
              <Button onClick={renderChart} disabled={isRendering} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRendering ? "animate-spin" : ""}`} />
                {isRendering ? "渲染中..." : "重新渲染"}
              </Button>
              <Button onClick={exportSVG} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出SVG
              </Button>
              <Button onClick={exportPNG} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出PNG
              </Button>
            </div>
          </CardTitle>
          {lastRenderTime && (
            <p className="text-sm text-muted-foreground">最后渲染时间: {lastRenderTime.toLocaleString("zh-CN")}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-white">
            <svg ref={svgRef} className="w-full h-auto max-w-4xl mx-auto" style={{ maxHeight: "600px" }} />
          </div>

          {/* Hidden canvas for PNG export */}
          <canvas ref={canvasRef} className="hidden" width={800} height={600} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>渲染说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• 图表会根据配置自动更新，也可以手动点击"重新渲染"按钮</p>
          <p>• 支持导出SVG格式（矢量图，适合学术论文）和PNG格式（位图）</p>
          <p>• 图表样式遵循学术期刊标准，使用Times New Roman字体</p>
          <p>• 背景保持透明，便于在文档中使用</p>
          <p>• 支持多种配色方案：Nature、Science、IEEE等期刊风格</p>
          <p>• 新增灰度主题，根据条形图值生成灰度颜色</p>
          <p>• 新增堆叠百分比图表类型</p>
        </CardContent>
      </Card>
    </div>
  )
}

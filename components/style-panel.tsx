"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Palette, Eye, Download } from "lucide-react"
import type { ChartConfig } from "./chart-dashboard"

interface StylePanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

const academicThemes = {
  default: {
    name: "默认样式",
    description: "通用的学术图表样式",
    colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
    journal: "通用",
  },
  nature: {
    name: "Nature期刊",
    description: "Nature期刊推荐的配色方案",
    colors: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"],
    journal: "Nature",
  },
  science: {
    name: "Science期刊",
    description: "Science期刊风格的专业配色",
    colors: ["#2E86AB", "#A23B72", "#F18F01", "#C73E1D", "#592E83"],
    journal: "Science",
  },
  ieee: {
    name: "IEEE标准",
    description: "IEEE期刊标准配色方案",
    colors: ["#0072CE", "#00A651", "#ED1C24", "#FF8200", "#732982"],
    journal: "IEEE",
  },
  minimal: {
    name: "极简风格",
    description: "黑色边框，白色内部的极简学术风格",
    colors: ["#000000", "#666666", "#999999", "#cccccc", "#333333"],
    journal: "Minimal",
  },
  grayscale: {
    name: "灰度风格",
    description: "基于数值大小显示不同灰度深浅的风格",
    colors: ["#1a1a1a", "#404040", "#666666", "#8c8c8c", "#b3b3b3"],
    journal: "Grayscale",
  },
  plos: {
    name: "PLOS期刊",
    description: "PLOS系列期刊推荐配色",
    colors: ["#1B9E77", "#D95F02", "#7570B3", "#E7298A", "#66A61E"],
    journal: "PLOS",
  },
  cell: {
    name: "Cell期刊",
    description: "Cell期刊系列专业配色",
    colors: ["#E31A1C", "#1F78B4", "#33A02C", "#FF7F00", "#6A3D9A"],
    journal: "Cell",
  },
  nejm: {
    name: "NEJM医学",
    description: "新英格兰医学杂志风格",
    colors: ["#B2182B", "#2166AC", "#5AAE61", "#F46D43", "#762A83"],
    journal: "NEJM",
  },
}

const backgroundOptions = [
  { value: "transparent", label: "透明背景", description: "适合插入文档" },
  { value: "#ffffff", label: "白色背景", description: "标准学术背景" },
  { value: "#f8f9fa", label: "浅灰背景", description: "柔和的背景色" },
  { value: "#f0f0f0", label: "中性灰背景", description: "中性背景色" },
]

const fontOptions = [
  { value: "times", label: "Times New Roman", description: "经典学术字体" },
  { value: "arial", label: "Arial", description: "现代无衬线字体" },
  { value: "helvetica", label: "Helvetica", description: "专业无衬线字体" },
  { value: "calibri", label: "Calibri", description: "现代易读字体" },
]

export function StylePanel({ config, onConfigChange }: StylePanelProps) {
  const updateStyle = (key: string, value: string | number | boolean) => {
    const newConfig = {
      ...config,
      style: {
        ...config.style,
        [key]: value,
      },
    }
    onConfigChange(newConfig)
  }



  const applyTheme = (themeKey: string) => {
    updateStyle("theme", themeKey)
  }

  const exportStyleConfig = () => {
    const styleConfig = {
      theme: config.style.theme,
      backgroundColor: config.style.backgroundColor,
      chartBackgroundColor: config.style.chartBackgroundColor,
      // Add more style properties as needed
    }

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<styles>
  <theme>${styleConfig.theme}</theme>
  <background-color>${styleConfig.backgroundColor}</background-color>
  <chart-background-color>${styleConfig.chartBackgroundColor}</chart-background-color>
</styles>`

    const blob = new Blob([xmlContent], { type: "application/xml" })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `style-${styleConfig.theme}.xml`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const currentTheme = academicThemes[config.style.theme as keyof typeof academicThemes] || academicThemes.default

  return (
    <div className="space-y-6">
      {/* 主题选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            学术期刊主题
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(academicThemes).map(([key, theme]) => (
              <div
                key={key}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  config.style.theme === key ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => applyTheme(key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{theme.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {theme.journal}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{theme.description}</p>
                <div className="flex space-x-1">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-sm border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">当前主题：{currentTheme.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{currentTheme.description}</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm">配色预览：</span>
              <div className="flex space-x-1">
                {currentTheme.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 背景设置 */}
      <Card>
        <CardHeader>
          <CardTitle>背景设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="background-select">页面背景颜色</Label>
            <Select
              value={config.style.backgroundColor}
              onValueChange={(value) => updateStyle("backgroundColor", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{
                          backgroundColor: option.value === "transparent" ? "#fff" : option.value,
                          backgroundImage:
                            option.value === "transparent"
                              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                              : "none",
                          backgroundSize: option.value === "transparent" ? "8px 8px" : "auto",
                          backgroundPosition:
                            option.value === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "auto",
                        }}
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">选择整个页面的背景颜色。透明背景适合插入到文档中。</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-bg">自定义页面背景色</Label>
            <div className="flex space-x-2">
              <Input
                id="custom-bg"
                type="color"
                value={config.style.backgroundColor === "transparent" ? "#ffffff" : config.style.backgroundColor}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={config.style.backgroundColor}
                onChange={(e) => updateStyle("backgroundColor", e.target.value)}
                placeholder="#ffffff 或 transparent"
                className="flex-1"
              />
            </div>
          </div>

          {/* 图表背景颜色选项 */}
          <Separator />

          <div className="space-y-2">
            <Label htmlFor="chart-bg-select">图表背景颜色</Label>
            <Select
              value={config.style.chartBackgroundColor || "transparent"}
              onValueChange={(value) => updateStyle("chartBackgroundColor", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {backgroundOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{
                          backgroundColor: option.value === "transparent" ? "#fff" : option.value,
                          backgroundImage:
                            option.value === "transparent"
                              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                              : "none",
                          backgroundSize: option.value === "transparent" ? "8px 8px" : "auto",
                          backgroundPosition:
                            option.value === "transparent" ? "0 0, 0 4px, 4px -4px, -4px 0px" : "auto",
                        }}
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">选择图表区域的背景颜色，独立于页面背景。</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-chart-bg">自定义图表背景色</Label>
            <div className="flex space-x-2">
              <Input
                id="custom-chart-bg"
                type="color"
                value={
                  config.style.chartBackgroundColor === "transparent"
                    ? "#ffffff"
                    : config.style.chartBackgroundColor || "#ffffff"
                }
                onChange={(e) => updateStyle("chartBackgroundColor", e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={config.style.chartBackgroundColor || "transparent"}
                onChange={(e) => updateStyle("chartBackgroundColor", e.target.value)}
                placeholder="#ffffff 或 transparent"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 高级样式设置 */}
      <Card>
        <CardHeader>
          <CardTitle>高级样式设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font-family">字体系列</Label>
            <Select
              value={config.style.fontFamily || "times"}
              onValueChange={(value) => updateStyle("fontFamily", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="border-width">边框宽度</Label>
              <Input
                id="border-width"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={config.style.borderWidth || 1}
                onChange={(e) => updateStyle("borderWidth", Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">基础字体大小</Label>
              <Input
                id="font-size"
                type="number"
                min="8"
                max="24"
                value={config.style.fontSize || 12}
                onChange={(e) => updateStyle("fontSize", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-grid"
              checked={config.style.showGrid !== false}
              onCheckedChange={(checked) => updateStyle("showGrid", checked)}
            />
            <Label htmlFor="show-grid">显示网格线</Label>
            <p className="text-sm text-muted-foreground">启用后将显示辅助网格线</p>
          </div>

          {config.style.showGrid !== false && (
            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="grid-opacity">网格线透明度</Label>
                <Input
                  id="grid-opacity"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={(config.style as unknown as Record<string, number>).gridOpacity || 0.3}
                  onChange={(e) => updateStyle("gridOpacity", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">0.0 (完全透明) - 1.0 (完全不透明)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grid-thickness">网格线粗细</Label>
                <Input
                  id="grid-thickness"
                  type="number"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={(config.style as unknown as Record<string, number>).gridThickness || 0.5}
                  onChange={(e) => updateStyle("gridThickness", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">线条粗细 (像素)</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="show-border"
              checked={config.style.showBorder !== false}
              onCheckedChange={(checked) => updateStyle("showBorder", checked)}
            />
            <Label htmlFor="show-border">显示图表边框</Label>
            <p className="text-sm text-muted-foreground">为整个图表添加边框</p>
          </div>
        </CardContent>
      </Card>

      {/* 导出样式配置 */}
      <Card>
        <CardHeader>
          <CardTitle>样式配置管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={exportStyleConfig} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              导出当前样式配置
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              预览所有主题
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">导出的XML文件可以在其他项目中重复使用，或与同事分享样式配置。</p>

          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">样式使用建议</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Nature/Science主题适合生物医学类论文</li>
              <li>• IEEE主题适合工程技术类论文</li>
              <li>• 极简主题适合数学统计类论文</li>
              <li>• 透明背景便于插入到LaTeX文档中</li>
              <li>• Times New Roman字体是大多数期刊的标准要求</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

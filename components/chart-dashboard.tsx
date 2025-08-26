"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartConfigPanel } from "./chart-config-panel"
import { ChartRenderer } from "./chart-renderer"
import { DataImportPanel } from "./data-import-panel"
import { StylePanel } from "./style-panel"
import { FileManagementPanel } from "./file-management-panel"
import { LabelPanel } from "./label-panel"

export interface CsvRow {
  [key: string]: string | number | boolean | null | undefined
}

export interface ChartConfig {
  chart: {
    type: "bar" | "stacked-percentage"
    title: string
    titleFont?: {
      family?: string
      size?: number
      color?: string
    }
    xAxis: {
      label: string
      unit: string
      range: [number, number]
      useDecimal: boolean
      treatAsNumeric: boolean // Added to clarify numeric vs string treatment
      fontFamily?: string
      fontSize?: number
      color?: string
    }
    yAxis: {
      label: string
      unit: string
      range: [number, number]
      usePercent: boolean
      treatAsNumeric: boolean
      fontFamily?: string
      fontSize?: number
      color?: string
    }
    bars: Array<{
      name: string
      value: number | number[] // Support for stacked data
      color?: string
      borderColor?: string
      borderWidth?: number
      fillPattern?: "solid" | "grid" | "diagonal" | "hollow"
      width?: number
      shape?: "rectangle" | "rounded"
      group?: string
      segmentColors?: string[] // Changed from stackColors to segmentColors to match usage
    }>
    groups?: Array<{
      name: string
      color?: string
    }>
    barGaps: {
      intraGroup: number
      interGroup: number
    }
    gridLines: {
      opacity: number
      thickness: number
    }
    globalLimits: {
      min: number
      max: number
      enabled: boolean
    }
    showValue?: boolean
    showDataLabels?: boolean
    dataLabelFont?: {
      family?: string
      size?: number
      color?: string
    }
    valuePosition?: "top" | "middle"
  }
  labels: Array<{
    id: string
    text: string
    scope: "global" | string // "global" or column name like "column1", "column2"
    fontFamily: string
    fontSize: number
    color: string
    autoLineBreak: boolean
    smartLineBreak: boolean
    maxCharsPerLine?: number
  }>
  style: {
    theme: string
    backgroundColor: string
    chartBackgroundColor?: string
    fontFamily?: string
    fontSize?: number
    borderWidth?: number
    showGrid?: boolean
    showBorder?: boolean
  }
}

const defaultConfig: ChartConfig = {
  chart: {
    type: "bar",
    title: "示例柱状图",
    xAxis: {
      label: "X轴",
      unit: "",
      range: [0, 100],
      useDecimal: true,
      treatAsNumeric: true,
    },
    yAxis: {
      label: "Y轴",
      unit: "单位",
      range: [0, 50],
      usePercent: false,
      treatAsNumeric: true,
    },
    bars: [
      { name: "A", value: 10, group: "group1" },
      { name: "B", value: 20, group: "group1" },
      { name: "C", value: 30, group: "group2" },
    ],
    groups: [
      { name: "group1", color: "#3b82f6" },
      { name: "group2", color: "#ef4444" },
    ],
    barGaps: {
      intraGroup: 0.1,
      interGroup: 0.3,
    },
    gridLines: {
      opacity: 0.3,
      thickness: 1,
    },
    globalLimits: {
      min: 0,
      max: 100,
      enabled: false,
    },
  },
  labels: [
    {
      id: "label1",
      text: "示例标签",
      scope: "global",
      fontFamily: "times",
      fontSize: 12,
      color: "#000000",
      autoLineBreak: false,
      smartLineBreak: false,
    },
  ],
  style: {
    theme: "default",
    backgroundColor: "transparent",
    chartBackgroundColor: "transparent",
  },
}

export function ChartDashboard() {
  const [config, setConfig] = useState<ChartConfig>(defaultConfig)
  const [csvData, setCsvData] = useState<CsvRow[]>([])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">柱状图可视化工具</CardTitle>
          <p className="text-muted-foreground">专业的柱状图生成工具，支持学术论文级别的图表样式</p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="config">图表配置</TabsTrigger>
          <TabsTrigger value="data">数据导入</TabsTrigger>
          <TabsTrigger value="labels">标签管理</TabsTrigger>
          <TabsTrigger value="style">样式设置</TabsTrigger>
          <TabsTrigger value="files">文件管理</TabsTrigger>
          <TabsTrigger value="preview">预览渲染</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <ChartConfigPanel config={config} onConfigChange={setConfig} />
        </TabsContent>

        <TabsContent value="data">
          <DataImportPanel config={config} onConfigChange={setConfig} csvData={csvData} onCsvDataChange={setCsvData} />
        </TabsContent>

        <TabsContent value="labels">
          <LabelPanel config={config} onConfigChange={setConfig} />
        </TabsContent>

        <TabsContent value="style">
          <StylePanel config={config} onConfigChange={setConfig} />
        </TabsContent>

        <TabsContent value="files">
          <FileManagementPanel config={config} onConfigChange={setConfig} />
        </TabsContent>

        <TabsContent value="preview">
          <ChartRenderer config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

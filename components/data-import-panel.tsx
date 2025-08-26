"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, FileText, Database, AlertCircle, CheckCircle } from "lucide-react"
import type { ChartConfig, CsvRow } from "./chart-dashboard"

interface DataImportPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
  csvData: CsvRow[]
  onCsvDataChange: (data: CsvRow[]) => void
}

export function DataImportPanel({ config, onConfigChange, csvData, onCsvDataChange }: DataImportPanelProps) {
  const [csvText, setCsvText] = useState("")
  const [xmlText, setXmlText] = useState("")
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Utility function to safely extract error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      return error.message
    }
    return '发生未知错误'
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setImportStatus({ type: null, message: "" })

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/data/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        if (file.name.endsWith(".csv")) {
          onCsvDataChange(result.data.data)
          setCsvText(await file.text())

          // Auto-convert CSV data to chart bars
          if (result.data.data.length > 0) {
            const firstRow = result.data.data[0]
            const nameField = Object.keys(firstRow)[0]
            const valueField = Object.keys(firstRow)[1]

            if (nameField && valueField) {
              const newBars = result.data.data.map((row: CsvRow) => ({
                name: row[nameField]?.toString() || "",
                value: Number(row[valueField]) || 0,
              }))

              const newConfig = {
                ...config,
                chart: {
                  ...config.chart,
                  bars: newBars,
                },
              }
              onConfigChange(newConfig)
            }
          }
        } else if (file.name.endsWith(".xml")) {
          setXmlText(await file.text())

          // Apply XML style configuration
          const newConfig = {
            ...config,
            style: {
              ...config.style,
              theme: result.data.theme || config.style.theme,
              backgroundColor: result.data.backgroundColor || config.style.backgroundColor,
            },
          }
          onConfigChange(newConfig)
        }

        setImportStatus({
          type: "success",
          message: result.message,
        })
      } else {
        setImportStatus({
          type: "error",
          message: result.error || "文件导入失败",
        })
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `文件上传失败，请检查网络连接: ${getErrorMessage(error)}`,
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleTextImport = (text: string, type: "csv" | "xml") => {
    setImportStatus({ type: null, message: "" })

    try {
      if (type === "csv") {
        const csvData = parseCSVText(text)
        onCsvDataChange(csvData)

        // Auto-convert to chart bars
        if (csvData.length > 0) {
          const firstRow = csvData[0]
          const keys = Object.keys(firstRow)
          const nameField = keys[0]
          const valueField = keys[1]

          if (nameField && valueField) {
            const newBars = csvData.map((row: CsvRow) => ({
              name: row[nameField]?.toString() || "",
              value: Number(row[valueField]) || 0,
            }))

            const newConfig = {
              ...config,
              chart: {
                ...config.chart,
                bars: newBars,
              },
            }
            onConfigChange(newConfig)
          }
        }

        setImportStatus({
          type: "success",
          message: `成功导入 ${csvData.length} 行CSV数据`,
        })
      } else if (type === "xml") {
        const xmlData = parseXMLText(text)

        const newConfig = {
          ...config,
          style: {
            ...config.style,
            theme: xmlData.theme || config.style.theme,
            backgroundColor: xmlData.backgroundColor || config.style.backgroundColor,
          },
        }
        onConfigChange(newConfig)

        setImportStatus({
          type: "success",
          message: "成功导入XML样式配置",
        })
      }
    } catch (error) {
      setImportStatus({
        type: "error",
        message: `${type.toUpperCase()}格式解析失败，请检查格式是否正确: ${getErrorMessage(error)}`,
      })
    }
  }

  const parseCSVText = (text: string) => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) throw new Error("CSV数据不足")

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const row: CsvRow = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""
        row[header] = isNaN(Number(value)) ? value : Number(value)
      })

      data.push(row)
    }

    return data
  }

  const parseXMLText = (text: string) => {
    const themeMatch = text.match(/<theme>(.*?)<\/theme>/)
    const backgroundMatch = text.match(/<background-color>(.*?)<\/background-color>/)

    return {
      theme: themeMatch ? themeMatch[1] : "default",
      backgroundColor: backgroundMatch ? backgroundMatch[1] : "transparent",
    }
  }

  const exportCurrentConfig = () => {
    const configData = JSON.stringify(config, null, 2)
    const blob = new Blob([configData], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = "chart-config.json"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const exportCSVTemplate = () => {
    const csvTemplate = `Name,Value1,Value2
A,10,20
B,20,30
C,30,40
D,25,35`

    const blob = new Blob([csvTemplate], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = "data-template.csv"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const exportXMLTemplate = () => {
    const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<styles>
  <theme>nature</theme>
  <background-color>transparent</background-color>
</styles>`

    const blob = new Blob([xmlTemplate], { type: "application/xml" })
    const url = URL.createObjectURL(blob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = "style-template.xml"
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Import Status */}
      {importStatus.type && (
        <Alert
          className={importStatus.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
        >
          {importStatus.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={importStatus.type === "success" ? "text-green-800" : "text-red-800"}>
            {importStatus.message}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">文件上传</TabsTrigger>
          <TabsTrigger value="text">文本导入</TabsTrigger>
          <TabsTrigger value="export">导出模板</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>文件上传导入</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">选择文件</Label>
                <div className="flex items-center space-x-2">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept=".csv,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "上传中..." : "选择CSV或XML文件"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  支持CSV数据文件和XML样式配置文件。CSV文件将自动转换为图表数据，XML文件将应用样式设置。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    CSV数据格式
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• 第一行为列名（标题行）</p>
                    <p>• 第一列为柱子名称</p>
                    <p>• 第二列为数值</p>
                    <p>• 支持多列数值（暂时使用第二列）</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    XML样式格式
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• &lt;theme&gt;主题名称&lt;/theme&gt;</p>
                    <p>• &lt;background-color&gt;背景色&lt;/background-color&gt;</p>
                    <p>• 支持的主题：default, nature, science, ieee, minimal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CSV文本导入</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-text">CSV数据</Label>
                  <Textarea
                    id="csv-text"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Name,Value&#10;A,10&#10;B,20&#10;C,30"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">直接粘贴CSV格式的数据</p>
                </div>
                <Button onClick={() => handleTextImport(csvText, "csv")} className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  导入CSV数据
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>XML样式导入</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="xml-text">XML配置</Label>
                  <Textarea
                    id="xml-text"
                    value={xmlText}
                    onChange={(e) => setXmlText(e.target.value)}
                    placeholder="<styles>&#10;  <theme>nature</theme>&#10;  <background-color>transparent</background-color>&#10;</styles>"
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground">直接粘贴XML格式的样式配置</p>
                </div>
                <Button onClick={() => handleTextImport(xmlText, "xml")} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  导入XML样式
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>导出模板和配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">模板文件</h4>
                  <div className="space-y-2">
                    <Button onClick={exportCSVTemplate} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      下载CSV模板
                    </Button>
                    <Button onClick={exportXMLTemplate} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      下载XML模板
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">下载标准格式的模板文件，可以作为参考或直接使用</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">当前配置</h4>
                  <div className="space-y-2">
                    <Button onClick={exportCurrentConfig} variant="outline" className="w-full bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      导出当前配置
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    导出当前的完整图表配置为JSON文件，可以用于备份或分享配置
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">当前数据预览</h4>
                {csvData.length > 0 ? (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium mb-2">已导入 {csvData.length} 行数据：</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {csvData.slice(0, 3).map((row, index) => (
                        <div key={index}>
                          {Object.entries(row)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(", ")}
                        </div>
                      ))}
                      {csvData.length > 3 && <div>... 还有 {csvData.length - 3} 行</div>}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">暂无导入的数据</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

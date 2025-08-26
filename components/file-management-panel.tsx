"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Calendar,
  HardDrive,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import type { ChartConfig } from "./chart-dashboard"

interface FileManagementPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

interface Project {
  id: string
  name: string
  filename: string
  lastModified: string
  size: number
  config: ChartConfig
}

export function FileManagementPanel({ config, onConfigChange }: FileManagementPanelProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

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

  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/files")
      const result = await response.json()

      if (result.success) {
        setProjects(result.projects)
      } else {
        setStatus({ type: "error", message: result.error || "加载项目失败" })
      }
    } catch (error) {
      setStatus({ type: "error", message: `网络错误，请检查连接: ${getErrorMessage(error)}` })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveProject = useCallback(async () => {
    if (!projectName.trim()) {
      setStatus({ type: "error", message: "请输入项目名称" })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName.trim(),
          config: config,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setStatus({ type: "success", message: result.message })
        setProjectName("")
        await loadProjects()
      } else {
        setStatus({ type: "error", message: result.error || "保存失败" })
      }
    } catch (error) {
      setStatus({ type: "error", message: `保存失败，请检查网络连接: ${getErrorMessage(error)}` })
    } finally {
      setIsLoading(false)
    }
  }, [config, projectName, loadProjects])

  const loadProject = useCallback(async (projectId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/files/${projectId}`)
      const result = await response.json()

      if (result.success) {
        onConfigChange(result.config)
        setStatus({ type: "success", message: "项目加载成功" })
      } else {
        setStatus({ type: "error", message: result.error || "加载失败" })
      }
    } catch (error) {
      setStatus({ type: "error", message: `加载失败，请检查网络连接: ${getErrorMessage(error)}` })
    } finally {
      setIsLoading(false)
    }
  }, [onConfigChange])

  const deleteProject = useCallback(async (projectId: string) => {
    if (!confirm("确定要删除这个项目吗？此操作不可撤销。")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/files/${projectId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setStatus({ type: "success", message: result.message })
        await loadProjects()
      } else {
        setStatus({ type: "error", message: result.error || "删除失败" })
      }
    } catch (error) {
      setStatus({ type: "error", message: `删除失败，请检查网络连接: ${getErrorMessage(error)}` })
    } finally {
      setIsLoading(false)
    }
  }, [loadProjects])

  const exportProject = (project: Project) => {
    const dataStr = JSON.stringify(project.config, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `${project.name}.json`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {status.type && (
        <Alert className={status.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {status.type === "success" ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={status.type === "success" ? "text-green-800" : "text-red-800"}>
            {status.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Save Current Project */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="h-5 w-5 mr-2" />
            保存当前项目
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">项目名称</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="输入项目名称"
              onKeyDown={(e) => e.key === "Enter" && saveProject()}
            />
            <p className="text-sm text-muted-foreground">为当前的图表配置起一个有意义的名称，便于后续查找和管理</p>
          </div>

          <Button onClick={saveProject} disabled={isLoading || !projectName.trim()} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "保存中..." : "保存项目"}
          </Button>

          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">当前配置预览</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• 图表标题: {config.chart.title}</p>
              <p>• 柱子数量: {config.chart.bars.length}</p>
              <p>• 样式主题: {config.style.theme}</p>
              <p>• 背景颜色: {config.style.backgroundColor}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              项目管理
            </div>
            <Button onClick={loadProjects} disabled={isLoading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>暂无保存的项目</p>
              <p className="text-sm">保存当前配置来创建第一个项目</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{project.name}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(project.lastModified)}
                        </div>
                        <div className="flex items-center">
                          <HardDrive className="h-3 w-3 mr-1" />
                          {formatFileSize(project.size)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {project.config.style.theme}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {project.config.chart.bars.length} 个柱子 • {project.config.chart.title}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button onClick={() => loadProject(project.id)} size="sm" variant="outline" disabled={isLoading}>
                        <FolderOpen className="h-3 w-3 mr-1" />
                        加载
                      </Button>
                      <Button onClick={() => exportProject(project)} size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        导出
                      </Button>
                      <Button
                        onClick={() => deleteProject(project.id)}
                        size="sm"
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Operations */}
      <Card>
        <CardHeader>
          <CardTitle>文件操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">导入配置</h4>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = ".json"
                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      try {
                        const text = await file.text()
                        const importedConfig = JSON.parse(text)
                        onConfigChange(importedConfig)
                        setStatus({ type: "success", message: "配置导入成功" })
                      } catch (error) {
                        setStatus({ type: "error", message: `配置文件格式错误: ${getErrorMessage(error)}` })
                      }
                    }
                  }
                  input.click()
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                导入JSON配置
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">导出配置</h4>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  const dataStr = JSON.stringify(config, null, 2)
                  const dataBlob = new Blob([dataStr], { type: "application/json" })
                  const url = URL.createObjectURL(dataBlob)

                  const downloadLink = document.createElement("a")
                  downloadLink.href = url
                  downloadLink.download = `${config.chart.title || "chart-config"}.json`
                  document.body.appendChild(downloadLink)
                  downloadLink.click()
                  document.body.removeChild(downloadLink)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                导出当前配置
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">使用说明</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 项目文件保存在服务器上，可以随时加载和编辑</li>
              <li>• 导出的JSON文件可以在其他设备上导入使用</li>
              <li>• 建议定期导出重要项目作为备份</li>
              <li>• 项目名称支持中文，会自动处理特殊字符</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

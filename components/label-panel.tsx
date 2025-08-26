"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import type { ChartConfig } from "./chart-dashboard"

interface LabelPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

export function LabelPanel({ config, onConfigChange }: LabelPanelProps) {
  const [selectedLabelId, setSelectedLabelId] = useState<string>(config.labels[0]?.id || "")

  const addLabel = () => {
    const newLabel = {
      id: `label${Date.now()}`,
      text: "新标签",
      scope: "global" as const,
      fontFamily: "times",
      fontSize: 12,
      color: "#000000",
      autoLineBreak: false,
      smartLineBreak: false,
    }

    onConfigChange({
      ...config,
      labels: [...config.labels, newLabel],
    })
    setSelectedLabelId(newLabel.id)
  }

  const deleteLabel = (labelId: string) => {
    const updatedLabels = config.labels.filter((label) => label.id !== labelId)
    onConfigChange({
      ...config,
      labels: updatedLabels,
    })

    if (selectedLabelId === labelId) {
      setSelectedLabelId(updatedLabels[0]?.id || "")
    }
  }

  const updateLabel = (labelId: string, updates: Partial<(typeof config.labels)[0]>) => {
    const updatedLabels = config.labels.map((label) => (label.id === labelId ? { ...label, ...updates } : label))
    onConfigChange({
      ...config,
      labels: updatedLabels,
    })
  }

  const selectedLabel = config.labels.find((label) => label.id === selectedLabelId)

  // Generate scope options based on chart bars
  const scopeOptions = [
    { value: "global", label: "全局" },
    ...config.chart.bars.map((bar, index) => ({
      value: `column${index + 1}`,
      label: `列 ${index + 1} (${bar.name})`,
    })),
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Label List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>标签列表</CardTitle>
            <Button onClick={addLabel} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              添加标签
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {config.labels.map((label) => (
            <div
              key={label.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedLabelId === label.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedLabelId(label.id)}
            >
              <div>
                <div className="font-medium">{label.text}</div>
                <div className="text-sm text-muted-foreground">
                  作用域: {scopeOptions.find((opt) => opt.value === label.scope)?.label}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteLabel(label.id)
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {config.labels.length === 0 && (
            <div className="text-center text-muted-foreground py-8">暂无标签，点击"添加标签"创建第一个标签</div>
          )}
        </CardContent>
      </Card>

      {/* Label Settings */}
      {selectedLabel && (
        <Card>
          <CardHeader>
            <CardTitle>标签设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="label-text">标签文本</Label>
                <Textarea
                  id="label-text"
                  value={selectedLabel.text}
                  onChange={(e) => updateLabel(selectedLabel.id, { text: e.target.value })}
                  placeholder="输入标签文本..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="label-scope">作用域</Label>
                <Select
                  value={selectedLabel.scope}
                  onValueChange={(value) => {
                    const updates: any = { scope: value }
                    // When scope is column-specific, align color with column color
                    if (value.startsWith("column")) {
                      const columnIndex = Number.parseInt(value.replace("column", "")) - 1
                      const columnColor = config.chart.bars[columnIndex]?.color
                      if (columnColor) {
                        updates.color = columnColor
                      }
                    }
                    updateLabel(selectedLabel.id, updates)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Font Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">字体设置</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="label-font-family">字体</Label>
                  <Select
                    value={selectedLabel.fontFamily}
                    onValueChange={(value) => updateLabel(selectedLabel.id, { fontFamily: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">Times New Roman</SelectItem>
                      <SelectItem value="arial">Arial</SelectItem>
                      <SelectItem value="helvetica">Helvetica</SelectItem>
                      <SelectItem value="calibri">Calibri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="label-font-size">字号</Label>
                  <Input
                    id="label-font-size"
                    type="number"
                    value={selectedLabel.fontSize}
                    onChange={(e) => updateLabel(selectedLabel.id, { fontSize: Number.parseInt(e.target.value) })}
                    min={8}
                    max={72}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="label-color">颜色</Label>
                <Input
                  id="label-color"
                  type="color"
                  value={selectedLabel.color}
                  onChange={(e) => updateLabel(selectedLabel.id, { color: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* Formatting Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">格式设置</h4>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-line-break">自动换行</Label>
                  <p className="text-sm text-muted-foreground">每个标签后自动换行</p>
                </div>
                <Switch
                  id="auto-line-break"
                  checked={selectedLabel.autoLineBreak}
                  onCheckedChange={(checked) => updateLabel(selectedLabel.id, { autoLineBreak: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smart-line-break">智能换行</Label>
                  <p className="text-sm text-muted-foreground">根据标签长度智能确定每行字符数</p>
                </div>
                <Switch
                  id="smart-line-break"
                  checked={selectedLabel.smartLineBreak}
                  onCheckedChange={(checked) => updateLabel(selectedLabel.id, { smartLineBreak: checked })}
                />
              </div>

              {selectedLabel.smartLineBreak && (
                <div>
                  <Label htmlFor="max-chars-per-line">每行最大字符数</Label>
                  <Input
                    id="max-chars-per-line"
                    type="number"
                    value={selectedLabel.maxCharsPerLine || 20}
                    onChange={(e) =>
                      updateLabel(selectedLabel.id, { maxCharsPerLine: Number.parseInt(e.target.value) })
                    }
                    min={5}
                    max={100}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

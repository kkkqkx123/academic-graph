"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { ChartConfig } from "./chart-dashboard"

interface ChartConfigPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
}

export function ChartConfigPanel({ config, onConfigChange }: ChartConfigPanelProps) {
  const updateConfig = (path: string[], value: unknown) => {
    const newConfig = { ...config }
    let current = newConfig as Record<string, unknown>

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] as Record<string, unknown>
    }
    current[path[path.length - 1]] = value

    onConfigChange(newConfig)
  }

  const addGroup = () => {
    const newGroups = [
      ...(config.chart.groups || []),
      {
        name: `组${(config.chart.groups?.length || 0) + 1}`,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      },
    ]
    updateConfig(["chart", "groups"], newGroups)
  }

  const removeGroup = (index: number) => {
    const groupToRemove = config.chart.groups?.[index]
    if (!groupToRemove) return

    // Remove group and reassign bars to first available group or create default
    const newGroups = config.chart.groups?.filter((_, i) => i !== index) || []
    const defaultGroup = newGroups[0]?.name || "默认组"

    // If no groups left, create a default group
    if (newGroups.length === 0) {
      newGroups.push({ name: "默认组", color: "#3b82f6" })
    }

    // Reassign bars from removed group to default group
    const newBars = config.chart.bars.map((bar) =>
      bar.group === groupToRemove.name ? { ...bar, group: defaultGroup } : bar,
    )

    updateConfig(["chart", "groups"], newGroups)
    updateConfig(["chart", "bars"], newBars)
  }

  const updateGroup = (index: number, field: string, value: string | number) => {
    const newGroups = [...(config.chart.groups || [])]
    const oldName = newGroups[index].name
    newGroups[index] = { ...newGroups[index], [field]: value }

    // If group name changed, update all bars that reference this group
    if (field === "name" && oldName !== value) {
      const newBars = config.chart.bars.map((bar) => (bar.group === oldName ? { ...bar, group: value } : bar))
      updateConfig(["chart", "bars"], newBars)
    }

    updateConfig(["chart", "groups"], newGroups)
  }

  const addBar = () => {
    let groups = config.chart.groups || []
    if (groups.length === 0) {
      groups = [{ name: "默认组", color: "#3b82f6" }]
      updateConfig(["chart", "groups"], groups)
    }

    const newBars = [
      ...config.chart.bars,
      {
        name: `柱${config.chart.bars.length + 1}`,
        value: config.chart.type === "stacked-percentage" ? [10, 20, 30] : 0,
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        borderColor: "#000000",
        borderWidth: 1,
        fillPattern: "solid" as const,
        width: 0.8,
        shape: "rectangle" as const,
        group: groups[0].name, // Assign new bar to first group
        segmentColors:
          config.chart.type === "stacked-percentage"
            ? [`#${Math.floor(Math.random() * 16777215).toString(16)}`]
            : undefined,
      },
    ]
    updateConfig(["chart", "bars"], newBars)
  }

  const removeBar = (index: number) => {
    const newBars = config.chart.bars.filter((_, i) => i !== index)
    updateConfig(["chart", "bars"], newBars)
  }

  const updateBar = (index: number, field: string, value: string | number | string[] | number[] | boolean) => {
    const newBars = [...config.chart.bars]
    newBars[index] = { ...newBars[index], [field]: value }
    updateConfig(["chart", "bars"], newBars)
  }


  const addStackedValue = (barIndex: number) => {
    const bar = config.chart.bars[barIndex]
    const currentValues = Array.isArray(bar.value) ? bar.value : [bar.value]
    const newValues = [...currentValues, 10]
    updateBar(barIndex, "value", newValues)

    // Add corresponding color for new segment
    const currentColors = bar.segmentColors || []
    const newColors = [...currentColors, `#${Math.floor(Math.random() * 16777215).toString(16)}`]
    updateBar(barIndex, "segmentColors", newColors)
  }

  const removeStackedValue = (barIndex: number, valueIndex: number) => {
    const bar = config.chart.bars[barIndex]
    const currentValues = Array.isArray(bar.value) ? bar.value : [bar.value]
    if (currentValues.length <= 1) return // Keep at least one value

    const newValues = currentValues.filter((_, i) => i !== valueIndex)
    updateBar(barIndex, "value", newValues)

    // Remove corresponding color
    const currentColors = bar.segmentColors || []
    const newColors = currentColors.filter((_: string, i: number) => i !== valueIndex)
    updateBar(barIndex, "segmentColors", newColors)
  }

  const updateStackedValue = (barIndex: number, valueIndex: number, newValue: number) => {
    const bar = config.chart.bars[barIndex]
    const currentValues = Array.isArray(bar.value) ? bar.value : [bar.value]
    const newValues = [...currentValues]
    newValues[valueIndex] = newValue
    updateBar(barIndex, "value", newValues)
  }

  const updateSegmentColor = (barIndex: number, segmentIndex: number, color: string) => {
    const bar = config.chart.bars[barIndex]
    const currentColors = bar.segmentColors || []
    const newColors = [...currentColors]
    newColors[segmentIndex] = color
    updateBar(barIndex, "segmentColors", newColors)
  }

  const groupedBars = config.chart.bars.reduce(
    (acc, bar, index) => {
      const groupName = bar.group || "未分组"
      if (!acc[groupName]) {
        acc[groupName] = []
      }
      acc[groupName].push({ ...bar, originalIndex: index })
      return acc
    },
    {} as Record<string, Array<{
      name: string;
      value: number | number[];
      group?: string;
      originalIndex: number;
      color?: string;
      borderColor?: string;
      borderWidth?: number;
      fillPattern?: "solid" | "grid" | "diagonal" | "hollow";
      width?: number;
      shape?: "rectangle" | "rounded";
      segmentColors?: string[];
    }>>,
  )

  return (
    <div className="space-y-6">
      {/* 基本设置 */}
      <Card>
        <CardHeader>
          <CardTitle>基本设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chart-title">图表标题</Label>
              <Input
                id="chart-title"
                value={config.chart.title}
                onChange={(e) => updateConfig(["chart", "title"], e.target.value)}
                placeholder="输入图表标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chart-type">图表类型</Label>
              <Select
                value={config.chart.type}
                onValueChange={(value: "bar" | "stacked-percentage") => updateConfig(["chart", "type"], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">标准柱状图</SelectItem>
                  <SelectItem value="stacked-percentage">堆叠百分比柱状图</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>标题字体设置</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={config.chart.titleFont?.family || "times"}
                onValueChange={(value) => updateConfig(["chart", "titleFont", "family"], value)}
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
              <Input
                type="number"
                value={config.chart.titleFont?.size || 18}
                onChange={(e) => updateConfig(["chart", "titleFont", "size"], Number(e.target.value))}
                placeholder="字号"
                min="8"
                max="48"
              />
              <Input
                type="color"
                value={config.chart.titleFont?.color || "#000000"}
                onChange={(e) => updateConfig(["chart", "titleFont", "color"], e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>轴配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">X轴设置</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>轴标签</Label>
                <Input
                  value={config.chart.xAxis.label}
                  onChange={(e) => updateConfig(["chart", "xAxis", "label"], e.target.value)}
                  placeholder="X轴标签"
                />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Input
                  value={config.chart.xAxis.unit}
                  onChange={(e) => updateConfig(["chart", "xAxis", "unit"], e.target.value)}
                  placeholder="单位"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={config.chart.xAxis.fontFamily || "times"}
                onValueChange={(value) => updateConfig(["chart", "xAxis", "fontFamily"], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="times">Times New Roman</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={config.chart.xAxis.fontSize || 12}
                onChange={(e) => updateConfig(["chart", "xAxis", "fontSize"], Number(e.target.value))}
                placeholder="字号"
                min="8"
                max="24"
              />
              <Input
                type="color"
                value={config.chart.xAxis.color || "#000000"}
                onChange={(e) => updateConfig(["chart", "xAxis", "color"], e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Y轴设置</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>轴标签</Label>
                <Input
                  value={config.chart.yAxis.label}
                  onChange={(e) => updateConfig(["chart", "yAxis", "label"], e.target.value)}
                  placeholder="Y轴标签"
                />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Input
                  value={config.chart.yAxis.unit}
                  onChange={(e) => updateConfig(["chart", "yAxis", "unit"], e.target.value)}
                  placeholder="单位"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select
                value={config.chart.yAxis.fontFamily || "times"}
                onValueChange={(value) => updateConfig(["chart", "yAxis", "fontFamily"], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="times">Times New Roman</SelectItem>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={config.chart.yAxis.fontSize || 12}
                onChange={(e) => updateConfig(["chart", "yAxis", "fontSize"], Number(e.target.value))}
                placeholder="字号"
                min="8"
                max="24"
              />
              <Input
                type="color"
                value={config.chart.yAxis.color || "#000000"}
                onChange={(e) => updateConfig(["chart", "yAxis", "color"], e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>柱子分组管理</span>
            </div>
            <Button onClick={addGroup} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              添加分组
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(config.chart.groups || []).map((group, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">分组 {index + 1}</h4>
                {(config.chart.groups?.length || 0) > 1 && (
                  <Button
                    onClick={() => removeGroup(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>分组名称</Label>
                  <Input
                    value={group.name}
                    onChange={(e) => updateGroup(index, "name", e.target.value)}
                    placeholder="分组名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分组颜色</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={group.color || "#3b82f6"}
                      onChange={(e) => updateGroup(index, "color", e.target.value)}
                      className="w-16 h-8"
                    />
                    <Input
                      value={group.color || "#3b82f6"}
                      onChange={(e) => updateGroup(index, "color", e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            柱状图数据
            <Button onClick={addBar} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              添加柱子
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="p-4 bg-gray-50">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">全局数值限制</h4>
                <Switch
                  checked={config.chart.globalLimits?.enabled || false}
                  onCheckedChange={(checked) => updateConfig(["chart", "globalLimits", "enabled"], checked)}
                />
              </div>

              {config.chart.globalLimits?.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>最小值限制</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.chart.globalLimits?.min || 0}
                      onChange={(e) => updateConfig(["chart", "globalLimits", "min"], Number(e.target.value))}
                      placeholder="最小值"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>最大值限制</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={config.chart.globalLimits?.max || 100}
                      onChange={(e) => updateConfig(["chart", "globalLimits", "max"], Number(e.target.value))}
                      placeholder="最大值"
                    />
                  </div>
                </div>
              )}

              {config.chart.globalLimits?.enabled && (
                <p className="text-sm text-muted-foreground">
                  启用后，所有柱子的数值将被限制在设定的范围内，超出范围的数值将被截断。
                </p>
              )}
            </div>
          </Card>

          {config.chart.type === "stacked-percentage" && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>堆叠百分比模式：</strong>数值格式为逗号分隔的数字，如：10,20,30
              </p>
            </div>
          )}

          {Object.entries(groupedBars).map(([groupName, bars]) => (
            <div key={groupName} className="space-y-4">
              <div className="flex items-center space-x-2 pt-4">
                <div className="h-px bg-border flex-1" />
                <span className="text-sm font-medium text-muted-foreground px-2">{groupName}</span>
                <div className="h-px bg-border flex-1" />
              </div>

              {bars.map((bar) => (
                <Card key={bar.originalIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">柱子 {bar.originalIndex + 1}</h4>
                      {config.chart.bars.length > 1 && (
                        <Button
                          onClick={() => removeBar(bar.originalIndex)}
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>名称</Label>
                        <Input
                          value={bar.name}
                          onChange={(e) => updateBar(bar.originalIndex, "name", e.target.value)}
                          placeholder="柱子名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>数值</Label>
                        {config.chart.type === "stacked-percentage" ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium">堆叠数值</Label>
                              <span className="text-xs text-muted-foreground">
                                {(Array.isArray(bar.value) ? bar.value : [bar.value]).length} 个数值
                              </span>
                            </div>
                            {(Array.isArray(bar.value) ? bar.value : [bar.value]).map((value, valueIndex) => (
                              <div key={valueIndex} className="flex items-center space-x-2 p-2 border rounded-md">
                                <span className="text-xs text-muted-foreground w-8">#{valueIndex + 1}</span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={value}
                                  onChange={(e) =>
                                    updateStackedValue(
                                      bar.originalIndex,
                                      valueIndex,
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  placeholder="输入数值（支持小数）"
                                  className="flex-1"
                                />
                                <Input
                                  type="color"
                                  value={
                                    bar.segmentColors?.[valueIndex] ||
                                    `#${Math.floor(Math.random() * 16777215).toString(16)}`
                                  }
                                  onChange={(e) => updateSegmentColor(bar.originalIndex, valueIndex, e.target.value)}
                                  className="w-10 h-8"
                                  title="段颜色"
                                />
                                {(Array.isArray(bar.value) ? bar.value : [bar.value]).length > 1 && (
                                  <Button
                                    onClick={() => removeStackedValue(bar.originalIndex, valueIndex)}
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title="删除此数值"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              onClick={() => addStackedValue(bar.originalIndex)}
                              size="sm"
                              variant="outline"
                              className="w-full mt-2"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              添加新数值
                            </Button>
                          </div>
                        ) : (
                          <Input
                            type="number"
                            step="0.1"
                            value={Array.isArray(bar.value) ? bar.value[0] || 0 : bar.value}
                            onChange={(e) =>
                              updateBar(bar.originalIndex, "value", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="数值"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>所属分组</Label>
                        <Select
                          value={bar.group || ""}
                          onValueChange={(value) => updateBar(bar.originalIndex, "group", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择分组" />
                          </SelectTrigger>
                          <SelectContent>
                            {(config.chart.groups || []).map((group) => (
                              <SelectItem key={group.name} value={group.name}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {config.chart.type !== "stacked-percentage" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>填充颜色</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={bar.color || "#3b82f6"}
                              onChange={(e) => updateBar(bar.originalIndex, "color", e.target.value)}
                              className="w-16 h-8"
                            />
                            <Input
                              value={bar.color || "#3b82f6"}
                              onChange={(e) => updateBar(bar.originalIndex, "color", e.target.value)}
                              placeholder="#3b82f6"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>边框颜色</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={bar.borderColor || "#000000"}
                              onChange={(e) => updateBar(bar.originalIndex, "borderColor", e.target.value)}
                              className="w-16 h-8"
                            />
                            <Input
                              value={bar.borderColor || "#000000"}
                              onChange={(e) => updateBar(bar.originalIndex, "borderColor", e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {config.chart.type === "stacked-percentage" && (
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>边框颜色</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={bar.borderColor || "#000000"}
                              onChange={(e) => updateBar(bar.originalIndex, "borderColor", e.target.value)}
                              className="w-16 h-8"
                            />
                            <Input
                              value={bar.borderColor || "#000000"}
                              onChange={(e) => updateBar(bar.originalIndex, "borderColor", e.target.value)}
                              placeholder="#000000"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>填充样式</Label>
                        <Select
                          value={bar.fillPattern || "solid"}
                          onValueChange={(value: "solid" | "grid" | "diagonal" | "hollow") =>
                            updateBar(bar.originalIndex, "fillPattern", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">实心</SelectItem>
                            <SelectItem value="grid">网格</SelectItem>
                            <SelectItem value="diagonal">斜线</SelectItem>
                            <SelectItem value="hollow">空心</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>边框宽度</Label>
                        <Input
                          type="number"
                          value={bar.borderWidth || 1}
                          onChange={(e) => updateBar(bar.originalIndex, "borderWidth", Number(e.target.value))}
                          min="0"
                          max="10"
                          step="0.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>柱子宽度</Label>
                        <Input
                          type="number"
                          value={bar.width || 0.8}
                          onChange={(e) => updateBar(bar.originalIndex, "width", Number(e.target.value))}
                          min="0.1"
                          max="1"
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>形状</Label>
                        <Select
                          value={bar.shape || "rectangle"}
                          onValueChange={(value: "rectangle" | "rounded") =>
                            updateBar(bar.originalIndex, "shape", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rectangle">矩形</SelectItem>
                            <SelectItem value="rounded">圆角矩形</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>间距与网格设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>组内间距</Label>
              <Input
                type="number"
                value={config.chart.barGaps?.intraGroup || 0.1}
                onChange={(e) => updateConfig(["chart", "barGaps", "intraGroup"], Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>组间间距</Label>
              <Input
                type="number"
                value={config.chart.barGaps?.interGroup || 0.3}
                onChange={(e) => updateConfig(["chart", "barGaps", "interGroup"], Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>网格线透明度</Label>
              <Input
                type="number"
                value={config.chart.gridLines?.opacity || 0.3}
                onChange={(e) => updateConfig(["chart", "gridLines", "opacity"], Number(e.target.value))}
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            <div className="space-y-2">
              <Label>网格线粗细</Label>
              <Input
                type="number"
                value={config.chart.gridLines?.thickness || 1}
                onChange={(e) => updateConfig(["chart", "gridLines", "thickness"], Number(e.target.value))}
                min="0.5"
                max="5"
                step="0.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>显示设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.chart.showValue}
              onCheckedChange={(checked) => updateConfig(["chart", "showValue"], checked)}
            />
            <Label>显示数值</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.chart.showDataLabels}
              onCheckedChange={(checked) => updateConfig(["chart", "showDataLabels"], checked)}
            />
            <Label>显示数据标签</Label>
          </div>

          {config.chart.showDataLabels && (
            <div className="space-y-2">
              <Label>数据标签字体设置</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={config.chart.dataLabelFont?.family || "times"}
                  onValueChange={(value) => updateConfig(["chart", "dataLabelFont", "family"], value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="times">Times New Roman</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="helvetica">Helvetica</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={config.chart.dataLabelFont?.size || 12}
                  onChange={(e) => updateConfig(["chart", "dataLabelFont", "size"], Number(e.target.value))}
                  placeholder="字号"
                  min="8"
                  max="24"
                />
                <Input
                  type="color"
                  value={config.chart.dataLabelFont?.color || "#000000"}
                  onChange={(e) => updateConfig(["chart", "dataLabelFont", "color"], e.target.value)}
                />
              </div>
            </div>
          )}

          {config.chart.showValue && (
            <div className="space-y-2">
              <Label>数值位置</Label>
              <Select
                value={config.chart.valuePosition}
                onValueChange={(value: "top" | "middle") => updateConfig(["chart", "valuePosition"], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">柱子顶部</SelectItem>
                  <SelectItem value="middle">柱子中间</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

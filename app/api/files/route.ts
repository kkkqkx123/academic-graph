import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const projectsDir = path.join(process.cwd(), "projects")

    // Ensure projects directory exists
    await fs.mkdir(projectsDir, { recursive: true })

    const files = await fs.readdir(projectsDir)
    const projects = []

    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const filePath = path.join(projectsDir, file)
          const content = await fs.readFile(filePath, "utf-8")
          const config = JSON.parse(content)
          const stats = await fs.stat(filePath)

          projects.push({
            id: file.replace(".json", ""),
            name: config.chart?.title || file.replace(".json", ""),
            filename: file,
            lastModified: stats.mtime,
            size: stats.size,
            config: config,
          })
        } catch (error) {
          // Skip invalid files
          continue
        }
      }
    }

    // Sort by last modified date
    projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    return NextResponse.json({ error: "获取项目列表失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, config } = await request.json()

    if (!name || !config) {
      return NextResponse.json({ error: "项目名称和配置不能为空" }, { status: 400 })
    }

    const projectsDir = path.join(process.cwd(), "projects")
    await fs.mkdir(projectsDir, { recursive: true })

    const filename = `${name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}_${Date.now()}.json`
    const filePath = path.join(projectsDir, filename)

    const projectData = {
      ...config,
      metadata: {
        name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    }

    await fs.writeFile(filePath, JSON.stringify(projectData, null, 2))

    return NextResponse.json({
      success: true,
      message: "项目保存成功",
      filename,
      id: filename.replace(".json", ""),
    })
  } catch (error) {
    return NextResponse.json({ error: "项目保存失败" }, { status: 500 })
  }
}

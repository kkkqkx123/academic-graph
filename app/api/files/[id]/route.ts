import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectsDir = path.join(process.cwd(), "projects")
    const filePath = path.join(projectsDir, `${params.id}.json`)

    const content = await fs.readFile(filePath, "utf-8")
    const config = JSON.parse(content)

    return NextResponse.json({ success: true, config })
  } catch {
    return NextResponse.json({ error: "项目加载失败" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { config } = await request.json()

    const projectsDir = path.join(process.cwd(), "projects")
    const filePath = path.join(projectsDir, `${params.id}.json`)

    // Read existing file to preserve metadata
    let existingData = {}
    try {
      const existingContent = await fs.readFile(filePath, "utf-8")
      existingData = JSON.parse(existingContent)
    } catch {
      // File doesn't exist, create new
    }

    const updatedData = {
      ...config,
      metadata: {
        ...(existingData as { metadata?: Record<string, unknown> }).metadata,
        updatedAt: new Date().toISOString(),
      },
    }

    await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2))

    return NextResponse.json({ success: true, message: "项目更新成功" })
  } catch {
    return NextResponse.json({ error: "项目更新失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectsDir = path.join(process.cwd(), "projects")
    const filePath = path.join(projectsDir, `${params.id}.json`)

    await fs.unlink(filePath)

    return NextResponse.json({ success: true, message: "项目删除成功" })
  } catch {
    return NextResponse.json({ error: "项目删除失败" }, { status: 500 })
  }
}

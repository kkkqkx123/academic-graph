import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 })
    }

    const fileContent = await file.text()
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (fileExtension === "csv") {
      const csvData = parseCSV(fileContent)
      return NextResponse.json({
        success: true,
        data: csvData,
        message: "CSV文件导入成功",
      })
    } else if (fileExtension === "xml") {
      const xmlData = parseXML(fileContent)
      return NextResponse.json({
        success: true,
        data: xmlData,
        message: "XML样式文件导入成功",
      })
    } else {
      return NextResponse.json({ error: "不支持的文件格式" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: "文件导入失败" }, { status: 500 })
  }
}

function parseCSV(content: string) {
  const lines = content.trim().split("\n")
  const headers = lines[0].split(",").map((h) => h.trim())
  const data = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: any = {}

    headers.forEach((header, index) => {
      const value = values[index]
      // Try to parse as number, otherwise keep as string
      row[header] = isNaN(Number(value)) ? value : Number(value)
    })

    data.push(row)
  }

  return { headers, data }
}

function parseXML(content: string) {
  // Simple XML parsing for style configuration
  const themeMatch = content.match(/<theme>(.*?)<\/theme>/)
  const backgroundMatch = content.match(/<background-color>(.*?)<\/background-color>/)

  return {
    theme: themeMatch ? themeMatch[1] : "default",
    backgroundColor: backgroundMatch ? backgroundMatch[1] : "transparent",
  }
}

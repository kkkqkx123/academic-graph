const fs = require("fs").promises
const path = require("path")

const exampleConfigs = [
  {
    name: "Nature期刊示例",
    config: {
      chart: {
        type: "bar",
        title: "Gene Expression Levels",
        xAxis: { label: "Genes", unit: "", range: [0, 100], useDecimal: false },
        yAxis: { label: "Expression", unit: "FPKM", range: [0, 50], usePercent: false },
        showValue: true,
        valuePosition: "top",
        bars: [
          { name: "GAPDH", value: 45.2 },
          { name: "ACTB", value: 38.7 },
          { name: "TUBB", value: 29.1 },
          { name: "RPL13A", value: 33.8 },
        ],
      },
      style: {
        theme: "nature",
        backgroundColor: "transparent",
        fontFamily: "times",
        fontSize: 12,
      },
    },
  },
  {
    name: "IEEE会议示例",
    config: {
      chart: {
        type: "bar",
        title: "Algorithm Performance Comparison",
        xAxis: { label: "Algorithms", unit: "", range: [0, 100], useDecimal: false },
        yAxis: { label: "Accuracy", unit: "%", range: [0, 100], usePercent: true },
        showValue: true,
        valuePosition: "top",
        bars: [
          { name: "CNN", value: 0.94 },
          { name: "RNN", value: 0.87 },
          { name: "SVM", value: 0.82 },
          { name: "RF", value: 0.79 },
        ],
      },
      style: {
        theme: "ieee",
        backgroundColor: "transparent",
        fontFamily: "arial",
        fontSize: 11,
      },
    },
  },
]

async function createExampleConfigs() {
  try {
    const projectsDir = path.join(process.cwd(), "projects")
    await fs.mkdir(projectsDir, { recursive: true })

    for (const example of exampleConfigs) {
      const filename = `${example.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}_example.json`
      const filePath = path.join(projectsDir, filename)

      const projectData = {
        ...example.config,
        metadata: {
          name: example.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: "1.0.0",
          isExample: true,
        },
      }

      await fs.writeFile(filePath, JSON.stringify(projectData, null, 2))
      console.log(`Created example: ${filename}`)
    }

    console.log("Example configurations created successfully!")
  } catch (error) {
    console.error("Error creating example configurations:", error)
  }
}

createExampleConfigs()

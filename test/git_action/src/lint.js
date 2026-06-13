// 简易代码规范检查 —— 演示 lint 步骤
// 真实项目用 ESLint/Biome，这里用最简实现帮你理解 CI 中的 lint 概念

const fs = require("node:fs");
const path = require("node:path");

const srcDir = path.join(__dirname);
const files = fs.readdirSync(srcDir).filter(f => f.endsWith(".js") && f !== "lint.js");

let errors = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(srcDir, file), "utf-8");
  const lines = content.split("\n");

  // 规则 1: 检查是否有 console.log（生产代码不应有）
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("console.log")) {
      console.error(`  ❌ ${file}:${i + 1} — 不允许 console.log`);
      errors++;
    }
  }

  // 规则 2: 检查文件末尾是否有空行（规范要求）
  if (content.endsWith("\n\n")) {
    console.error(`  ❌ ${file} — 文件末尾多余空行`);
    errors++;
  }

  // 规则 3: 检查是否有 tab 缩进
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("\t")) {
      console.error(`  ❌ ${file}:${i + 1} — 不允许 tab 缩进，请用空格`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\n发现 ${errors} 个问题，请修复后再提交。`);
  process.exit(1);
} else {
  console.log("✅ 代码规范检查通过！");
}

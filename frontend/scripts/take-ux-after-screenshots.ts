import { existsSync, mkdirSync } from "node:fs"
import { spawn, spawnSync } from "node:child_process"
import { join } from "node:path"

const ROOT = "/Users/raillyhugo/Programming/technical-english"
const OUT_ROOT = join(ROOT, "04_Projects/technical-english/screenshots/ux-overhaul-after")
const AGENT_BROWSER = "/opt/homebrew/bin/agent-browser"

const desktopPages: Array<[string, string]> = [
  ["/", "home"],
  ["/users", "users"],
  ["/users/new", "users-new"],
  ["/users/1", "users-profile"],
  ["/vocabulary", "vocabulary"],
  ["/vocabulary/1", "vocabulary-detail"],
  ["/profiler", "profiler"],
  ["/diagnostic/start", "diagnostic-start"],
  ["/tasks", "tasks"],
  ["/tasks/1", "tasks-detail"],
  ["/review/session", "review-session"],
  ["/review/deck", "review-deck"],
  ["/review/stats", "review-stats"],
  ["/mastery", "mastery"],
  ["/summative", "summative"],
  ["/portfolio", "portfolio"],
  ["/admin/generated-items", "admin-generated-items"],
  ["/admin/calibration", "admin-calibration"],
  ["/admin/verification-metrics", "admin-verification-metrics"],
  ["/admin/cohort-analytics", "admin-cohort-analytics"],
  ["/admin/pilot", "admin-pilot"],
  ["/content", "content"],
]

const mobilePages: Array<[string, string]> = [
  ["/", "home"],
  ["/vocabulary", "vocabulary"],
  ["/tasks", "tasks"],
  ["/mastery", "mastery"],
  ["/portfolio", "portfolio"],
  ["/admin/pilot", "admin-pilot"],
]

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

function detectFrontendPort() {
  const lsofBin = existsSync("/usr/sbin/lsof") ? "/usr/sbin/lsof" : "lsof"
  const out = spawnSync(lsofBin, ["-iTCP", "-sTCP:LISTEN", "-n", "-P"], {
    encoding: "utf-8",
  }).stdout

  for (const line of out.split("\n")) {
    if (line.includes("node") && line.includes("127.0.0.1:")) {
      const match = line.match(/127\.0\.0\.1:(\d+)/)
      if (match && match[1] !== "8080" && match[1] !== "35729") {
        return match[1]
      }
    }
  }

  return "5173"
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, args, { shell: false, stdio: ["ignore", "pipe", "pipe"] })
    let output = ""

    process.stdout.on("data", (chunk) => {
      output += chunk.toString()
    })

    process.stderr.on("data", (chunk) => {
      output += chunk.toString()
    })

    process.on("close", (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(output || `Command failed: ${command} ${args.join(" ")}`))
    })
  })
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function setTheme(theme: "light" | "dark") {
  await run(AGENT_BROWSER, ["eval", `localStorage.setItem('theme', '${theme}'); document.documentElement.classList.toggle('dark', '${theme}' === 'dark'); location.reload();`])
  await wait(1500)
}

async function captureGroup({
  height,
  pages,
  theme,
  width,
  outDir,
}: {
  height: number
  outDir: string
  pages: Array<[string, string]>
  theme: "light" | "dark"
  width: number
}) {
  ensureDir(outDir)
  await run(AGENT_BROWSER, ["set", "viewport", String(width), String(height)])

  for (const [path, name] of pages) {
    await run(AGENT_BROWSER, ["open", `${FRONTEND}${path}`])
    await wait(2500)
    await setTheme(theme)
    await wait(1500)
    await run(AGENT_BROWSER, ["screenshot", "--full", join(outDir, `${name}.png`)])
  }
}

const FRONTEND = `http://127.0.0.1:${detectFrontendPort()}`

async function main() {
  ensureDir(OUT_ROOT)
  ensureDir(join(OUT_ROOT, "desktop"))
  ensureDir(join(OUT_ROOT, "mobile"))
  ensureDir(join(OUT_ROOT, "dark/desktop"))
  ensureDir(join(OUT_ROOT, "dark/mobile"))

  await captureGroup({
    height: 900,
    outDir: join(OUT_ROOT, "desktop"),
    pages: desktopPages,
    theme: "light",
    width: 1440,
  })

  await captureGroup({
    height: 812,
    outDir: join(OUT_ROOT, "mobile"),
    pages: mobilePages,
    theme: "light",
    width: 375,
  })

  await captureGroup({
    height: 900,
    outDir: join(OUT_ROOT, "dark/desktop"),
    pages: desktopPages,
    theme: "dark",
    width: 1440,
  })

  await captureGroup({
    height: 812,
    outDir: join(OUT_ROOT, "dark/mobile"),
    pages: mobilePages,
    theme: "dark",
    width: 375,
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

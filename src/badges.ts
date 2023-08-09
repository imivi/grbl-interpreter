import { makeBadge, ValidationError } from "badge-maker"
import fs from "fs"

const packageJson = JSON.parse(fs.readFileSync("package.json", { encoding: "utf-8" }))

const svg = makeBadge({
    label: "npm",
    message: packageJson.version,
    color: "red"
})

fs.writeFileSync("docs/badge_npm.svg", svg)
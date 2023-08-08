import { Command } from "./commands"
import { formatCommand } from "./formatCommand"


const input: Command = {
    command: "jog",
    feedrate: 400,
    gcode: "G91",
    X: 10,
    Y: 10,
}

const output = "$J=G91 X10 Y10 F400\n"

test("Format jog command", () => {
    expect(formatCommand(input)).toBe(output)
})
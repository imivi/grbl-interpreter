import { Command, realtimeCommands, simpleCommands } from "./commands"

export function formatCommand(command: Command): string {

    // Format a command without parameters
    if(typeof command === "string") {
        if(simpleCommands.hasOwnProperty(command)) {
            const message = simpleCommands[command as keyof typeof simpleCommands]
            return message+"\n"
        }
        else if(realtimeCommands.hasOwnProperty(command)) {
            const message = realtimeCommands[command as keyof typeof realtimeCommands]
            return message.toString()
        }
    }

    // Format a command with parameters
    if(typeof command === "object") {
        if(command.command === "gcode") {
            return command.value+"\n"
        }
        if(command.command === "save_startup_block") {
            return "$N="+command.value+"\n"
        }
        if(command.command === "jog") {
            const { feedrate, X, Y, Z, gcode } = command
            // const parameters = [gcode, X, Y, Z, feedrate].filter(value => value!==undefined)

            let parameters: string[] = []

            if(gcode) parameters.push(gcode)
            if(X) parameters.push("X"+X)
            if(Y) parameters.push("Y"+Y)
            if(Z) parameters.push("Z"+Z)
            if(feedrate) parameters.push("F"+feedrate)
            
            return "$J="+parameters.join(" ")+"\n"
        }
    }

    throw Error("Command not recognized: "+JSON.stringify(command))
}




/*
formatCommand({
    command: "jog",
    feedrate: 100,
    X: 12,
})

formatCommand({
    command: "save_startup_block",
    value: ""
})
*/
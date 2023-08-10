/*
    Official GRBL interface documentation:
    https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface
*/

import { GrblMessage } from "./responses"
import { GrblAlarms, GrblErrors } from "./grbl-codes"
import { parseGrblStatus } from "./parseGrblStatus"


/**
 * There are eight types of GRBL messages:
 * 
 * > ok, error, welcome, alarm, settings, feedback, startup, status
 * 
 * This parses the message into the correct type.
 * If the message could not be parsed, { type: "unknown" } is returned.
 * 
 * @param message 
 */
export function parseResponse(message: string): GrblMessage {

    // 1. ok
    if (message === "ok") {
        return {
            type: "ok",
        }
    }

    // 2. error: error:x
    if (message.startsWith("error")) {
        const code = Number(message.split(":")[1]) as keyof typeof GrblErrors
        return {
            type: "error",
            code,
            description: GrblErrors[code] || "",
        }
    }

    // 3. welcome: Grbl X.Xx ['$' for help]
    if (message.startsWith("Grbl")) {
        return {
            type: "welcome",
        }
    }

    // 4. alarm: ALARM:x
    if (message.startsWith("ALARM")) {
        const code = Number(message.split(":")[1]) as keyof typeof GrblAlarms
        return {
            type: "alarm",
            code,
            description: GrblAlarms[code],
        }
    }

    // 5. settings: $x=val
    if (message.startsWith("$")) {
        const [settingStr, valueStr] = message.slice(1).split("=")
        return {
            type: "setting",
            setting: Number(settingStr),
            value: Number(valueStr),
        }
    }

    // 6. feedback: 
    if (message.startsWith("[") && message.endsWith("]")) {
        return {
            type: "feedback",
            message,
        }
    }

    // 7. startup: "">G54G20:ok" or "">G54G20:error:X"
    if (message.startsWith(">")) {
        const [line, outcome, errorNum] = message.slice(1).split(":")
        return {
            type: "startup",
            startup_line: line,
            error: outcome === "ok" ? null : Number(errorNum),
        }
    }

    // 8. status: <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>
    if (message.startsWith("<") && message.endsWith(">")) {
        return parseGrblStatus(message.slice(1,-1))
    }

    // Error: message could not be parsed
    return {
        type: "unknown",
        message,
    }
}

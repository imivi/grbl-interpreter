import { MachineState, MachineSubState, Status, StatusKey, Vector3 } from "./responses"


/**
 * https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface#real-time-status-reports
 * Example: <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>
 * @param message 
 * @returns 
 */
export function parseGrblStatus(message: string): Status {
    const parameters = message.slice(0, -1).split("|")

    const status: Status = {
        type: "status",
        machine_state: parameters[0] as MachineState,
        sub_state: parameters[0].split(":")[1] as MachineSubState,
    }

    parameters.slice(1).forEach(str => {
        const [key, valueStr] = str.split(":")
        if(grblStatusKeys.has(key)) {
            const parse = grblStatusParsers[key as StatusKey]
            parse(status, valueStr)
        }
    })

    // Calculate MPos from WPos and WCO
    if(status.work_position && status.work_coordinate_offset) {
        status.machine_position = {
            x: status.work_position.x + status.work_coordinate_offset.x,
            y: status.work_position.y + status.work_coordinate_offset.z,
            z: status.work_position.z + status.work_coordinate_offset.z,
        }
    }

    // Calculate WPos from MPos and WCO
    else if(status.machine_position && status.work_coordinate_offset) {
        status.work_position = {
            x: status.machine_position.x - status.work_coordinate_offset.x,
            y: status.machine_position.y - status.work_coordinate_offset.z,
            z: status.machine_position.z - status.work_coordinate_offset.z,
        }
    }

    return status
}


/**
 * A bunch of functions to parse the status parameters from the status response.
 * They modify the status object depending on the parameter being parsed.
 */
const grblStatusParsers = {
    "MPos": (status: Status, s: string) => status.machine_position = stringToVector3(s),
    "WPos": (status: Status, s: string) => status.work_position = stringToVector3(s),
    "F":    (status: Status, s: string) => status.feed = Number(s),
    "FS":   (status: Status, s: string) => { const [feed,speed] = s.split(",").map(s => Number(s)); status.feed = feed; status.speed = speed },
    "WCO":  (status: Status, s: string) => status.work_coordinate_offset = stringToVector3(s),
    "Bf":   (status: Status, s: string) => status.buffer_state = s.split(",").map(s => Number(s)),
    "Ln":   (status: Status, s: string) => status.line_number = Number(s),
    "Pn":   (status: Status, s: string) => status.pin_state = s.split(""),
    "Ov":   (status: Status, s: string) => status.override_values = s.split(",").map(s => Number(s)),
    "A":    (status: Status, s: string) => status.accessory_state = s.split(""),
}

const grblStatusKeys = new Set(Object.keys(grblStatusParsers))



function stringToVector3(str: string): Vector3 {
    const [x, y, z] = str.split(",").map(s => Number(s))
    return { x, y, z }
}

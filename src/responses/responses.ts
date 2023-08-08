/*
    Official GRBL interface documentation:
    https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface
*/


/**
 * There are eight types of GRBL messages:
 * > ok, error, welcome, alarm, settings, feedback, startup, status
 */
export type GrblMessage = Ok | Error | Welcome | Alarm | Setting | Feedback | StartupLine | Status | Unknown


/**
 * This message is sent when the last command
 * has been understood and executed correctly.
 */
type Ok = {
    type: "ok"
}

/** This message is sent when GRBL has */
type Error = {
    type: "error"
    code: number
    description: string
}

/** A unique message to indicate Grbl has initialized */
type Welcome = {
    type: "welcome"
}

/** Means an emergency mode has been enacted and shut down normal use */
type Alarm = {
    type: "alarm"
    code: number
    description: string
}

/** Contains the type and data value for a Grbl setting */
type Setting = {
    type: "setting"
    setting: number
    value: number
}

/** Contains general feedback and can provide useful data */
type Feedback = {
    type: "feedback"
    message: string
}

/** Indicates a startup line as executed with the line itself and how it went */
type StartupLine = {
    type: "startup"
    startup_line: string
    error: number | null
}

/** Message could not be parsed */
type Unknown = {
    type: "unknown"
    message: string
}

/**
 * Contains current run data like state, position, and speed
 * Example: <Idle|MPos:0.000,0.000,0.000|FS:0.0,0>
 */
export type Status = {
    type: "status"
    machine_state: MachineState
} & Partial<{
    sub_state: MachineSubState
    machine_position: Vector3,
    work_position: Vector3
    work_coordinate_offset: Vector3
    feed: number
    speed: number
    buffer_state: number[]
    line_number: number
    pin_state: string[]
    override_values: number[]
    accessory_state: string[]
}>

export type StatusKey = "MPos" | "WPos" | "F" | "FS" | "WCO" | "Bf" | "Ln" | "Pn" | "Ov" | "A"

export type MachineState = "Idle" | "Run" | "Hold" | "Jog" | "Alarm" | "Door" | "Check" | "Home" | "Sleep"

export type MachineSubState = "Hold:0" | "Hold:1" | "Door:0" | "Door:1" | "Door:2" | "Door:3"

export type Vector3 = {
    x: number
    y: number
    z: number
}

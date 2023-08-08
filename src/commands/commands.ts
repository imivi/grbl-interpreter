
export type Command =
    | GcodeCommand // object
    | JogCommand // object
    | SaveStartupBlock // object
    | keyof typeof simpleCommands // string
    | keyof typeof realtimeCommands // string

type GcodeCommand = {
    command: "gcode"
    value: string
}

// Save startup block
type SaveStartupBlock = {
    command: "save_startup_block"
    value: string
}

// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#jline---run-jogging-motion
// Example: $J=X10.0 Y-1.5 F100
type JogCommand = {
    command: "jog"
    gcode?: "G20" | "G21" | "G90" | "G91" | "G53"
    feedrate: number // G94 units per minute
} & Partial<Axes> // Add optional [X, Y, Z]
  & (Pick<Axes, "X"> | Pick<Axes, "Y"> | Pick<Axes, "Z">) // Require at least one of [X, Y, Z]

type Axes = {
    X: number
    Y: number
    Z: number
}

export const simpleCommands = {
    get_settings: "$$",
    get_gcode_parameters: "$#",
    get_gcode_parser_state: "$G",
    get_build_info: "$I",
    get_startup_blocks: "$N",
    check_gcode_mode: "$C",
    kill_alarm_lock: "$X",
    run_homing_cycle: "$H",

    restore_settings: "$RST=$",
    erase_wco: "$RST=#",
    clear_eeprom: "$RST=*",

    sleep: "$SLP",
}

// Official GRBL documentation:
// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface#interacting-with-grbls-systems
// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands

// One important note is about the override command characters. These are defined in the extended-ASCII character space and are generally not type-able on a keyboard. A GUI must be able to send these 8-bit values to support overrides.
// The same principle can apply to scripts: control characters may not be recognized if sent as regular characters to the serial interface. When using pyserial, one option is to encode the hex code as a Python3 byte string, and pass it directly to the serial object. For example serial.write(b'\x18') sends a ctrl-x control character.

/**
 * https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands
 * A realtime command [...] does not require a line feed or carriage return after them.
 */
export const realtimeCommands = {
    // These control characters are picked-off and removed from the
    // serial buffer when they are detected and do not require an
    // additional line-feed or carriage-return character to operate.
    status: "?",
    cycle_start_resume: "~",
    feed_hold: "!",
    soft_reset: 0x18, // ctrl-x

    safety_door: 0x84,

    jog_cancel: 0x85,

    feed_override_100percent: 0x90,
    feed_override_plus10percent: 0x91,
    feed_override_minus10percent: 0x92,
    feed_override_plus1percent: 0x93,
    feed_override_minus1percent: 0x94,

    rapid_override_100percent: 0x95,
    rapid_override_50percent: 0x96,
    rapid_override_25percent: 0x97,

    // Spindle Speed Overrides
    // 0x99 : Set 100% of programmed spindle speed
    // 0x9A : Increase 10%
    // 0x9B : Decrease 10%
    // 0x9C : Increase 1%
    // 0x9D : Decrease 1%

    toggle_spindle_stop: 0x9E,
    toggle_flood_coolant: 0xA0,
    toggle_mist_coolant: 0xA1,
}
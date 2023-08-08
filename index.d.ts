/**
 * There are eight types of GRBL messages:
 * > ok, error, welcome, alarm, settings, feedback, startup, status
 */
type GrblMessage = Ok | Error | Welcome | Alarm | Setting | Feedback | StartupLine | Status | Unknown;
/**
 * This message is sent when the last command
 * has been understood and executed correctly.
 */
type Ok = {
    type: "ok";
};
/** This message is sent when GRBL has */
type Error = {
    type: "error";
    code: number;
    description: string;
};
/** A unique message to indicate Grbl has initialized */
type Welcome = {
    type: "welcome";
};
/** Means an emergency mode has been enacted and shut down normal use */
type Alarm = {
    type: "alarm";
    code: number;
    description: string;
};
/** Contains the type and data value for a Grbl setting */
type Setting = {
    type: "setting";
    setting: number;
    value: number;
};
/** Contains general feedback and can provide useful data */
type Feedback = {
    type: "feedback";
    message: string;
};
/** Indicates a startup line as executed with the line itself and how it went */
type StartupLine = {
    type: "startup";
    startup_line: string;
    error: number | null;
};
/** Message could not be parsed */
type Unknown = {
    type: "unknown";
    message: string;
};
/**
 * Contains current run data like state, position, and speed
 * Example: <Idle|MPos:0.000,0.000,0.000|FS:0.0,0>
 */
type Status = {
    type: "status";
    machine_state: MachineState;
} & Partial<{
    sub_state: MachineSubState;
    machine_position: Vector3;
    work_position: Vector3;
    work_coordinate_offset: Vector3;
    feed: number;
    speed: number;
    buffer_state: number[];
    line_number: number;
    pin_state: string[];
    override_values: number[];
    accessory_state: string[];
}>;
type MachineState = "Idle" | "Run" | "Hold" | "Jog" | "Alarm" | "Door" | "Check" | "Home" | "Sleep";
type MachineSubState = "Hold:0" | "Hold:1" | "Door:0" | "Door:1" | "Door:2" | "Door:3";
type Vector3 = {
    x: number;
    y: number;
    z: number;
};

declare const GrblErrors: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    13: string;
    14: string;
    15: string;
    16: string;
    17: string;
    20: string;
    21: string;
    22: string;
    23: string;
    24: string;
    25: string;
    26: string;
    27: string;
    28: string;
    29: string;
    30: string;
    31: string;
    32: string;
    33: string;
    34: string;
    35: string;
    36: string;
    37: string;
    38: string;
};
declare const GrblAlarms: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
};
declare const GrblSettings: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    10: string;
    11: string;
    12: string;
    13: string;
    20: string;
    21: string;
    22: string;
    23: string;
    24: string;
    25: string;
    26: string;
    27: string;
    30: string;
    31: string;
    32: string;
    100: string;
    101: string;
    102: string;
    110: string;
    111: string;
    112: string;
    120: string;
    121: string;
    122: string;
    130: string;
    131: string;
    132: string;
};

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
declare function parseResponse(message: string): GrblMessage;

type Command = GcodeCommand | JogCommand | SaveStartupBlock | keyof typeof simpleCommands | keyof typeof realtimeCommands;
type GcodeCommand = {
    command: "gcode";
    value: string;
};
type SaveStartupBlock = {
    command: "save_startup_block";
    value: string;
};
type JogCommand = {
    command: "jog";
    gcode?: "G20" | "G21" | "G90" | "G91" | "G53";
    feedrate: number;
} & Partial<Axes> & (Pick<Axes, "X"> | Pick<Axes, "Y"> | Pick<Axes, "Z">);
type Axes = {
    X: number;
    Y: number;
    Z: number;
};
declare const simpleCommands: {
    get_settings: string;
    get_gcode_parameters: string;
    get_gcode_parser_state: string;
    get_build_info: string;
    get_startup_blocks: string;
    check_gcode_mode: string;
    kill_alarm_lock: string;
    run_homing_cycle: string;
    restore_settings: string;
    erase_wco: string;
    clear_eeprom: string;
    sleep: string;
};
/**
 * https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands
 * A realtime command [...] does not require a line feed or carriage return after them.
 */
declare const realtimeCommands: {
    status: string;
    cycle_start_resume: string;
    feed_hold: string;
    soft_reset: number;
    safety_door: number;
    jog_cancel: number;
    feed_override_100percent: number;
    feed_override_plus10percent: number;
    feed_override_minus10percent: number;
    feed_override_plus1percent: number;
    feed_override_minus1percent: number;
    rapid_override_100percent: number;
    rapid_override_50percent: number;
    rapid_override_25percent: number;
    toggle_spindle_stop: number;
    toggle_flood_coolant: number;
    toggle_mist_coolant: number;
};

declare function formatCommand(command: Command): string;

export { GrblAlarms, GrblErrors, GrblMessage, GrblSettings, MachineState, MachineSubState, formatCommand, parseResponse };

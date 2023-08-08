const GrblErrors = {
    1: "G-code words consist of a letter and a value. Letter was not found.",
    2: "Numeric value format is not valid or missing an expected value.",
    3: "Grbl '$' system command was not recognized or supported.",
    4: "Negative value received for an expected positive value.",
    5: "Homing cycle is not enabled via settings.",
    6: "Minimum step pulse time must be greater than 3usec",
    7: "EEPROM read failed. Reset and restored to default values.",
    8: "Grbl '$' command cannot be used unless Grbl is IDLE. Ensures smooth operation during a job.",
    9: "G-code locked out during alarm or jog state",
    10: "Soft limits cannot be enabled without homing also enabled.",
    11: "Max characters per line exceeded. Line was not processed and executed.",
    12: "(Compile Option) Grbl '$' setting value exceeds the maximum step rate supported.",
    13: "Safety door detected as opened and door state initiated.",
    14: "(Grbl-Mega Only) Build info or startup line exceeded EEPROM line length limit.",
    15: "Jog target exceeds machine travel. Command ignored.",
    16: "Jog command with no '=' or contains prohibited g-code.",
    17: "Laser mode requires PWM output.",
    20: "Unsupported or invalid g-code command found in block.",
    21: "More than one g-code command from same modal group found in block.",
    22: "Feed rate has not yet been set or is undefined.",
    23: "G-code command in block requires an integer value.",
    24: "Two G-code commands that both require the use of the XYZ axis words were detected in the block.",
    25: "A G-code word was repeated in the block.",
    26: "A G-code command implicitly or explicitly requires XYZ axis words in the block, but none were detected.",
    27: "N line number value is not within the valid range of 1 - 9,999,999.",
    28: "A G-code command was sent, but is missing some required P or L value words in the line.",
    29: "Grbl supports six work coordinate systems G54-G59. G59.1, G59.2, and G59.3 are not supported.",
    30: "The G53 G-code command requires either a G0 seek or G1 feed motion mode to be active. A different motion was active.",
    31: "There are unused axis words in the block and G80 motion mode cancel is active.",
    32: "A G2 or G3 arc was commanded but there are no XYZ axis words in the selected plane to trace the arc.",
    33: "The motion command has an invalid target. G2, G3, and G38.2 generates this error, if the arc is impossible to generate or if the probe target is the current position.",
    34: "A G2 or G3 arc, traced with the radius definition, had a mathematical error when computing the arc geometry. Try either breaking up the arc into semi-circles or quadrants, or redefine them with the arc offset definition.",
    35: "A G2 or G3 arc, traced with the offset definition, is missing the IJK offset word in the selected plane to trace the arc.",
    36: "There are unused, leftover G-code words that aren't used by any command in the block.",
    37: "The G43.1 dynamic tool length offset command cannot apply an offset to an axis other than its configured axis. The Grbl default axis is the Z-axis.",
    38: "Tool number greater than max supported value.",
};
const GrblAlarms = {
    1: "Hard limit triggered. Machine position is likely lost due to sudden and immediate halt. Re-homing is highly recommended.",
    2: "G-code motion target exceeds machine travel. Machine position safely retained. Alarm may be unlocked.",
    3: "Reset while in motion. Grbl cannot guarantee position. Lost steps are likely. Re-homing is highly recommended.",
    4: "Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered.",
    5: "Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4.",
    6: "Homing fail. Reset during active homing cycle.",
    7: "Homing fail. Safety door was opened during active homing cycle.",
    8: "Homing fail. Cycle failed to clear limit switch when pulling off. Try increasing pull-off setting or check wiring.",
    9: "Homing fail. Could not find limit switch within search distance. Defined as 1.5 * max_travel on search and 5 * pulloff on locate phases.",
    10: "Homing fail. On dual axis machines, could not find the second limit switch for self-squaring.",
};
const GrblSettings = {
    0: "Step pulse time, microseconds",
    1: "Step idle delay, milliseconds",
    2: "Step pulse invert, mask",
    3: "Step direction invert, mask",
    4: "Invert step enable pin, boolean",
    5: "Invert limit pins, boolean",
    6: "Invert probe pin, boolean",
    10: "Status report options, mask",
    11: "Junction deviation, millimeters",
    12: "Arc tolerance, millimeters",
    13: "Report in inches, boolean",
    20: "Soft limits enable, boolean",
    21: "Hard limits enable, boolean",
    22: "Homing cycle enable, boolean",
    23: "Homing direction invert, mask",
    24: "Homing locate feed rate, mm/min",
    25: "Homing search seek rate, mm/min",
    26: "Homing switch debounce delay, milliseconds",
    27: "Homing switch pull-off distance, millimeters",
    30: "Maximum spindle speed, RPM",
    31: "Minimum spindle speed, RPM",
    32: "Laser-mode enable, boolean",
    100: "X-axis steps per millimeter",
    101: "Y-axis steps per millimeter",
    102: "Z-axis steps per millimeter",
    110: "X-axis maximum rate, mm/min",
    111: "Y-axis maximum rate, mm/min",
    112: "Z-axis maximum rate, mm/min",
    120: "X-axis acceleration, mm/sec^2",
    121: "Y-axis acceleration, mm/sec^2",
    122: "Z-axis acceleration, mm/sec^2",
    130: "X-axis maximum travel, millimeters",
    131: "Y-axis maximum travel, millimeters",
    132: "Z-axis maximum travel, millimeters",
};

/**
 * https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface#real-time-status-reports
 * Example: <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>
 * @param message
 * @returns
 */
function parseGrblStatus(message) {
    const parameters = message.slice(0, -1).split("|");
    const status = {
        type: "status",
        machine_state: parameters[0],
        sub_state: parameters[0].split(":")[1],
    };
    parameters.slice(1).forEach(str => {
        const [key, valueStr] = str.split(":");
        if (grblStatusKeys.has(key)) {
            const parse = grblStatusParsers[key];
            parse(status, valueStr);
        }
    });
    // Calculate MPos from WPos and WCO
    if (status.work_position && status.work_coordinate_offset) {
        status.machine_position = {
            x: status.work_position.x + status.work_coordinate_offset.x,
            y: status.work_position.y + status.work_coordinate_offset.z,
            z: status.work_position.z + status.work_coordinate_offset.z,
        };
    }
    // Calculate WPos from MPos and WCO
    else if (status.machine_position && status.work_coordinate_offset) {
        status.work_position = {
            x: status.machine_position.x - status.work_coordinate_offset.x,
            y: status.machine_position.y - status.work_coordinate_offset.z,
            z: status.machine_position.z - status.work_coordinate_offset.z,
        };
    }
    return status;
}
/**
 * A bunch of functions to parse the status parameters from the status response.
 * They modify the status object depending on the parameter being parsed.
 */
const grblStatusParsers = {
    "MPos": (status, s) => status.machine_position = stringToVector3(s),
    "WPos": (status, s) => status.work_position = stringToVector3(s),
    "F": (status, s) => status.feed = Number(s),
    "FS": (status, s) => { const [feed, speed] = s.split(",").map(s => Number(s)); status.feed = feed; status.speed = speed; },
    "WCO": (status, s) => status.work_coordinate_offset = stringToVector3(s),
    "Bf": (status, s) => status.buffer_state = s.split(",").map(s => Number(s)),
    "Ln": (status, s) => status.line_number = Number(s),
    "Pn": (status, s) => status.pin_state = s.split(""),
    "Ov": (status, s) => status.override_values = s.split(",").map(s => Number(s)),
    "A": (status, s) => status.accessory_state = s.split(""),
};
const grblStatusKeys = new Set(Object.keys(grblStatusParsers));
function stringToVector3(str) {
    const [x, y, z] = str.split(",").map(s => Number(s));
    return { x, y, z };
}

/*
    Official GRBL interface documentation:
    https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface
*/
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
function parseResponse(message) {
    // 1. ok
    if (message === "ok") {
        return {
            type: "ok",
        };
    }
    // 2. error: error:x
    if (message.startsWith("error")) {
        const code = Number(message.split(":")[1]);
        return {
            type: "error",
            code,
            description: GrblErrors[code] || "",
        };
    }
    // 3. welcome: Grbl X.Xx ['$' for help]
    if (message.startsWith("Grbl")) {
        return {
            type: "welcome",
        };
    }
    // 4. alarm: ALARM:x
    if (message.startsWith("ALARM")) {
        const code = Number(message.split(":")[1]);
        return {
            type: "alarm",
            code,
            description: GrblAlarms[code],
        };
    }
    // 5. settings: $x=val
    if (message.startsWith("$")) {
        const [settingStr, valueStr] = message.slice(1).split("=");
        return {
            type: "setting",
            setting: Number(settingStr),
            value: Number(valueStr),
        };
    }
    // 6. feedback: 
    if (message.startsWith("[") && message.startsWith("]")) {
        return {
            type: "feedback",
            message,
        };
    }
    // 7. startup: "">G54G20:ok" or "">G54G20:error:X"
    if (message.startsWith(">")) {
        const [line, outcome, errorNum] = message.slice(1).split(":");
        return {
            type: "startup",
            startup_line: line,
            error: outcome === "ok" ? null : Number(errorNum),
        };
    }
    // 8. status: <Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>
    if (message.startsWith("<") && message.endsWith(">")) {
        return parseGrblStatus(message.slice(1, -1));
    }
    // Error: message could not be parsed
    return {
        type: "unknown",
        message,
    };
}

const simpleCommands = {
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
};
// Official GRBL documentation:
// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface#interacting-with-grbls-systems
// https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands
// One important note is about the override command characters. These are defined in the extended-ASCII character space and are generally not type-able on a keyboard. A GUI must be able to send these 8-bit values to support overrides.
// The same principle can apply to scripts: control characters may not be recognized if sent as regular characters to the serial interface. When using pyserial, one option is to encode the hex code as a Python3 byte string, and pass it directly to the serial object. For example serial.write(b'\x18') sends a ctrl-x control character.
/**
 * https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands
 * A realtime command [...] does not require a line feed or carriage return after them.
 */
const realtimeCommands = {
    // These control characters are picked-off and removed from the
    // serial buffer when they are detected and do not require an
    // additional line-feed or carriage-return character to operate.
    status: "?",
    cycle_start_resume: "~",
    feed_hold: "!",
    soft_reset: 0x18,
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
};

function formatCommand(command) {
    // Format a command without parameters
    if (typeof command === "string") {
        if (simpleCommands.hasOwnProperty(command)) {
            const message = simpleCommands[command];
            return message + "\n";
        }
        else if (realtimeCommands.hasOwnProperty(command)) {
            const message = realtimeCommands[command];
            return message.toString();
        }
    }
    // Format a command with parameters
    if (typeof command === "object") {
        if (command.command === "gcode") {
            return command.value + "\n";
        }
        if (command.command === "save_startup_block") {
            return "$N=" + command.value + "\n";
        }
        if (command.command === "jog") {
            const { feedrate, X, Y, Z, gcode } = command;
            // const parameters = [gcode, X, Y, Z, feedrate].filter(value => value!==undefined)
            let parameters = [];
            if (gcode)
                parameters.push(gcode);
            if (X)
                parameters.push("X" + X);
            if (Y)
                parameters.push("Y" + Y);
            if (Z)
                parameters.push("Z" + Z);
            if (feedrate)
                parameters.push("F" + feedrate);
            return "$J=" + parameters.join(" ") + "\n";
        }
    }
    throw Error("Command not recognized: " + JSON.stringify(command));
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

export { GrblAlarms, GrblErrors, GrblSettings, formatCommand, parseResponse };
//# sourceMappingURL=index.mjs.map

# GRBL Interpreter

![Inkscape-parser banner](https://github.com/imivi/grbl-interpreter/blob/main/docs/grbl-interpreter-banner.png?raw=true)

[GRBL](https://github.com/gnea/grbl) is an open source firmware for CNC machines, designed around the Atmega328p (i.e. Arduino Uno and Nano, mainly).

This is a Typescript-first library to send correctly formatted GRBL messages, and interpret GRBL responses. All responses and commands are fully typed! Benefits:

- No more fumbling around with string formatting and parsing
- Enjoy autocomplete when sending and receiving messages to/from GRBL

Check out these page for the official documentation on GRBL messages:
* GRBL responses (what GRBL sends): https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface
* GRBL commands (what GRBL receives): https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands

## Why use this library?

If you want to ask GRBL for the current position, instead of having to handle this message...

`<Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>`

...you can simple call `parseResponse(grbl_message_string)` to get this piece of data:

```js
{
    type: "status",
    machine_state: "Idle",
    machine_position: { x: 0, y: 0, z: 0 },
    feed: 0,
    speed: 0,
    work_coordinate_offset: { x: 0, y: 0, z: 0 },
}
```

Sending messages is a similar story. Normally, if you want to tell GRBL to home, you have to send a specific string (`$H`). If you want to jog the machine, you have to piece together a jog message like `$J=X10.0 Y-1.5 F100`. You have to know the exact formatting that GRBL expects. As you can imagine, this gets old really quickly.

Instead, you can call `formatCommand("run_homing_cycle")` and you will get `"$H\n"`. This way you get full autocomplete while typing the command.

For commands that take some parameters (like jogging), you can instead pass an object like this:

```js
const command = formatCommand({
    command: "jog",
    feedrate: 400,
    gcode: "G91",
    X: 10,
    Y: 10,
})

console.log(command)
// Prints: "$J=G91 X10 Y10 F400\n"
```

You don't have to guess which parameters to pass, because Typescript tells them for you once you have entered the command value (the way this works is with [discriminated unions](https://basarat.gitbook.io/typescript/type-system/discriminated-unions)).

Additionally, some commands ([realtime commands](https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#grbl-v11-realtime-commands)), do not require a line feed or carriage return after them. You don't have to worry about this because `formatCommand()` adds carriage returns automatically if applicable.

## How to use

```js
import { parseResponse, formatRequest } from "grbl-interpreter"

console.log(parseResponse("error:5"))
// Prints: { type: "error", code: 5, description: "Homing cycle is not enabled via settings." }

grblMessage = "<Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>"

```


## FAQ

### **Q**: Ok, but how do I use this???

This is 
This library does not actually send anything (you would want to pair it with a NodeJS serial library like [serialport](https://serialport.io/)).

### **Q**: Is this library standalone? Can I just use it to communicate with a Microcontroller

### **Q**: Is this compatible with [grblHAL](https://github.com/grblHAL)/[FluidNC](https://github.com/bdring/FluidNC)/[insert your GRBL spinoff here]?

### **Q**: Is this like Universal Gcode Sender or CNCjs?

**A**: No, this is just a Javascript/Typescript that handles the conversion from GRBL messages (raw strings) into data that's more useful. This library does not actually send anything (you would want to pair it with a NodeJS serial library like [serialport](https://serialport.io/)). This library is meant for folks who are writing their own G-Code senders.
import { Status } from "./responses"
import { parseResponse } from "./parseResponse"


const input = "<Idle|MPos:0.000,0.000,0.000|FS:0,0|WCO:0.000,0.000,0.000>"

const output: Status = {
    type: "status",
    machine_state: "Idle",
    machine_position: { x: 0, y: 0, z: 0 },
    feed: 0,
    speed: 0,
    work_coordinate_offset: { x: 0, y: 0, z: 0 },
}

test("Parse status response", () => {
    expect(parseResponse(input)).toMatchObject(output)
})
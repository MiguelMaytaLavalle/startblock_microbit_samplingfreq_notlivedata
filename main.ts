function sendData () {
    basic.showString("B")
    for (let värde of tmpListLF) {
        bluetooth.uartWriteValue("LF", värde)
        counter_LF = counter_LF + 1
        if (counter_LF == 100) {
            counter_LF = 0
            basic.pause(0)
        }
    }
    basic.pause(100)
    for (let värde of tmpListRF) {
        bluetooth.uartWriteValue("RF", värde)
        counter_RF = counter_RF + 1
        if (counter_RF == 100) {
            counter_RF = 0
            basic.pause(0)
        }
    }
    basic.showIcon(IconNames.Happy)
}
function initConstants () {
    music.setVolume(0)
    k_LF = 1.8379
    m_LF = -901
    k_RF = 2.0824
    m_RF = -1026
    invers = 1023
    start = 0
    counter = 0
    bt_c = 0
    g = 9.82
    list_Right = []
    list_Left = []
    counter_RF = 0
    counter_LF = 0
    tmpListLF = []
    tmpListRF = []
}
bluetooth.onBluetoothConnected(function () {
    basic.showString("C")
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showString("D")
    control.reset()
})
function readAnalog () {
    let offset_left = 0
    let offset_right = 0
    let subtract_LF = 0
    let subtract_RF = 0
    tmp_RF = pins.analogReadPin(AnalogPin.P1) - subtract_RF
    tmp_LF = pins.analogReadPin(AnalogPin.P2) - subtract_LF
    var_RF = invers - tmp_RF
    var_LF = invers - tmp_LF
    var_RF = var_RF - offset_right
    var_LF = var_LF - offset_left
    bluetooth.uartWriteValue("RF", var_RF)
    bluetooth.uartWriteValue("LF", var_LF)
    bluetooth.uartWriteValue("MS", input.runningTime())
}
function testSendData () {
    basic.showString("T")
    basic.pause(100)
    bluetooth.uartWriteString("LF")
    for (let varde of list_Left) {
        let tmp = varde.toString();
bluetooth.uartWriteLine(tmp)
    }
    bluetooth.uartWriteString("RF")
    for (let varde of list_Right) {
        let tmp = varde.toString();
bluetooth.uartWriteLine(tmp)
    }
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    basic.showString("C")
    start = 1
    initCountdown()
})
function startSampling () {
    while (bt_c == 0) {
        if (counter < 5) {
            sampleToLists()
        } else {
            bt_c = 1
            test()
        }
        basic.pause(1000)
    }
}
function test () {
    tmpListLF = list_Left
    tmpListRF = list_Right
    list_Left = []
    list_Right = []
}
function testSampling () {
    for (let index = 0; index < 100; index++) {
        var_LF = tmp2
        list_Left.push(var_LF)
        var_RF = tmp2
        list_Right.push(var_RF)
        tmp2 = tmp2 + 1
    }
    counter = counter + 1
}
function initServices () {
    bluetooth.startUartService()
    bluetooth.setTransmitPower(7)
}
function sendToClient () {
    basic.showString("S")
    sendData()
    basic.pause(1000)
    bluetooth.uartWriteValue("D", 0)
}
function falseStart () {
	
}
function initCountdown () {
    for (let index = 0; index <= 2; index++) {
        music.playTone(392, music.beat(BeatFraction.Half))
        basic.showNumber(3 - index)
    }
    music.playTone(698, music.beat(BeatFraction.Whole))
}
function reset () {
    list_Left = []
    list_Right = []
    start = 0
    number = 0
    counter = 0
}
function sampleToLists () {
    for (let index = 0; index < 200; index++) {
        tmp_RF = invers - pins.analogReadPin(AnalogPin.P1)
        var_RF = k_RF * tmp_RF + m_RF
        list_Right.push(var_RF)
        tmp_LF = invers - pins.analogReadPin(AnalogPin.P2)
        var_LF = k_LF * tmp_LF + m_LF
        list_Left.push(var_LF)
    }
    counter = counter + 1
}
let number = 0
let tmp2 = 0
let var_LF = 0
let var_RF = 0
let tmp_LF = 0
let tmp_RF = 0
let list_Left: number[] = []
let list_Right: number[] = []
let g = 0
let bt_c = 0
let counter = 0
let start = 0
let invers = 0
let m_RF = 0
let k_RF = 0
let m_LF = 0
let k_LF = 0
let counter_RF = 0
let tmpListRF: number[] = []
let counter_LF = 0
let tmpListLF: number[] = []
initServices()
initConstants()
basic.showLeds(`
    # . . # #
    # . . # #
    # # # . .
    # . # . .
    # # # . .
    `)
basic.forever(function () {
    if (start == 1) {
        start = 0
        startSampling()
    }
    if (bt_c == 1) {
        bt_c = 0
        sendToClient()
        reset()
    }
})

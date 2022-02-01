def startConstants():
    global k_LF, m_LF, k_RF, m_RF, invers, start, counter, bt_c
    k_LF = 1.8379
    m_LF = -901
    k_RF = 2.0824
    m_RF = -1026
    invers = 1023
    start = 0
    counter = 0
    bt_c = 0
def sendData():
    global list_Left, list_Right
    basic.show_string("B")
    for värde in list_Left:
        basic.pause(1)
        bluetooth.uart_write_value("LF", värde)
    for värde2 in list_Right:
        basic.pause(1)
        bluetooth.uart_write_value("RF", värde2)
    list_Left = []
    list_Right = []
    basic.show_icon(IconNames.HAPPY)

def on_bluetooth_connected():
    basic.show_string("C")
bluetooth.on_bluetooth_connected(on_bluetooth_connected)

def on_bluetooth_disconnected():
    basic.show_string("D")
    control.reset()
bluetooth.on_bluetooth_disconnected(on_bluetooth_disconnected)

def readAnalog():
    global tmp_RF, tmp_LF, var_RF, var_LF
    offset_left = 0
    offset_right = 0
    subtract_LF = 0
    subtract_RF = 0
    tmp_RF = pins.analog_read_pin(AnalogPin.P1) - subtract_RF
    tmp_LF = pins.analog_read_pin(AnalogPin.P2) - subtract_LF
    var_RF = invers - tmp_RF
    var_LF = invers - tmp_LF
    var_RF = var_RF - offset_right
    var_LF = var_LF - offset_left
    bluetooth.uart_write_value("RF", var_RF)
    bluetooth.uart_write_value("LF", var_LF)
    bluetooth.uart_write_value("MS", input.running_time())
def testSendData():
    basic.show_string("T")
    # for (let varde of list_Left) {
    for i in range(len(list_Left)):
        # let list: number[] = []
        tmp = str(list_Left[i])
        list_Left.remove_at(i)
        bluetooth.uart_write_line(tmp)

def on_uart_data_received():
    global start
    basic.show_icon(IconNames.YES)
    start = 1
bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE),
    on_uart_data_received)

def sampling():
    global tmp_RF, var_RF, tmp_LF, var_LF, counter
    for index in range(200):
        tmp_RF = invers - pins.analog_read_pin(AnalogPin.P1)
        var_RF = k_RF * tmp_RF + m_RF
        list_Right.append(var_RF)
        tmp_LF = invers - pins.analog_read_pin(AnalogPin.P2)
        var_LF = k_LF * tmp_LF + m_LF
        list_Left.append(var_LF)
    counter = counter + 1
def testSampling():
    global check, var_LF, tmp2, counter
    check = 0
    for index2 in range(200):
        var_LF = tmp2
        list_Left.append(var_LF)
        tmp2 = tmp2 + 1
    counter = counter + 1
    basic.show_number(counter)
def sampleFiveSeconds():
    global bt_c
    while bt_c == 0:
        if counter < 5:
            testSampling()
        else:
            bt_c = 1
        basic.pause(1000)
def reset():
    global start, number, bt_c, counter
    start = 0
    number = 0
    bt_c = 0
    counter = 0
number = 0
check = 0
var_LF = 0
var_RF = 0
tmp_LF = 0
tmp_RF = 0
bt_c = 0
counter = 0
start = 0
invers = 0
m_RF = 0
k_RF = 0
m_LF = 0
k_LF = 0
list_Left: List[number] = []
list_Right: List[number] = []
tmp2 = 0
tmp2 = 0
bluetooth.start_uart_service()
startConstants()
list_Right = []
list_Left = []
bluetooth.set_transmit_power(7)
basic.show_leds("""
    # . . # #
        # . . # #
        # # # . .
        # . # . .
        # # # . .
""")

def on_forever():
    global bt_c, start
    if start == 1:
        sampleFiveSeconds()
    if bt_c == 1:
        bt_c = 0
        basic.show_string("S")
        testSendData()
        reset()
        basic.pause(1000)
        bluetooth.uart_write_value("D", 0)
        basic.pause(1000)
        start = 0
basic.forever(on_forever)

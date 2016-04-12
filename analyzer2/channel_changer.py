from subprocess import call
import sched, time

s = sched.scheduler(time.time, time.sleep)
allChannels = [1,2,3,4,5,6,7,8,9,10,11,36,38,40,42,44,46,48,149,151,153,155,157,159,161,165]
index = 0
def change_channel():
    global index
    command = "iwconfig wlan0 channel %i" %allChannels[index%26]
    call(command,shell=True) 
    index += 1
    s.enter(2, 1, change_channel, ())
    s.run()

s.enter(2, 1, change_channel, ())
s.run()

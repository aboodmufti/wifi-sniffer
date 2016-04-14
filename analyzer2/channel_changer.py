from subprocess import call
import sched, time
#call("ifconfig wlan0 down",shell=True)
#call("iwconfig wlan0 mode Monitor",shell=True)
#call("ifconfig wlan0 up",shell=True)
s = sched.scheduler(time.time, time.sleep)
allChannels = [1,2,3,4,5,6,7,8,9,10,11,36,38,40,42,44,46,48,149,151,153,155,157,159,161,165]
index = 0
def change_channel():
    global index
    command = "iwconfig wlan0 channel %i" %allChannels[index%26]
    call(command,shell=True) 
    #print "Channel : %i" %allChannels[index%26]
    index += 1
    s.enter(1, 1, change_channel, ())
    s.run()

s.enter(2, 1, change_channel, ())
s.run()

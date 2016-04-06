import socket 
from struct import *

flags = ["TSFT","FLAGS","RATE","CHANNEL","FHSS","ANTENNA_SIGNAL","ANTENNA NOISE","LOCK QUALITY","TX ATTENUATION","DB TX ATTENUATION","DBM TX POWER","ANTENNA","DB ANTENNA SIGNAL","DB ANTENNA NOISE","RX FLAGS", "B15", "B16", "B17", "B18", "MCS","A-MPDU STATUS", "VHT","B22","B23","B24","B25","B26","B27","B28","B29","B30","B30","B31"]

flags_sizes = [8,1,1,4,2,1,1,2,2,2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

channels = [0,2412,2417,2422,2427,2432,2437,2442,2447,2452,2457,2462]

frequencies_5 = [5180,5190,5200,5210,5220,5230,5240,5745,5755,5765,5775,5785,5795,5805,5825]
channels_5 = [36,38,40,42,44,46,48,149,151,153,155,157,159,161,165]

def reverseString(str):
	return str[::-1]

def removefirst2Chars(str):
	return str[2:]
	
def getCharAt(str,i):
	return strp[i:i+1]

#sudo airmon-ng start wlan0
rawSocket = socket.socket(socket.AF_PACKET, socket.SOCK_RAW, socket.htons(0x0003))
rawSocket.bind(("mon0", 0x0003))
ap_list = set()
ssid_list = set()
while True :
  pkt = rawSocket.recv(4096)
  
  if pkt[0] == "\x00" : 
    radio_version = unpack('<B',pkt[0])[0]
    radio_pad = unpack('<B',pkt[1])[0]
    radio_length = unpack('<H',pkt[2:4])[0]
    radio_present = unpack('<I',pkt[4:8])[0]
    #print "Version: %s | pad: %s | length: %s | present: %s" %(radio_version,radio_pad,radio_length,radio_present)
    #print("%s" %bin(int(unpack('<I',pkt[4:8])[0])))
    binNum = bin(int(unpack('<I',pkt[4:8])[0]))
    reveresedBin = reverseString(removefirst2Chars(binNum))
    offset = 0
    json = "{"
    for i in range(len(reveresedBin)):
		if reveresedBin[i] == "1":
			if i == 5:
				json += "\"SINGAL\" : %s ," %(unpack('<b',pkt[14:15])[0])
			if i == 3:
				raw_channel = unpack('<H',pkt[10:12])[0]
				json += "\"FREQUENCY\" : %s ," %raw_channel
				found = False
				for i in range(len(channels)):
					if raw_channel == channels[i]:
						json += "\"CHANNEL\" : %s ," %i
						found = True
						break
				if found == False:
					for i in range(len(frequencies_5)):
						if raw_channel == frequencies_5[i]:
							json += "\"CHANNEL\" : %s ," %channels_5[i]
							found = True
							break
			offset += flags_sizes[i]
			
    nextByte = removefirst2Chars(bin(int(unpack('<B',pkt[radio_length])[0])))
    
    if nextByte[0:4] == "1000" and nextByte[4:6] == "00" and nextByte[6:8] == "00":
		
		addr1 = hex(unpack('<B',pkt[radio_length+10])[0])[2:]
		addr2 = hex(unpack('<B',pkt[radio_length+11])[0])[2:]
		addr3 = hex(unpack('<B',pkt[radio_length+12])[0])[2:]
		addr4 = hex(unpack('<B',pkt[radio_length+13])[0])[2:]
		addr5 = hex(unpack('<B',pkt[radio_length+14])[0])[2:]
		addr6 = hex(unpack('<B',pkt[radio_length+15])[0])[2:]
		addr = "%s:%s:%s:%s:%s:%s" %(addr1,addr2,addr3,addr4,addr5,addr6)
		json += "MAC_ADDRESS: '%s:%s:%s:%s:%s:%s' ," %(addr1,addr2,addr3,addr4,addr5,addr6)
		
		beaconFrame = pkt[radio_length+36:]
		
		id = int(unpack('<B',beaconFrame[0])[0])
		if id == 0:
			length = int(unpack('<B',beaconFrame[1])[0])
			ssid_name = ""
			for j in range(0,length):
				char = unpack('<c',beaconFrame[2+j])[0]
				ssid_name += "%s" %char
			json += "\"SSID\" : \"%s\" }" %ssid_name
			if addr not in ap_list:
				ssid_list.add(ssid_name)
				ap_list.add(addr)
				print json 
            

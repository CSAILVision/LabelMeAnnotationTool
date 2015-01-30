import xml.etree.ElementTree as ET
from collections import defaultdict
import sys

def serialize(elem):
	dictio = defaultdict(list)
	for frame in elem:
		dictioaux = defaultdict(list)
		for fields in frame:
			if len(fields) > 0: 
				dictioaux[fields.tag].append(fields)
			else:
				dictioaux[fields.tag].append(fields.text)
		for i in dictioaux:
			dictio[i].append(dictioaux[i])
	return dictio
	# for key in dictio:
	# 	ET.SubElement(elem,"key").text = str(dictio[key])

def formatcoords(arr):
	arr2 = [", ".join(myList) for myList in arr]
	arr3 = "; ".join(arr2)
	return arr3

def formatcoordsbounding(arr):
	amax = map(max, arr)
	amin = map(min, arr)
	armax = ", ".join(amax)
	armin = ", ".join(amin)
	return [armin, armax]


filename = sys.argv[1]
polygons_enabled = True

tree = ET.parse(filename+'.xml')
root = tree.getroot()
framedict = serialize(root[0])
[root[0].remove(a) for a in root[0].findall('fr')]
fr = ET.SubElement(root[0], 'fr')
for key in framedict:
 	val = ", ".join(sum(framedict[key],[]))
 	print val
 	ET.SubElement(fr,key).text = val



for objectelem in root.findall('object'):
	dictio = serialize(objectelem)
	tf = ", ".join(sum(dictio['t'],[]))
	xf = []
	yf = []
	lf = []
	for polygonpt in dictio['pt']:
		xf.append([o[0].text for o in polygonpt])
		yf.append([o[1].text for o in polygonpt])
		lf.append([o[2].text for o in polygonpt])
	[objectelem.remove(a) for a in objectelem.findall('polygon')]
	pol = ET.SubElement(objectelem, 'polygon')
	ET.SubElement(pol,'t').text = tf
	ET.SubElement(pol,'l').text = formatcoords(lf)
	if polygons_enabled:
		ET.SubElement(pol,'x').text = formatcoords(xf)
		ET.SubElement(pol,'y').text = formatcoords(yf)
	else:
		ET.SubElement(pol,'xmax').text = formatcoordsbounding(xf)[1]
		ET.SubElement(pol,'xmin').text = formatcoordsbounding(yf)[0]
		ET.SubElement(pol,'ymax').text = formatcoordsbounding(xf)[1]
		ET.SubElement(pol,'ymin').text = formatcoordsbounding(yf)[0]



tree.write(filename+'2.xml')



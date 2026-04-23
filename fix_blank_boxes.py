import os
import xml.etree.ElementTree as ET

FILES_DIR = "d:/SY B.Tech/SEM 4/SE CP/files"
path = os.path.join(FILES_DIR, "08_deployment.drawio")

tree = ET.parse(path)
root = tree.getroot().find("root")

# Find the three devices and update their shape
for d_id in ["d1", "d2", "d3"]:
    node = root.find(f".//mxCell[@id='{d_id}']")
    if node is not None:
        # Change to a standard 3D Box (Cube) which renders natively without external stencils
        node.set("style", "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;")

# Also update the newly injected AI worker and Mock RTO to match the 3D look
for w_id in ["w_d_1", "w_d_2"]:
    node = root.find(f".//mxCell[@id='{w_id}']")
    if node is not None:
         node.set("style", "shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;")


tree.write(path)
print("Fixed Deployment shapes to 3D Cubes!")

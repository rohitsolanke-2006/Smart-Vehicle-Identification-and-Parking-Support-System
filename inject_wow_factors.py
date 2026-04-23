import os
import xml.etree.ElementTree as ET

FILES_DIR = "d:/SY B.Tech/SEM 4/SE CP/files"

def add_cell(root, id, value, style, x, y, w, h, parent="1", is_edge=False, edge_source=None, edge_target=None):
    cell = ET.SubElement(root, "mxCell", {"id": id})
    if value:
        cell.set("value", value)
    if style:
        cell.set("style", style)
    if is_edge:
        cell.set("edge", "1")
        if edge_source: cell.set("source", edge_source)
        if edge_target: cell.set("target", edge_target)
        # generic geometry for edge
        geom = ET.SubElement(cell, "mxGeometry", {"relative": "1", "as": "geometry"})
    else:
        cell.set("vertex", "1")
        ET.SubElement(cell, "mxGeometry", {"x": str(x), "y": str(y), "width": str(w), "height": str(h), "as": "geometry"})
    cell.set("parent", parent)

def update_use_case():
    path = os.path.join(FILES_DIR, "01_use_case.drawio")
    if not os.path.exists(path): return
    tree = ET.parse(path)
    root = tree.getroot().find("root")
    
    # 1. ANPR Camera Actor
    add_cell(root, "w_uc_1", "ANPR Camera\\n(IoT System)", "shape=mxgraph.uml.actor;fillColor=#000000;strokeColor=#000000;labelPosition=bottom;verticalLabelPosition=bottom;align=center;fontSize=13;verticalAlign=top;fontStyle=1;fontColor=#2563eb;", 80, 850, 50, 80)
    
    # 2. Scan Number Plate
    add_cell(root, "w_uc_2", "Scan Number Plate (ANPR)", "ellipse;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;fontStyle=1;", 370, 1040, 220, 65)
    
    # 3. Verify RTO Details
    add_cell(root, "w_uc_3", "Verify RTO Details (Mock API)", "ellipse;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;fontStyle=1;", 1080, 930, 240, 65)
    
    # 4. Predict Future Capacity (ML)
    add_cell(root, "w_uc_4", "Predict Future Capacity (ML)", "ellipse;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;fontStyle=1;", 1080, 1060, 240, 65)
    
    # Edges
    add_cell(root, "w_uc_e1", "", "endArrow=none;strokeColor=#2563eb;strokeWidth=2;", 0,0,0,0, is_edge=True, edge_source="w_uc_1", edge_target="w_uc_2")
    # Include Entry -> Scan Plate
    add_cell(root, "w_uc_i1", "«include»", "edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;endArrow=open;endFill=0;fontSize=11;strokeColor=#2563eb;", 0,0,0,0, is_edge=True, edge_source="23", edge_target="w_uc_2")
    # Include Entry -> Verify RTO
    add_cell(root, "w_uc_i2", "«include»", "edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;endArrow=open;endFill=0;fontSize=11;strokeColor=#2563eb;", 0,0,0,0, is_edge=True, edge_source="23", edge_target="w_uc_3")
    # Include Recommendation -> Predict ML
    add_cell(root, "w_uc_i3", "«include»", "edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;endArrow=open;endFill=0;fontSize=11;strokeColor=#2563eb;", 0,0,0,0, is_edge=True, edge_source="22", edge_target="w_uc_4")
    
    tree.write(path)

def update_class():
    path = os.path.join(FILES_DIR, "02_class.drawio")
    if not os.path.exists(path): return
    tree = ET.parse(path)
    root = tree.getroot().find("root")
    
    # ANPREngine
    add_cell(root, "w_c_1", "ANPREngine", "swimlane;fontStyle=1;align=center;startSize=36;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=14;", 80, 1100, 300, 120)
    add_cell(root, "w_c_1a", "- cameraIP : String\\n- modelVersion : String", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 36, 300, 40, parent="w_c_1")
    add_cell(root, "w_c_1b", "+ extractPlate(image) : String", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 76, 300, 40, parent="w_c_1")
    
    # MockRTOService
    add_cell(root, "w_c_2", "MockRTOService", "swimlane;fontStyle=1;align=center;startSize=36;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=14;", 700, 1100, 300, 120)
    add_cell(root, "w_c_2a", "- apiUrl : String\\n- apiKey : String", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 36, 300, 40, parent="w_c_2")
    add_cell(root, "w_c_2b", "+ verifyVehicle(regNo) : Map", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 76, 300, 40, parent="w_c_2")
    
    # MLPredictor
    add_cell(root, "w_c_3", "MLPredictor", "swimlane;fontStyle=1;align=center;startSize=36;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=14;", 1320, 1100, 300, 120)
    add_cell(root, "w_c_3a", "- modelWeights : File\\n- scaler : File", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 36, 300, 40, parent="w_c_3")
    add_cell(root, "w_c_3b", "+ predictCapacity(zone, time) : int", "text;strokeColor=none;fillColor=none;align=left;spacingLeft=10;fontSize=12;", 0, 76, 300, 40, parent="w_c_3")
    
    tree.write(path)

def update_deployment():
    path = os.path.join(FILES_DIR, "08_deployment.drawio")
    if not os.path.exists(path): return
    tree = ET.parse(path)
    root = tree.getroot().find("root")
    
    # AI Worker
    add_cell(root, "w_d_1", "«execution environment»\\nAI / Vision Worker Node\\nPython + OpenCV", "swimlane;fontStyle=1;align=center;startSize=60;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;", 640, 850, 260, 200)
    add_cell(root, "w_d_1a", "«artifact»\\nANPR Script (.py)", "shape=mxgraph.uml.component;fillColor=#ffffff;strokeColor=#000000;fontSize=12;whiteSpace=wrap;", 660, 930, 220, 50)
    add_cell(root, "w_d_1b", "«model»\\nEasyOCR / YOLO Weights", "shape=mxgraph.uml.component;fillColor=#ffffff;strokeColor=#000000;fontSize=12;whiteSpace=wrap;", 660, 990, 220, 40)
    
    # Mock RTO
    add_cell(root, "w_d_2", "«execution environment»\\nExternal API Server\\nMock RTO Integration", "swimlane;fontStyle=1;align=center;startSize=60;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;", 1480, 850, 280, 140)
    add_cell(root, "w_d_2a", "«service»\\nVAHAN Dummy Endpoint", "shape=mxgraph.uml.component;fillColor=#ffffff;strokeColor=#000000;fontSize=12;whiteSpace=wrap;", 1500, 930, 240, 50)
    
    tree.write(path)

def update_component():
    path = os.path.join(FILES_DIR, "07_component.drawio")
    if not os.path.exists(path): return
    tree = ET.parse(path)
    root = tree.getroot().find("root")
    
    add_cell(root, "w_co_1", "«component»\\nANPR Engine (OpenCV)", "shape=mxgraph.uml.component;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=12;whiteSpace=wrap;fontStyle=1;", 660, 980, 230, 60)
    add_cell(root, "w_co_2", "«component»\\nScikit-Learn Predictor", "shape=mxgraph.uml.component;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=12;whiteSpace=wrap;fontStyle=1;", 920, 980, 230, 60)
    add_cell(root, "w_co_3", "«component»\\nMock RTO Service", "shape=mxgraph.uml.component;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=12;whiteSpace=wrap;fontStyle=1;", 920, 900, 230, 60)
    
    tree.write(path)
    
def update_sequence():
    path = os.path.join(FILES_DIR, "04_sequence.drawio")
    if not os.path.exists(path): return
    tree = ET.parse(path)
    root = tree.getroot().find("root")
    
    add_cell(root, "w_sq_1", ":Mock RTO API", "rounded=1;whiteSpace=wrap;html=1;fillColor=#dbeafe;strokeColor=#2563eb;fontSize=13;fontStyle=1;", 1760, 65, 180, 50)
    add_cell(root, "w_sq_2", "", "endArrow=none;dashed=1;strokeColor=#2563eb;", 0,0,0,0, is_edge=True)
    # The array points for w_sq_2
    geom = root.find(".//mxCell[@id='w_sq_2']/mxGeometry")
    geom.attrib["relative"] = "1"
    a1 = ET.SubElement(geom, "Array")
    a1.attrib["as"] = "sourcePoint"
    ET.SubElement(a1, "mxPoint", {"x": "1850", "y": "115"})
    a2 = ET.SubElement(geom, "Array")
    a2.attrib["as"] = "targetPoint"
    ET.SubElement(a2, "mxPoint", {"x": "1850", "y": "1380"})
    
    # Add Mock RTO fetch arrow
    add_cell(root, "w_sq_3", "10.5: GET /rto/verify?plate=X", "endArrow=open;endFill=1;html=1;fontSize=12;strokeColor=#2563eb;fontColor=#2563eb;fontStyle=1;", 0,0,0,0, is_edge=True)
    g3 = root.find(".//mxCell[@id='w_sq_3']/mxGeometry")
    sp = ET.SubElement(g3, "Array", {"as": "sourcePoint"})
    ET.SubElement(sp, "mxPoint", {"x": "850", "y": "640"})
    tp = ET.SubElement(g3, "Array", {"as": "targetPoint"})
    ET.SubElement(tp, "mxPoint", {"x": "1850", "y": "640"})
    
    tree.write(path)


update_use_case()
update_class()
update_deployment()
update_component()
update_sequence()
print("Updated Draw.io XML files successfully!")

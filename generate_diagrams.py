import os

# Base draw.io XML structure
DRAWIO_HEADER = '''<mxfile host="app.diagrams.net" modified="2026-03-11T12:00:00.000Z" agent="Mozilla/5.0" version="21.0.0" type="device">
  <diagram id="diagram-1" name="Page-1">
    <mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />'''

DRAWIO_FOOTER = '''      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

def generate_class_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="C1" value="&lt;b&gt;User&lt;/b&gt;&lt;br&gt;&lt;hr&gt;- id: int&lt;br&gt;- name: str&lt;br&gt;- email: str&lt;br&gt;- role: str&lt;hr&gt;+ login()&lt;br&gt;+ logout()" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;" vertex="1" parent="1">
          <mxGeometry x="350" y="50" width="160" height="130" as="geometry" />
        </mxCell>
        <mxCell id="C2" value="&lt;b&gt;ParkingZone&lt;/b&gt;&lt;br&gt;&lt;hr&gt;- id: int&lt;br&gt;- zone_name: str&lt;br&gt;- capacity: int&lt;br&gt;- occupied: int&lt;br&gt;- status: str&lt;hr&gt;+ updateOccupancy()&lt;br&gt;+ getStatus()" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;" vertex="1" parent="1">
          <mxGeometry x="100" y="250" width="180" height="150" as="geometry" />
        </mxCell>
        <mxCell id="C3" value="&lt;b&gt;Vehicle&lt;/b&gt;&lt;br&gt;&lt;hr&gt;- reg_number: str&lt;br&gt;- entry_time: datetime&lt;br&gt;- is_misparked: bool&lt;hr&gt;+ recordEntry()&lt;br&gt;+ recordExit()&lt;br&gt;+ markMisParked()" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;" vertex="1" parent="1">
          <mxGeometry x="350" y="250" width="180" height="150" as="geometry" />
        </mxCell>
        <mxCell id="C4" value="&lt;b&gt;ParkingLog&lt;/b&gt;&lt;br&gt;&lt;hr&gt;- id: int&lt;br&gt;- action: str&lt;br&gt;- timestamp: datetime&lt;hr&gt;+ createLog()&lt;br&gt;+ generateAnalytics()" style="swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=1;marginBottom=0;html=1;" vertex="1" parent="1">
          <mxGeometry x="600" y="250" width="180" height="130" as="geometry" />
        </mxCell>
        <mxCell id="Edge1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=diamondThin;endFill=0;" edge="1" parent="1" source="C3" target="C1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="Edge2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;endFill=1;" edge="1" parent="1" source="C3" target="C2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="Edge3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;endFill=1;" edge="1" parent="1" source="C4" target="C3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_use_case_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="A1" value="Student" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="30" height="60" as="geometry" />
        </mxCell>
        <mxCell id="A2" value="Security Guard" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="300" width="30" height="60" as="geometry" />
        </mxCell>
        <mxCell id="A3" value="Manager" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="500" width="30" height="60" as="geometry" />
        </mxCell>
        <mxCell id="SC" value="Smart Parking System" style="swimlane;html=1;" vertex="1" parent="1">
          <mxGeometry x="250" y="50" width="400" height="600" as="geometry" />
        </mxCell>
        <mxCell id="U1" value="View Zone Availability" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="50" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="U2" value="Get Parking Recommendation" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="120" width="180" height="50" as="geometry" />
        </mxCell>
        <mxCell id="U3" value="Record Vehicle Entry" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="220" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="U4" value="Record Vehicle Exit" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="300" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="U5" value="Mark Mis-parked" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="380" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="U6" value="View Analytics &amp; Logs" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="SC">
          <mxGeometry x="100" y="480" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="E1" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A1" target="U1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E2" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A1" target="U2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E3" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A2" target="U3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E4" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A2" target="U4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E5" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A2" target="U5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E6" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="A3" target="U6">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_sequence_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="L1" value="Guard UI" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="50" width="100" height="400" as="geometry" />
        </mxCell>
        <mxCell id="L2" value="Vehicle API" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="300" y="50" width="100" height="400" as="geometry" />
        </mxCell>
        <mxCell id="L3" value="Database" style="shape=umlLifeline;perimeter=lifelinePerimeter;whiteSpace=wrap;html=1;container=1;collapsible=0;recursiveResize=0;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="500" y="50" width="100" height="400" as="geometry" />
        </mxCell>
        <mxCell id="M1" value="POST /entry (reg_no, zone)" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" edge="1" parent="1" source="L1" target="L2">
          <mxGeometry width="80" relative="1" as="geometry">
            <mxPoint x="150" y="120" as="sourcePoint" />
            <mxPoint x="350" y="120" as="targetPoint" />
            <Array as="points"><mxPoint x="250" y="120" /></Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="M2" value="Check zone capacity" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" edge="1" parent="1" source="L2" target="L3">
          <mxGeometry width="80" relative="1" as="geometry">
            <mxPoint x="350" y="150" as="sourcePoint" />
            <mxPoint x="550" y="150" as="targetPoint" />
            <Array as="points"><mxPoint x="450" y="150" /></Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="M3" value="Return capacity OK" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" edge="1" parent="1" source="L3" target="L2">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="550" y="180" as="sourcePoint" />
            <mxPoint x="350" y="180" as="targetPoint" />
            <Array as="points"><mxPoint x="450" y="180" /></Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="M4" value="Insert Vehicle &amp; Log" style="html=1;verticalAlign=bottom;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" edge="1" parent="1" source="L2" target="L3">
          <mxGeometry width="80" relative="1" as="geometry">
            <mxPoint x="350" y="220" as="sourcePoint" />
            <mxPoint x="550" y="220" as="targetPoint" />
            <Array as="points"><mxPoint x="450" y="220" /></Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="M5" value="Success Response (200 OK)" style="html=1;verticalAlign=bottom;endArrow=open;dashed=1;endSize=8;edgeStyle=elbowEdgeStyle;elbow=vertical;curved=0;rounded=0;" edge="1" parent="1" source="L2" target="L1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="350" y="260" as="sourcePoint" />
            <mxPoint x="150" y="260" as="targetPoint" />
            <Array as="points"><mxPoint x="250" y="260" /></Array>
          </mxGeometry>
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_activity_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="ACT1" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="385" y="40" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="ACT2" value="Guard inputs Reg No &amp; Zone" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="320" y="120" width="160" height="50" as="geometry" />
        </mxCell>
        <mxCell id="ACT3" value="Zone has capacity?" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="330" y="220" width="140" height="80" as="geometry" />
        </mxCell>
        <mxCell id="ACT4" value="Save Vehicle to DB" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="340" y="350" width="120" height="50" as="geometry" />
        </mxCell>
        <mxCell id="ACT5" value="Show 'Zone Full' Error" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="540" y="235" width="120" height="50" as="geometry" />
        </mxCell>
        <mxCell id="ACT6" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=none;strokeWidth=3;" vertex="1" parent="1">
          <mxGeometry x="380" y="450" width="40" height="40" as="geometry" />
        </mxCell>
        <mxCell id="ACT7" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;" vertex="1" parent="ACT6">
          <mxGeometry x="10" y="10" width="20" height="20" as="geometry" />
        </mxCell>
        <mxCell id="E_ACT1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ACT1" target="ACT2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ACT2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ACT2" target="ACT3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ACT3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ACT3" target="ACT4" value="Yes">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ACT4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ACT3" target="ACT5" value="No">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ACT5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ACT4" target="ACT6">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_state_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="ST1" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="100" y="185" width="30" height="30" as="geometry" />
        </mxCell>
        <mxCell id="ST2" value="Parked (Valid)" style="rounded=1;whiteSpace=wrap;html=1;arcSize=40;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="250" y="170" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="ST3" value="Mis-Parked (Flagged)" style="rounded=1;whiteSpace=wrap;html=1;arcSize=40;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1">
          <mxGeometry x="450" y="50" width="140" height="60" as="geometry" />
        </mxCell>
        <mxCell id="ST4" value="Exited (Logged)" style="rounded=1;whiteSpace=wrap;html=1;arcSize=40;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="450" y="290" width="120" height="60" as="geometry" />
        </mxCell>
        <mxCell id="ST5" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=none;strokeWidth=3;" vertex="1" parent="1">
          <mxGeometry x="680" y="300" width="40" height="40" as="geometry" />
        </mxCell>
        <mxCell id="ST6" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;" vertex="1" parent="ST5">
          <mxGeometry x="10" y="10" width="20" height="20" as="geometry" />
        </mxCell>
        <mxCell id="E_ST1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ST1" target="ST2" value="Entry recorded">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ST2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ST2" target="ST3" value="Guard flags vehicle">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ST3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ST2" target="ST4" value="Exit recorded">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ST4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ST3" target="ST4" value="Exit recorded (cleared)">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_ST5" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="ST4" target="ST5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_component_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="CMP1" value="Frontend (React/Vite)" style="module;whiteSpace=wrap;html=1;align=center;verticalAlign=top;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="100" y="150" width="140" height="100" as="geometry" />
        </mxCell>
        <mxCell id="CMP2" value="Backend API (FastAPI)" style="module;whiteSpace=wrap;html=1;align=center;verticalAlign=top;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
          <mxGeometry x="350" y="150" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="CMP3" value="Auth Service (JWT)" style="module;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="580" y="60" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="CMP4" value="Recommendation Engine" style="module;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;" vertex="1" parent="1">
          <mxGeometry x="580" y="140" width="140" height="50" as="geometry" />
        </mxCell>
        <mxCell id="CMP5" value="SQL Database" style="shape=cylinder3;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;size=15;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1">
          <mxGeometry x="385" y="350" width="80" height="100" as="geometry" />
        </mxCell>
        <mxCell id="E_C1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="CMP1" target="CMP2" value="HTTP JSON/REST">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_C2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;dashed=1;" edge="1" parent="1" source="CMP2" target="CMP3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_C3" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;dashed=1;" edge="1" parent="1" source="CMP2" target="CMP4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_C4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=classic;" edge="1" parent="1" source="CMP2" target="CMP5" value="SQLAlchemy ORM">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_deployment_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="D1" value="&lt;b&gt;Client Device (Node)&lt;/b&gt;" style="verticalAlign=top;align=center;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="80" y="150" width="150" height="180" as="geometry" />
        </mxCell>
        <mxCell id="D2" value="&lt;b&gt;Web Server (Node)&lt;/b&gt;" style="verticalAlign=top;align=center;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="350" y="150" width="180" height="200" as="geometry" />
        </mxCell>
        <mxCell id="D3" value="&lt;b&gt;Database Server (Node)&lt;/b&gt;" style="verticalAlign=top;align=center;spacingTop=8;spacingLeft=2;spacingRight=12;shape=cube;size=10;direction=south;fontStyle=4;html=1;whiteSpace=wrap;" vertex="1" parent="1">
          <mxGeometry x="630" y="150" width="160" height="180" as="geometry" />
        </mxCell>
        <mxCell id="A_D1" value="&lt;u&gt;React Frontend&lt;/u&gt;" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;" vertex="1" parent="1">
          <mxGeometry x="100" y="220" width="110" height="60" as="geometry" />
        </mxCell>
        <mxCell id="A_D2" value="&lt;u&gt;FastAPI Backend&lt;/u&gt;" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;" vertex="1" parent="1">
          <mxGeometry x="385" y="200" width="110" height="60" as="geometry" />
        </mxCell>
        <mxCell id="A_D3" value="&lt;u&gt;Python Uvicorn&lt;/u&gt;" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;" vertex="1" parent="1">
          <mxGeometry x="385" y="270" width="110" height="60" as="geometry" />
        </mxCell>
        <mxCell id="A_D4" value="&lt;u&gt;MySQL RDBMS&lt;/u&gt;" style="shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;" vertex="1" parent="1">
          <mxGeometry x="655" y="220" width="110" height="60" as="geometry" />
        </mxCell>
        <mxCell id="E_D1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=none;dashed=1;" edge="1" parent="1" source="D1" target="D2" value="HTTPS">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="E_D2" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;endArrow=none;dashed=1;" edge="1" parent="1" source="D2" target="D3" value="TCP/IP 3306">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_collaboration_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="CL1" value="Guard User" style="shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;" vertex="1" parent="1">
          <mxGeometry x="100" y="150" width="30" height="60" as="geometry" />
        </mxCell>
        <mxCell id="CL2" value="&lt;u&gt;:VehicleRouter&lt;/u&gt;" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="300" y="80" width="120" height="40" as="geometry" />
        </mxCell>
        <mxCell id="CL3" value="&lt;u&gt;:DatabaseSession&lt;/u&gt;" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="550" y="150" width="120" height="40" as="geometry" />
        </mxCell>
        <mxCell id="CL4" value="&lt;u&gt;newLog:ParkingLog&lt;/u&gt;" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="300" y="250" width="120" height="40" as="geometry" />
        </mxCell>
        <mxCell id="E_CL1" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="CL1" target="CL2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="TXT1" value="1. submitEntryForm(regNo, zone)" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
          <mxGeometry x="120" y="90" width="200" height="30" as="geometry" />
        </mxCell>
        <mxCell id="E_CL2" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="CL2" target="CL3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="TXT2" value="2. check_zone_capacity()" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
          <mxGeometry x="400" y="90" width="160" height="30" as="geometry" />
        </mxCell>
        <mxCell id="E_CL3" style="edgeStyle=none;html=1;endArrow=none;" edge="1" parent="1" source="CL2" target="CL4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="TXT3" value="3. create(action='ENTRY')" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
          <mxGeometry x="340" y="160" width="160" height="30" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

def generate_object_diagram():
    return f"""{DRAWIO_HEADER}
        <mxCell id="O1" value="&lt;u&gt;john_doe:User&lt;/u&gt;&lt;br&gt;&lt;hr&gt;id = 1&lt;br&gt;email = 'john@vit.edu'&lt;br&gt;role = 'student'" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=4;" vertex="1" parent="1">
          <mxGeometry x="100" y="100" width="160" height="80" as="geometry" />
        </mxCell>
        <mxCell id="O2" value="&lt;u&gt;zoneA:ParkingZone&lt;/u&gt;&lt;br&gt;&lt;hr&gt;id = 1&lt;br&gt;zone_name = 'North Wing'&lt;br&gt;capacity = 100&lt;br&gt;occupied = 45" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=4;" vertex="1" parent="1">
          <mxGeometry x="350" y="100" width="180" height="90" as="geometry" />
        </mxCell>
        <mxCell id="O3" value="&lt;u&gt;car123:Vehicle&lt;/u&gt;&lt;br&gt;&lt;hr&gt;reg_number = 'MH12AB1234'&lt;br&gt;entry_time = '09:00 AM'&lt;br&gt;is_misparked = false" style="rounded=0;whiteSpace=wrap;html=1;align=left;verticalAlign=top;spacingLeft=4;" vertex="1" parent="1">
          <mxGeometry x="350" y="300" width="180" height="90" as="geometry" />
        </mxCell>
        <mxCell id="E_O1" style="edgeStyle=none;html=1;endArrow=none;dashed=1;" edge="1" parent="1" source="O3" target="O2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="TXT_O1" value="parked in" style="text;html=1;align=center;verticalAlign=middle;resizable=0;points=[];autosize=1;strokeColor=none;fillColor=none;" vertex="1" parent="1">
          <mxGeometry x="440" y="240" width="70" height="30" as="geometry" />
        </mxCell>
{DRAWIO_FOOTER}"""

# Generate all 9 files
diagrams = {
    "Class_Diagram": generate_class_diagram,
    "Use_Case_Diagram": generate_use_case_diagram,
    "Sequence_Diagram": generate_sequence_diagram,
    "Activity_Diagram": generate_activity_diagram,
    "State_Diagram": generate_state_diagram,
    "Component_Diagram": generate_component_diagram,
    "Deployment_Diagram": generate_deployment_diagram,
    "Collaboration_Diagram": generate_collaboration_diagram,
    "Object_Diagram": generate_object_diagram
}

os.makedirs("d:/SY B.Tech/SEM 4/SE CP/diagrams", exist_ok=True)

for name, func in diagrams.items():
    with open(f"d:/SY B.Tech/SEM 4/SE CP/diagrams/{name}.drawio", "w") as f:
        f.write(func())

print("Successfully generated all 9 draw.io XML files in the 'diagrams' folder!")

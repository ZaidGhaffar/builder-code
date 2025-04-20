I'm working on a React.js project with traditional CSS (no CSS modules or styled-components).
The component structure and class names must remain unchanged because they're connected to the backend.
Only CSS responsiveness is needed.

I have a front-end layout with the following key components:
- Area-panel.css → for the Sidebar (Left Panel)
- Floating Tool Bar → for the Toolbar (Top Center)
- Floating-pane.css → for the Zoom and Scale Controls
- Measurement-canvas.css → for the Main Canvas (Center)


#  Important Constraints:
- Do not rename or modify any class names.
- Do not change or move any JSX/HTML structure or logic.
- Only modify or add CSS rules to make the UI fully responsive.

 
# My Design Goal:
- Sidebar should become a collapsible drawer or stack vertically under toolbar on mobile.
- The floating toolbar should wrap or center on smaller screens.
- Zoom & scale controls should adjust their position, e.g. align to bottom-center or float above the canvas on smaller screens.
- The canvas should scale to fit the screen, with scroll support if needed.
- Use clean media queries, flexbox/grid, and percentage-based widths to adapt.
- Reference layout should match the clean, responsive style from the sample UI (image provided).



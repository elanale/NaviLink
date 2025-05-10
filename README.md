How to Use the Map Visualizer

This tool helps you visualize the shortest path between two addresses using Dijkstra's algorithm. Follow the steps below to get started.

1. Enter Start and Destination Addresses

From: Enter your starting address (e.g., 3150 Hull Rd, Gainesville, FL).
To: Enter your destination (e.g., Marston Science Library).
Click the "Find Path" button to generate the route.
2. How It Works

The app converts the addresses into geographic coordinates using OpenStreetMap's geocoding service. It then finds the nearest nodes in the graph and calculates the shortest path between them using Dijkstra's algorithm. This path is drawn on the map using real coordinates and distances.

3. Interactive Map Features

The path is shown as a series of connected lines on the map.
Each segment is revealed step-by-step to show the routing progress.
Total distance is calculated and displayed in miles.
4. Playback Controls

Back: Move to the previous step in the path.
Play: Animate through the entire path automatically.
Next: Move forward one segment at a time.
5. Technical Details

Frontend: Next.js and React
Map Rendering: Leaflet with custom React components
Algorithm: Dijkstra's Algorithm for pathfinding
Data Sources: CSV (graph edges), JSON (node coordinates)
Geocoding: OpenStreetMap Nominatim API

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Interactive Cyberpunk Icosphere</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #0a0a12;
      cursor: none;
      font-family: 'Courier New', monospace;
    }
    
    #canvas-container {
      position: relative;
      width: 100vw;
      height: 100vh;
    }
    
    canvas {
      position: absolute;
      top: 0;
      left: 0;
    }
    
    .cursor {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,0,204,0.8) 0%, rgba(0,204,255,0) 70%);
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 999;
      box-shadow: 0 0 15px 5px rgba(0, 255, 255, 0.3);
    }
    
    .cursor::after {
      content: "";
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #00ffff;
      top: 5px;
      left: 5px;
    }
    
    .info {
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: #00ffff;
      font-size: 12px;
      z-index: 100;
      opacity: 0.7;
      text-shadow: 0 0 5px #ff00cc;
    }
  </style>
</head>
<body>
  <div id="canvas-container">
    <canvas id="scene"></canvas>
    <div class="cursor"></div>
    <div class="info">MOVE CURSOR TO INTERACT | DRAG ICOSPHERE TO REPOSITION | CLICK OUTSIDE TO CHANGE COLOR</div>
  </div>

  <script>
    // Initialize variables
    const canvas = document.getElementById('scene');
    const ctx = canvas.getContext('2d');
    const cursor = document.querySelector('.cursor');
    
    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Dragging state
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    
    // Shape properties
    let shape = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      scale: 100, // Base scale for the sphere
      velocityX: 2.5,
      velocityY: 2.0,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      currentColorScheme: 0,
      colorSchemes: [
        ['#ff00cc', '#00ffcc', '#ff00ff', '#00ccff'], // Default cyberpunk
        ['#ff6600', '#ffcc00', '#ff3300', '#ff9900'], // Orange fire
        ['#00ff66', '#33ff99', '#00cc33', '#66ffcc'], // Matrix green
        ['#9900ff', '#cc66ff', '#6600cc', '#cc33ff']  // Neon purple
      ]
    };
    
    // Mouse position
    let mouse = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      influence: 0.08 // How much the mouse affects the shape
    };

    // Define icosphere generation functions
    
    // Normalize a vertex to lie on the unit sphere
    function normalizeVertex(v) {
      const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      return {
        x: v.x / length,
        y: v.y / length,
        z: v.z / length
      };
    }
    
    // Get the middle point between two vertices
    function getMiddlePoint(v1, v2, vertices) {
      // Create a key for the edge to check if we already have this vertex
      const key = `${Math.min(v1, v2)}_${Math.max(v1, v2)}`;
      
      // First check if we already have this vertex
      if (middlePointCache[key] !== undefined) {
        return middlePointCache[key];
      }
      
      // If not, calculate it
      const point1 = vertices[v1];
      const point2 = vertices[v2];
      
      // Get the middle point
      const middle = {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
        z: (point1.z + point2.z) / 2
      };
      
      // Normalize to ensure it's on the sphere
      const normalizedMiddle = normalizeVertex(middle);
      
      // Add the vertex to our vertices array
      const idx = vertices.length;
      vertices.push(normalizedMiddle);
      
      // Cache this calculation for later use
      middlePointCache[key] = idx;
      
      return idx;
    }
    
    // Cache for middle point calculations
    const middlePointCache = {};
    
    // Generate icosphere vertices and faces
    function generateIcosphere(subdivisions = 1) {
      // Start with an icosahedron (20-sided polyhedron)
      // This gives us a nice base to subdivide for our icosphere
      const t = (1.0 + Math.sqrt(5.0)) / 2.0;
      
      const vertices = [
        normalizeVertex({ x: -1, y: t, z: 0 }),
        normalizeVertex({ x: 1, y: t, z: 0 }),
        normalizeVertex({ x: -1, y: -t, z: 0 }),
        normalizeVertex({ x: 1, y: -t, z: 0 }),
        
        normalizeVertex({ x: 0, y: -1, z: t }),
        normalizeVertex({ x: 0, y: 1, z: t }),
        normalizeVertex({ x: 0, y: -1, z: -t }),
        normalizeVertex({ x: 0, y: 1, z: -t }),
        
        normalizeVertex({ x: t, y: 0, z: -1 }),
        normalizeVertex({ x: t, y: 0, z: 1 }),
        normalizeVertex({ x: -t, y: 0, z: -1 }),
        normalizeVertex({ x: -t, y: 0, z: 1 })
      ];
      
      // Define the 20 triangular faces of the icosahedron
      let faces = [
        // 5 faces around point 0
        [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        // 5 adjacent faces
        [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        // 5 faces around point 3
        [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        // 5 adjacent faces
        [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
      ];
      
      // Refine the sphere by subdividing faces
      for (let i = 0; i < subdivisions; i++) {
        const newFaces = [];
        
        // Subdivide each triangle into 4 triangles
        for (const face of faces) {
          const v1 = face[0];
          const v2 = face[1];
          const v3 = face[2];
          
          // Get middle points of each edge
          const a = getMiddlePoint(v1, v2, vertices);
          const b = getMiddlePoint(v2, v3, vertices);
          const c = getMiddlePoint(v3, v1, vertices);
          
          // Add the 4 new triangles
          newFaces.push([v1, a, c]);
          newFaces.push([v2, b, a]);
          newFaces.push([v3, c, b]);
          newFaces.push([a, b, c]);
        }
        
        faces = newFaces;
      }
      
      return { vertices, faces };
    }
    
    // Generate edges from faces
    function generateEdgesFromFaces(faces) {
      const edgeSet = new Set();
      const edges = [];
      
      for (const face of faces) {
        const addEdge = (a, b) => {
          const minIdx = Math.min(a, b);
          const maxIdx = Math.max(a, b);
          const key = `${minIdx}_${maxIdx}`;
          
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push([a, b]);
          }
        };
        
        addEdge(face[0], face[1]);
        addEdge(face[1], face[2]);
        addEdge(face[2], face[0]);
      }
      
      return edges;
    }
    
    // Initialize icosphere geometry with 2 subdivisions for a nice balance of detail and performance
    const { vertices, faces } = generateIcosphere(2);
    const edges = generateEdgesFromFaces(faces);
    
    // Project 3D point to 2D with perspective
    function project(point3D) {
      const focalLength = 300;
      const z = point3D.z * shape.scale;
      const scale = focalLength / (focalLength + z);
      
      return {
        x: point3D.x * scale * shape.scale + shape.x,
        y: point3D.y * scale * shape.scale + shape.y,
        z: z,
        scale: scale
      };
    }
    
    // Rotate a point in 3D space
    function rotatePoint(point) {
      let {x, y, z} = point;
      
      // Rotate around X axis
      const cosX = Math.cos(shape.rotationX);
      const sinX = Math.sin(shape.rotationX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      
      // Rotate around Y axis
      const cosY = Math.cos(shape.rotationY);
      const sinY = Math.sin(shape.rotationY);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      
      // Rotate around Z axis
      const cosZ = Math.cos(shape.rotationZ);
      const sinZ = Math.sin(shape.rotationZ);
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;
      
      return { x: x3, y: y3, z: z2 };
    }
    
    // Draw the sphere
    function drawIcosphere() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply rotation
      shape.rotationX += 0.005;
      shape.rotationY += 0.007;
      shape.rotationZ += 0.003;
      
      // Only move shape based on velocity if not being dragged
      if (!isDragging) {
        shape.x += shape.velocityX;
        shape.y += shape.velocityY;
        
        // Bounce off walls
        if (shape.x < shape.scale || shape.x > canvas.width - shape.scale) {
          shape.velocityX *= -1;
          // Add a random jitter to velocity
          shape.velocityX += (Math.random() - 0.5) * 0.5;
          
          // Add a small vibration on wall bounce
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }
        
        if (shape.y < shape.scale || shape.y > canvas.height - shape.scale) {
          shape.velocityY *= -1;
          // Add a random jitter to velocity
          shape.velocityY += (Math.random() - 0.5) * 0.5;
          
          // Add a small vibration on wall bounce
          if (navigator.vibrate) {
            navigator.vibrate(20);
          }
        }
        
        // Keep velocity in reasonable range
        shape.velocityX = Math.max(-4, Math.min(4, shape.velocityX));
        shape.velocityY = Math.max(-4, Math.min(4, shape.velocityY));
        
        // Attract to mouse position when not dragging
        const mouseAttractX = (mouse.x - shape.x) * mouse.influence;
        const mouseAttractY = (mouse.y - shape.y) * mouse.influence;
        shape.velocityX += mouseAttractX;
        shape.velocityY += mouseAttractY;
      }
      
      // Transform points (rotate and project)
      const transformedVertices = vertices.map(point => {
        const rotated = rotatePoint(point);
        return project(rotated);
      });
      
      // Sort faces by z-depth for proper rendering (painter's algorithm)
      const sortedFaces = [...faces].map((face, index) => {
        // Calculate average z value of face
        const avgZ = face.reduce((sum, vertexIndex) => {
          return sum + transformedVertices[vertexIndex].z;
        }, 0) / face.length;
        
        return { face, avgZ, index };
      }).sort((a, b) => a.avgZ - b.avgZ);
      
      const time = Date.now() / 1000;
      const pulse = (Math.sin(time * 2) + 1) / 2; // For pulsing effects
      const colors = shape.colorSchemes[shape.currentColorScheme];
      
      // Draw faces (back to front)
      sortedFaces.forEach((faceData, i) => {
        const { face, index } = faceData;
        
        ctx.beginPath();
        ctx.moveTo(transformedVertices[face[0]].x, transformedVertices[face[0]].y);
        ctx.lineTo(transformedVertices[face[1]].x, transformedVertices[face[1]].y);
        ctx.lineTo(transformedVertices[face[2]].x, transformedVertices[face[2]].y);
        ctx.closePath();
        
        // Create gradient for this face
        const gradX = transformedVertices[face[0]].x;
        const gradY = transformedVertices[face[0]].y;
        const gradRadius = shape.scale * Math.max(0.5, transformedVertices[face[0]].scale);
        
        const gradient = ctx.createRadialGradient(
          gradX, gradY, 0,
          gradX, gradY, gradRadius
        );
        
        const colorIndex1 = index % colors.length;
        const colorIndex2 = (index + 2) % colors.length;
        
        gradient.addColorStop(0, colors[colorIndex1] + 'cc');
        gradient.addColorStop(1, colors[colorIndex2] + '77');
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Draw edges with glow effect
      edges.forEach((edge, i) => {
        const p1 = transformedVertices[edge[0]];
        const p2 = transformedVertices[edge[1]];
        
        // Main edge
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1 + pulse * 0.5;
        ctx.stroke();
        
        // Glow effect
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = colors[(i + 1) % colors.length] + '33';
        ctx.lineWidth = 3 + pulse;
        ctx.stroke();
      });
      
      // Draw vertex points
      if (sphereSegments <= 20) {  // Only draw vertices if not too many
        transformedVertices.forEach((point, i) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2 + pulse, 0, Math.PI * 2);
          ctx.fillStyle = colors[i % colors.length];
          ctx.fill();
          
          // Vertex glow
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4 + pulse * 2, 0, Math.PI * 2);
          const vertexGlow = ctx.createRadialGradient(
            point.x, point.y, 1,
            point.x, point.y, 4 + pulse * 2
          );
          vertexGlow.addColorStop(0, colors[i % colors.length] + 'cc');
          vertexGlow.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = vertexGlow;
          ctx.fill();
        });
      }
      
      // Draw circuit pattern around the sphere
      const circuitLines = 7;
      const baseAngle = time / 3;
      
      for (let i = 0; i < circuitLines; i++) {
        const angle = baseAngle + (Math.PI * 2 / circuitLines) * i;
        const heightOffset = Math.sin(time + i) * 0.3;
        
        // Draw circuit paths
        const startX = shape.x + Math.cos(angle) * (shape.scale * 0.8);
        const startY = shape.y + Math.sin(angle) * (shape.scale * 0.8) + heightOffset * shape.scale;
        const endX = shape.x + Math.cos(angle) * (shape.scale * 1.5 + pulse * 15);
        const endY = shape.y + Math.sin(angle) * (shape.scale * 1.5 + pulse * 15) + heightOffset * shape.scale;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 8]);
        ctx.lineDashOffset = time * 10;
        ctx.stroke();
        
        // Circuit node
        ctx.beginPath();
        ctx.arc(endX, endY, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      }
      
      ctx.setLineDash([]);
      
      // Draw cyberpunk orbital rings
      const ringCount = 3;
      for (let i = 0; i < ringCount; i++) {
        ctx.beginPath();
        
        // Create rotating ellipses that tilt in 3D space
        const tilt = 0.3 + 0.2 * i;
        const ringRadius = shape.scale * (1.2 + i * 0.2);
        const rotOffset = (i % 2 === 0 ? 1 : -1) * time / 3;
        
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(rotOffset);
        ctx.scale(1, tilt);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.restore();
        
        ctx.strokeStyle = colors[i % colors.length];
        ctx.lineWidth = 1.5 + pulse;
        ctx.setLineDash([5, 8]);
        ctx.lineDashOffset = time * 20 * (i % 2 === 0 ? 1 : -1);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      
      // Draw outer glow
      const outerGradient = ctx.createRadialGradient(
        shape.x, shape.y, shape.scale * 0.8,
        shape.x, shape.y, shape.scale * 2
      );
      
      outerGradient.addColorStop(0, 'rgba(0,255,255,0.1)');
      outerGradient.addColorStop(0.5, 'rgba(255,0,204,0.05)');
      outerGradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.scale * 2, 0, Math.PI * 2);
      ctx.fillStyle = outerGradient;
      ctx.fill();
      
      // Draw data flow animations along select edges
      for (let i = 0; i < Math.min(10, edges.length); i++) {
        const edgeIndex = Math.floor(time * 2 + i) % edges.length;
        const edge = edges[edgeIndex];
        
        const p1 = transformedVertices[edge[0]];
        const p2 = transformedVertices[edge[1]];
        
        // Only show data flow on visible edges
        if (p1.z > 0 || p2.z > 0) {
          // Data flow position calculation
          const flowSpeed = 0.5; // Speed of flow
          const flowPosition = (time * flowSpeed + i * 0.1) % 1;
          
          // Calculate point along the edge
          const flowX = p1.x + (p2.x - p1.x) * flowPosition;
          const flowY = p1.y + (p2.y - p1.y) * flowPosition;
          
          // Draw data packet
          ctx.beginPath();
          ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          
          // Draw data packet trail
          ctx.beginPath();
          ctx.moveTo(flowX, flowY);
          const trailLength = 0.2; // Length of trail
          const trailStart = Math.max(0, flowPosition - trailLength);
          const trailX = p1.x + (p2.x - p1.x) * trailStart;
          const trailY = p1.y + (p2.y - p1.y) * trailStart;
          ctx.lineTo(trailX, trailY);
          
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
    
    // Handle mouse movement
    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      // Update custom cursor position
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      
      // If dragging, update shape position directly
      if (isDragging) {
        shape.x = e.clientX - dragOffsetX;
        shape.y = e.clientY - dragOffsetY;
        
        // Stop automatic movement while dragging
        shape.velocityX = 0;
        shape.velocityY = 0;
      } else {
        // Normal cursor behavior when not dragging
        // Increase cursor size based on proximity to shape
        const dx = e.clientX - shape.x;
        const dy = e.clientY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < shape.scale * 2) {
          const scale = 1 + (1 - distance / (shape.scale * 2)) * 1.5;
          cursor.style.transform = `translate(-50%, -50%) scale(${scale})`;
          
          // Change cursor style when hoverable
          if (distance < shape.scale) {
            document.body.style.cursor = 'grab';
            cursor.style.opacity = '0.7';
          } else {
            document.body.style.cursor = 'none';
            cursor.style.opacity = '1';
          }
        } else {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          document.body.style.cursor = 'none';
          cursor.style.opacity = '1';
        }
      }
    });
    
    // Handle mousedown for drag start
    document.addEventListener('mousedown', (e) => {
      const dx = e.clientX - shape.x;
      const dy = e.clientY - shape.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only start dragging if click is within the shape
      if (distance < shape.scale) {
        isDragging = true;
        dragOffsetX = dx;
        dragOffsetY = dy;
        document.body.style.cursor = 'grabbing';
        
        // Trigger vibration feedback
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      } else {
        // Change color scheme on regular clicks outside the shape
        shape.currentColorScheme = (shape.currentColorScheme + 1) % shape.colorSchemes.length;
        
        // Trigger vibration if supported by the device
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 200]);
        }
      }
    });
    
    // Handle mouseup to end dragging
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.cursor = 'none';
        
        // Give shape a small random velocity when released
        shape.velocityX = (Math.random() - 0.5) * 4;
        shape.velocityY = (Math.random() - 0.5) * 4;
        
        // Small vibration on release
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset shape position
      shape.x = canvas.width / 2;
      shape.y = canvas.height / 2;
    });
    
    // Add touch support for mobile devices
    document.addEventListener('touchmove', (e) => {
      e.preventDefault(); // Prevent scrolling
      
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouse.x = touch.clientX;
        mouse.y = touch.clientY;
        
        // Update custom cursor position
        cursor.style.left = `${touch.clientX}px`;
        cursor.style.top = `${touch.clientY}px`;
        
        // If dragging, update shape position directly
        if (isDragging) {
          shape.x = touch.clientX - dragOffsetX;
          shape.y = touch.clientY - dragOffsetY;
          
          // Stop automatic movement while dragging
          shape.velocityX = 0;
          shape.velocityY = 0;
        }
      }
    }, { passive: false });
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        
        const dx = touch.clientX - shape.x;
        const dy = touch.clientY - shape.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only start dragging if touch is within the shape
        if (distance < shape.scale) {
          isDragging = true;
          dragOffsetX = dx;
          dragOffsetY = dy;
          
          // Trigger vibration feedback
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        } else {
          // Change color scheme on regular touches outside the shape
          shape.currentColorScheme = (shape.currentColorScheme + 1) % shape.colorSchemes.length;
          
          // Trigger vibration if supported by the device
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 200]);
          }
        }
      }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
      if (isDragging) {
        isDragging = false;
        
        // Give shape a small random velocity when released
        shape.velocityX = (Math.random() - 0.5) * 4;
        shape.velocityY = (Math.random() - 0.5) * 4;
        
        // Small vibration on release
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
    });
    
    // Animation loop
    function animate() {
      drawIcosphere();
      requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
  </script>
</body>
</html>
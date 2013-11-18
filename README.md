Description
=======================

Control an AR Drone 2.0 using a Leap Motion / keyboard and display video & control visualization in browser.

How to Fly
=======================

1. Hold hand above Leap Motion controller
2. To takeoff, gesture with your pointer finger as though left clicking a mouse
3. Keeping fingers together as though saluting, move hand right to move right, up to go up and forward to move forward
4. To rotate, make a circle with pointer finger in a clockwise or counterclockwise motion
5. To land, gesture with pointer finger as though left clicking a mouse


Stack
=======================

Node.js for server
Express for web app deployment
Faye for publishing and subscribing between leap, server and drone
Leap.js for converting leap motions into javascript
jQuery for browser displays and accessing keypresses for optional keyboard controls

Thanks
=======================

Thanks to @felixge for AR-Drone (converts AR Drone's SDK into Javascript) and @bkw for Dronestream (converts drone's video feed into usable h264 and renders WebGL canvas).

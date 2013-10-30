(function() {
var keymap, faye, speed;

  faye = new Faye.Client("/faye", {
    timeout: 120, // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
    retry: 2 // may need to adjust. How often the client will try to reconnect if connection to server is lost
  });

  faye.subscribe("/drone/image", function(src) {
    return $("#camera").attr({
      src: src
    });
  });

  keymap = {
    87: { // w
      action: 'front'
    },
    83: { // s
      action: 'back'
    },
    65: { // a
      action: 'left'
    },
    68: { // d
      action: 'right'
    },
    38: { // up arrow
      action: 'up'
    },
    40: { // down arrow
      action: 'down'
    },
    37: {  // left arrow
      action: 'counterClockwise'
    },
    39: { // right arrow
      action: 'clockwise'
    },
    32: {  // spacebar
      action: 'takeoff'
    },
    13: { // enter
      action: 'land'
    }
  };

  $(document).keydown(function(d) {
    var action;
    if (!keymap[d.keyCode]) { // if key pressed is not assigned in the keymap above, return out of the function.
      return;
    }
    d.preventDefault(); // prevents a key's default action from occuring
    action = keymap[d.keyCode].action; // pulls the action parameter from the key pressed
    speed = 0.5; // should be more dynamic, but will move at half speed for now
    if (d.keyCode === 32 || d.keyCode === 13) {
      return faye.publish("/drone/drone", { // sends a message to /drone/ with details of the action and speed
        action: action
      });
    } else {
      return faye.publish("/drone/move", { // sends a message to /drone/ with details of the action and speed
        action: action,
        speed: speed
      });
    } 
  });

  $(document).keyup(function() {  // stops the drone when no key is pressed
    speed = 0;
    return faye.publish("/drone/drone", {
      action: 'stop',
      speed: speed
    });
  });

}).call(this);


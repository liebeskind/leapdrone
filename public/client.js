(function() {
var keymap, faye;

  faye = new Faye.Client("/faye", {
    timeout: 120, // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
    retry: 2 // may need to adjust. How often the client will try to reconnect if connection to server is lost
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

})


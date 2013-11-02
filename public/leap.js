(function() {

  var controller, active, flying, ref, speed, leap, faye, timeout, speedAdjuster;

  faye = new Faye.Client("/faye", {
    timeout: 60 // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
    // retry: 2 // may need to adjust. How often the client will try to reconnect if connection to server is lost
  });

  active = true;
  flying = true;
  ref = {};
  ref.fly = false;
  speed = 0.4;
  timeout = 400;
  speedAdjuster = 2.5;

   var main = function(frame) {
    if (!active) return;   
    gestureHandler(frame);
    handPos(frame);
   }

  var takeoff = function() {
  	ref.fly = true;
  	active = true;
  	return faye.publish("/drone/drone", {
      action: 'takeoff'
    });
   }

   var land = function() {
  	ref.fly = false;	
  	return faye.publish("/drone/drone", {
      action: 'land'
    });
   }

   var counterClockwise = function() {
    return faye.publish("/drone/move", {
      action: 'counterClockwise',
      speed: speed
    })
   };

   var clockwise = function() {
    return faye.publish("/drone/move", {
      action: 'clockwise',
      speed: speed
    })
   }

   var stop = function() {
   	active = false;
   }

   var start = function() {
    active = true;
   }

   var handPos = function(frame) {
     var hands = frame.hands
     if (hands.length > 0) {
       var handOne = hands[0];

       var pos = handOne.palmPosition;
       
       var xPos = pos[0];
       var yPos = pos[1];
       var zPos = pos[2];

       var adjX = xPos / 250; // -1.5 to 1.5
       var adjXspeed = Math.abs(adjX)/ speedAdjuster;
       var adjY = (yPos - 60) / 500; // 0 to .8
       var adjZ = zPos / 250; // -2 to 2
       var adjZspeed = Math.abs(adjZ) / speedAdjuster;

       if (adjX < 0 && ref.fly) {
          setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'left',
      	   speed: adjXspeed // can refactor to control based on extent of finger movement 
   			 })}, timeout);
       } else if (adjX > 0 && ref.fly) {
          setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'right',
      	   speed: adjXspeed // can refactor to control based on extent of finger movement
   			 })}, timeout);
       }

       if (adjY > 0.4 && ref.fly) {
         setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'up',
      	   speed: speed // can refactor to control based on extent of finger movement
         })}, timeout/2);
       } else if (adjY < 0.5 && ref.fly) {
        setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'down',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 })}, timeout/2);
       }

       if (adjZ < 0 && ref.fly) {
        setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'front',
      	   speed: adjZspeed // can refactor to control based on extent of finger movement
   			 })}, timeout/3);
       } else if (adjZ > 0 && ref.fly) {
        setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'back',
      	   speed: adjZspeed // can refactor to control based on extent of finger movement
   			 })}, timeout/3);
       }
     
     } else {
      setTimeout(function(){
      return faye.publish("/drone/drone", {
        action: 'stop'
      })}, timeout/4);
     }
   }

   var gestureHandler = function(frame) {
     var gestures = frame.gestures;
     if (gestures && gestures.length > 0) {
        for( var i = 0; i < gestures.length; i++ ) {
           var gesture = gestures[i];
           if (gesture.type === 'circle') {
              if (gesture.state === 'update') {
                 console.log('a circle');
                 gesture.pointable = frame.pointable(gesture.pointableIds[0]);
                 direction = gesture.pointable.direction;
                 if(direction) {
                    var normal = gesture.normal;
                    clockwisely = Leap.vec3.dot(direction, normal) > 0;
                    if(clockwisely && ref.fly) {
                      return clockwise();
                    } else {
                      return counterClockwise();
                    }
                  }
              }
           } else if ( gesture.type === 'keyTap' ) {
              if (ref.fly) {
                land();
              } else {
                takeoff();
              }
           }
        }
     }
   };

  controller = new Leap.Controller({enableGestures: true});
  controller.connect();
  controller.on('frame', function(data) {
    main(data)
  });

 }).call(this);
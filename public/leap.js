(function() {

  console.log("leap active");

  var controller, circleCount, active, flying, ref, speed, leap, faye;

  faye = new Faye.Client("/faye", {
    timeout: 60 // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
    // retry: 2 // may need to adjust. How often the client will try to reconnect if connection to server is lost
  });


  active = true;
  flying = true;
  ref = {};
  speed = 0.5;

   var main = function(frame) {
    console.log("main running");
    if (!active) return;
    console.log('active');
    handPos(frame);
    gestureHandler(frame);
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

   var stop = function() {
   	active = false;
   }

   var start = function() {
    active = true;
   }

   var handPos = function(frame) {
     var hands = frame.hands
     console.log("hand pos")
     if (hands.length > 0) {
       var handOne = hands[0];
       console.log("I see your hand");
       var pos = handOne.palmPosition;
       var xPos = pos[0];
       var yPos = pos[1];
       var zPos = pos[2];

       var adjX = xPos / 250;
       var adjY = (yPos - 60) / 500;
       var adjZ = zPos / 200;

       if (adjX < 0 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'left',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       } else if (adjX > 0 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'right',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       }

       if (adjY > 0.5 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'up',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       } else if (adjY < 0.5 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'down',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       }

       if (adjZ < 0 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'front',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       } else if (adjZ > 0 && ref.fly) {
         return faye.publish("/drone/move", {
      	   action: 'back',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 });
       }
     
     } else {
      return faye.publish("/drone/drone", {
        action: 'stop',
        speed: speed
      });
     }
   }

   var gestureHandler = function(frame) {
     var gestures = frame.gestures;

     if (gestures && gestures.length > 0) {
        for( var i = 0; i < gestures.length; i++ ) {
           var gesture = gestures[i];
           if ( gesture.type === 'keyTap' ) {
              if (ref.fly) {
                takeoff();
              } else {
                land();
              }
           }
        }
     }
   }

  controller = new Leap.Controller({enableGestures: true});
  controller.connect();
  controller.on('frame', main());

 }).call(this);
(function() {

  var controller, circleCount, active, flying, ref, speed, leap, faye, timeout;

  faye = new Faye.Client("/faye", {
    timeout: 60 // may need to adjust. If server doesn't send back any data for the given period of time, the client will assume the server has gone away and will attempt to reconnect. Timeout is given in seconds and should be larger than timeout on server side to give the server ample time to respond.
    // retry: 2 // may need to adjust. How often the client will try to reconnect if connection to server is lost
  });

  active = true;
  flying = true;
  ref = {};
  ref.fly = true;
  speed = 0.1;
  timeout = 400;

   var main = function(frame) {
    if (!active) return;
    handPos(frame);
    // gestureHandler(frame);
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
          setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'left',
      	   speed: speed // can refactor to control based on extent of finger movement 
   			 })}, timeout);
       } else if (adjX > 0 && ref.fly) {
          setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'right',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 })}, timeout);
       }

       if (adjY > 0.5 && ref.fly) {
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
      	   speed: speed // can refactor to control based on extent of finger movement
   			 })}, timeout/3);
       } else if (adjZ > 0 && ref.fly) {
        setTimeout(function(){
         return faye.publish("/drone/move", {
      	   action: 'back',
      	   speed: speed // can refactor to control based on extent of finger movement
   			 })}, timeout/3);
       }
     
     } else {
      setTimeout(function(){
      return faye.publish("/drone/drone", {
        action: 'stop',
        speed: speed
      })}, timeout/4);
     }
   }

   // var gestureHandler = function(frame) {
   //   var gestures = frame.gestures;

   //   if (gestures && gestures.length > 0) {
   //      for( var i = 0; i < gestures.length; i++ ) {
   //         var gesture = gestures[i];
   //         if ( gesture.type === 'keyTap' ) {
   //            if (ref.fly) {
   //              takeoff();
   //            } else {
   //              land();
   //            }
   //         }
   //      }
   //   }
   // }

  controller = new Leap.Controller({enableGestures: true});
  controller.connect();
  controller.on('frame', function(data) {
    main(data)
  });

 }).call(this);
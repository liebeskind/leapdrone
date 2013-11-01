(function() {

	var controller, circleCount, active, flying, ref, speed;

  controller = new leap.Controller({enableGestures: true});
  controller.connect();
	controller.on('frame', this.loop.bind(this));
	active = false;
	flying = false;
	ref = {};
	speed = 0.5;

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

   var main = function() {
   	if (!active) return;
   	handPos(frame);
    gestureHandler(frame);
   }

   var handPos = function(frame) {
     var hands = frame.hands
     if (hands.length > 0) {
       var handOne = hands[0];
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

 }).call(this);
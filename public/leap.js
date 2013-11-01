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

   var main = function() {
   	if (!active) return;
   	handPos(frames);
   }

   var handPos = function(frames) {
     var hands = frames.hands
     if (hands) {
       var handOne = hands[0];
       var pos = handOne.palmPosition;
       var xPos = pos[0];
       var yPos = pos[1];
       var zPos = pos[2];

       var adjX = xPos / 250;
       var adjY = (yPos - 60) / 500;
       var adjZ = zPos / 200;



     }
   }
 }).call(this);
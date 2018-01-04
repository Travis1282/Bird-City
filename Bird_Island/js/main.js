
////////////// Main //////////////
/* Setup scene             */
/* Add objects             */
/* Kickoff tick() function */

var container, scene, camera, renderer, allBugs=[], allBuildings=[], buildingBounds=[], birdBounds=[];

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var { scene, camera } = setupScene();
var movingCube;
var buildings = addBuildings();
var bugs = addBugs();
var cube = addCube();
var ground = addGround();
var score = 0;

var { birds, boids} = addBirds();

tick(); 
// addGround();

////////////// Render Cycle //////////////
/* This function gets called on every render frame */

function tick() { 
    updateBirds();
    steer();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    bugsCollision();
    // buildingsCollision();
    countdown();
} 

function countdown(){

return Math.round(clock.elapsedTime);

}

////////////// Helper Functions //////////////

function setupScene() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x99b4c3);
    camera = setupCamera(scene.position);
    scene.add(camera);
    scene.fog = new THREE.FogExp2(0x868293, 0.0007);
    addRenderer();

    return { scene:scene, camera:camera };
}

function setupCamera(position) {
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(-200,0,0);// initial camera positon?
    camera.lookAt(position);  

    return camera;
}

function addRenderer() {
    renderer = new THREE.WebGLRenderer();   
    renderer.setSize(window.innerWidth, window.innerHeight);    

    containerDiv = document.getElementById('GameContainer');   
    containerDiv.appendChild(renderer.domElement);
}

////////////// DRIVING CUBE //////////////

function addCube() {
    var movingCubeMat = new THREE.MeshBasicMaterial( { color: 0x0000ff, transparent: true, opacity: 0} );
    var side = 10;
    var movingCubeGeom = new THREE.BoxGeometry(side,side,side,side,side,side);
    movingCube = new THREE.Mesh( movingCubeGeom, movingCubeMat);
    movingCube.position.set(200, 200 ,0);

    scene.add(movingCube);
    return movingCube;
}

//////////////  ADD GROUND //////////////

function addGround(){

  const ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 16, 16),
    new THREE.MeshLambertMaterial({color: 0x404040})
  );
  ground.position.y = 0;
  ground.rotation.x = -0.5 * Math.PI;
  scene.add(ground);
  return ground;
}



//////////////  ADD LIGHT //////////////

const light = function(){

  skyLight = new THREE.DirectionalLight(0x7ec0ee, 1.5);
  skyLight.position.set(2950, 2625, -160); // Sun on the sky texture
  scene.add(skyLight);
  var light = new THREE.DirectionalLight(0xc3eaff, 0.75);
  light.position.set(-1, -0.5, -1);
  scene.add(light);
}
light();

////////////// ADD BIRDS //////////////

function addBirds() {
	birds = [];
	boids = [];

	for ( var i = 0; i < 50; i ++ ) {

		boid = boids[ i ] = new Boid();
		boid.position.x = Math.random() * 400 - 200;
		boid.position.y = Math.random() * 400 - 200;
		boid.position.z = Math.random() * 200 - 500;
		boid.velocity.x = Math.random() * 2 - 1;
		boid.velocity.y = Math.random() * 2 - 1;
		boid.velocity.z = Math.random() * 2 - 1;
		boid.setAvoidWalls( false );
		boid.setWorldSize( 0,0,0 );

		bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.DoubleSide } ) );
		bird.phase = Math.floor( Math.random() * 62.83 );
		scene.add( bird );
    }
    
    return { birds:birds, boids:boids };
}

function updateBirds() {
    // set cube position var
    var pos = cube.position;
    var vector = new THREE.Vector3( pos.x, pos.y, pos.z);
	for ( var i = 0; i < birds.length; i++ ) {
        boid = boids[i];
        boid.run( boids );

		bird = birds[i];
        bird.position.copy( boids[i].position );

        var color = bird.material.color;
		color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

		bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
		bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

		bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
		bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

        // set goal 
        boid.setGoal( cube.position )


        }

}



// addBugs();
// addBuildings();

////////////// COLLISION DETECTION //////////////


function bugsCollision() { 

    // loop through each bug
    for(var j=0; j<birds.length; j++) { 
        // loop through each bird
        for(var i=0; i<allBugs.length; i++){
                if (birds[j].position.distanceTo(allBugs[i].position)<10){
                // debugger;
                    // remove eaten bugs
                    scene.remove(allBugs[i]);
                    allBugs.splice([i],1)
                    //add to score 
                    score++;
                    console.log(score);
                    return;
            }
        }

        for(var i=0; i<buildingBounds.length; i++){


            // console.log(birds[j].position)
            // console.log(allBuildings[i].minx)
            // debugger;
            
            if ((birds[j].position.x >= buildingBounds[i].min.x && birds[j].position.x <= buildingBounds[i].max.x) &&
                (birds[j].position.y >= buildingBounds[i].min.y && birds[j].position.y <= buildingBounds[i].max.y) &&
                (birds[j].position.z >= buildingBounds[i].min.z && birds[j].position.z <= buildingBounds[i].max.z)){


                    scene.remove(birds[j]);
                    console.log('boom')
                    // debugger;
            }
        }
    }
}


////////////// POPULATES THE BUILDING BOUNDING ARRAY FOR COLLISION DETECTION //////////////

function buildingsBounding() { 

    // loop through each bug
    for(var i=0; i<allBuildings.length; i++){
        // loop through each bird
            // var BBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    //     BBox.setFromObject(buildings);
        var  buildingBound = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
        buildingBound.setFromObject(allBuildings[i]);
        buildingBounds.push(buildingBound)

    }

}

buildingsBounding();

//////////////  ADD BUGS //////////////

function addBugs(){
    for ( var i=0; i < 400; i++ ) {
      // Make a sphere 
      var geometry   = new THREE.SphereGeometry(0.5, 32, 32)
      var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
      var bugs = new THREE.Mesh(geometry, material)
      bugs.position.z = (Math.random() * 10000) -11000;
      bugs.position.x = (Math.random() * 10000) -5000;
      bugs.position.y = Math.random() * 800; -50;

      // Then set the z position to where it is in the loop (distance of camera)
      // bugs.position.z = z-10000;

        bugs.scale.x = 2;
        bugs.scale.y = 2;


      //add the sphere to the scene
      scene.add( bugs );

      //finally push it to the bugs array 
      allBugs.push(bugs); 
    }
}

////////////// ADD BUILDINGS //////////////

function addBuildings(){
    for ( var i=0; i < 300; i++ ) {
      // Make a box 
      var geometry   = new THREE.BoxGeometry(50, 50, 50)
      var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
      var buildings = new THREE.Mesh(geometry, material)
      buildings.position.z = (Math.random() * 10000) -11000;
      buildings.position.x = (Math.random() * 10000) -5000;
      buildings.position.y = -100;


        buildings.scale.z = (Math.random() * 4) + 1; 
        buildings.scale.x = (Math.random() * 4) + 1;
        buildings.scale.y = (Math.random() * 25) +10;

      //add the cube to the scene
      scene.add( buildings );
      // put into scene
      allBuildings.push(buildings); 
    }
}

////////////// TRACK KEYSTROKES / DRIVE CUBE //////////////

function steer(){

    var delta = clock.getDelta(); // seconds.
    var moveDistance = 200 * delta; // 200 pixels per second
    var rotateAngle = Math.PI / 3 * delta;   // pi/2 radians (90 degrees) per second
    movingCube.translateZ( -moveDistance );


    // move forwards/backwards/left/right
    if ( keyboard.pressed("W") )
        movingCube.translateY( moveDistance );
        // movingCube.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
    if ( keyboard.pressed("S") && movingCube.position.y > 140 )
        movingCube.translateY( -moveDistance );

        // movingCube.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
    if ( keyboard.pressed("Q") )
        movingCube.translateX( -moveDistance );
    if ( keyboard.pressed("E") )
        movingCube.translateX(  moveDistance ); 

    // rotate left/right/up/down
    var rotation_matrix = new THREE.Matrix4().identity();
    if ( keyboard.pressed("A") )
        movingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
            // movingCube.translateX( -moveDistance );

    if ( keyboard.pressed("D") )
        movingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
    if ( keyboard.pressed("R") )
        movingCube.translateZ( -moveDistance );
    if ( keyboard.pressed("F") )
    
    if ( keyboard.pressed("Z") )
    {   
        console.log('z')
        // movingCube.position.x = Math.random() * 10 - 20;
    //     movingCube.position.y = Math.random() * 10 - 20;
    //     movingCube.position.z = Math.random() * 10 - 20;
        // movingCube.position.set(0,25.1,0);
        // movingCube.rotation.set(0,0,0);

    }
    
    var relativeCameraOffset = new THREE.Vector3(0,50,300);

    var cameraOffset = relativeCameraOffset.applyMatrix4( movingCube.matrixWorld );

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt( movingCube.position );
    
    // camera.updateMatrix();
    // camera.updateProjectionMatrix();
}







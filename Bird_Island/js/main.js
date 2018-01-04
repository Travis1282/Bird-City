
////////////// Main //////////////
/* Setup scene             */
/* Add objects             */
/* Kickoff tick() function */

var container, scene, camera, renderer, allBugs=[];

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var { scene, camera } = setupScene();
var movingCube;
// trackKeystrokes();
var bugs = addBugs();
var cube = addCube();
// var tree = addTree();

var score = 0;

var { birds, boids} = addBirds();

tick(); 
// addGround();

////////////// Render Cycle //////////////
/* This function gets called on every render frame */

function tick() { 
    updateBirds();
    update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
    moveBugs();
    countdown();
} 

function countdown(){

return Math.round(clock.elapsedTime);

}

////////////// Helper Functions //////////////

function setupScene() {

    scene = new THREE.Scene();
    // scene.background = new THREE.Color( 0xffffff );
    camera = setupCamera(scene.position);
    scene.add(camera);

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

////////////// ADD TREES //////////////


var tree = new THREE.Tree({
    generations : 3,        // # for branch' hierarchy
    length      : 7.0,      // length of root branch
    uvLength    : 16.0,     // uv.v ratio against geometry length (recommended is generations * length)
    radius      : 0.5,      // radius of root branch
    radiusSegments : 8,     // # of radius segments for each branch geometry
    heightSegments : 8      // # of height segments for each branch geometry
});


function addTree(){
  var geometry = THREE.TreeGeometry.build(tree);
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    tree = new THREE.Mesh( geometry, material );
    scene.add(tree);    //add tree to the scene
    return tree
  }
  //addTree();

////////////// ADD TERRAIN  //////////////

var xS = 63, yS = 63;
terrainScene = THREE.Terrain({
    easing: THREE.Terrain.Linear,
    frequency: 2.5,
    heightmap: THREE.Terrain.Particles,
    material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
    maxHeight: 150,
    minHeight: -100,
    steps: 1,
    useBufferGeometry: false,
    xSegments: xS,
    xSize: (1024*20),
    ySegments: yS,
    ySize: (1024*20),
    scattering: THREE.Terrain.Linear.PerlinAltitude,
    //turbulent: true

});
// Assuming you already have your global scene, add the terrain to it
scene.add(terrainScene);

// Optional:
// Get the geometry of the terrain across which you want to scatter meshes
var geo = terrainScene.children[0].geometry;
// Add randomly distributed foliage
decoScene = THREE.Terrain.ScatterMeshes(geo, {
    //mesh: THREE.TreeGeometry.build(tree),

    mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
    w: xS,
    h: yS,
    spread: 0.5,
    randomness: Math.random,
});
terrainScene.add(decoScene);
//terrainScene.add(tree)

//////////////  ADD WATER //////////////

// const addWater = function(){

//   const water = new THREE.Mesh(
//     new THREE.PlaneBufferGeometry(16384+1024, 16384+1024, 16, 16),
//     new THREE.MeshLambertMaterial({color: 0x006ba0})
//   );
//   water.position.y = 0;
//   water.rotation.x = -0.5 * Math.PI;
//   scene.add(water);
// }
// addWater();

//////////////  ADD LIGHT //////////////

const light = function(){

  skyLight = new THREE.DirectionalLight(0xe8bdb0, 1.5);
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

// console.log(Math.round(1.005*100)/100) // 1 instead of 1.01


// collisionDetector = function(){
//     for(var i = 0; i <= allBugs.length; i++ )

//         var bug = allBugs[i]; 
        
//         if ( boid.position.distanceTo( bug[i] ) < 100 ) {

//             console.log("collision");
//         }
//     }
// }


//////////////  ADD BUGS //////////////


addBugs();


  function moveBugs() { 
        
    // loop through each bug
    for(var i=0; i<allBugs.length; i++) { 

        for(var j=0; j<birds.length; j++){
            if (allBugs[i].position.distanceTo(birds[j].position)<10){
                // debugger;
                    scene.remove(allBugs[i]);
                            console.log("collision");
                    score++

            }
        }

      }

  }


    function addBugs(){
        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
        for ( var z= 0; z < 10000; z+=100 ) {
    
          // Make a sphere 
          var geometry   = new THREE.SphereGeometry(0.5, 32, 32)
          var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
          var bugs = new THREE.Mesh(geometry, material)
    
          bugs.position.x = Math.random() * 1000 - 500;
          bugs.position.y = Math.random() * 1000 - 500;
    
          // Then set the z position to where it is in the loop (distance of camera)
          bugs.position.z = z;
    
          //add the sphere to the scene
          scene.add( bugs );
    
          //finally push it to the bugs array 
          allBugs.push(bugs); 
        }
  }

////////////// TRACK KEYSTROKES / DRIVE CUBE //////////////

function update()
{
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








var clock = new THREE.Clock();
let up = false;
let down = false;
let right = false;
let left = false;

var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight,
SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;


var tree = new THREE.Tree({
    generations : 3,        // # for branch' hierarchy
    length      : 7.0,      // length of root branch
    uvLength    : 16.0,     // uv.v ratio against geometry length (recommended is generations * length)
    radius      : 0.5,      // radius of root branch
    radiusSegments : 8,     // # of radius segments for each branch geometry
    heightSegments : 8      // # of height segments for each branch geometry
});

//var camera, scene, renderer, birds, bird;
var container, scene, camera, renderer, controls, birds, bird;

var boid, boids;

init();
animate();
addCube();
addTree();

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );  //camera
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  //camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,5,10);// initial camera positon?
  camera.lookAt(scene.position);   

///////////////////////// FOG SET IN CANVAS RENDERER//////////////////////////////////////////

	//scene.background = new THREE.Color( 0xffffff );

	birds = [];
	boids = [];

	for ( var i = 0; i < 200; i ++ ) {

		boid = boids[ i ] = new Boid();
		boid.position.x = Math.random() * 400 - 200;
		boid.position.y = Math.random() * 400 - 200;
		boid.position.z = Math.random() * 400 - 200;
		boid.velocity.x = Math.random() * 2 - 1;
		boid.velocity.y = Math.random() * 2 - 1;
		boid.velocity.z = Math.random() * 2 - 1;
		boid.setAvoidWalls( true );
		boid.setWorldSize( 200, 200, 1000 );

		bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
		bird.phase = Math.floor( Math.random() * 62.83 );
		scene.add( bird );


	}

	renderer = new THREE.CanvasRenderer();  //renderer
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	container = document.getElementById( 'GameContainer' );   // put into div
  	container.appendChild( renderer.domElement );


}
/////////////////////Window Resizer /////////////////////////

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

/////////////////////Repel Birds /////////////////////////

// function onDocumentMouseMove( event ){
// 	var vector = new THREE.Vector3( event.clientX - SCREEN_WIDTH_HALF, - event.clientY + SCREEN_HEIGHT_HALF, 0 );
// 	for ( var i = 0, il = boids.length; i < il; i++ ) {
// 		boid = boids[ i ];
// 		vector.z = boid.position.z;
// 		boid.repulse( vector );
// 	}

// }


function addTree(){
  var geometry = THREE.TreeGeometry.build(tree);
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    //combine geometry with material to create the cube
    tree = new THREE.Mesh( geometry, material );
    scene.add( tree );    //add tree to the scene
}
/////////////////////Add Steering cube/////////////////////////


function addCube(){
	var MovingCubeMat = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
	let MovingCubeGeom = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
	MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
	MovingCube.position.set(0, 1, 10);
	scene.add( MovingCube );  
	console.log('cube')
}


/////////////////////Animate and Render/////////////////////////

function animate() {
	requestAnimationFrame( animate );
	//steering 
	camSteer();
	render();
}


function render() {

	for ( var i = 0, il = birds.length; i < il; i++ ) {

		boid = boids[ i ];
		boid.run( boids );

		bird = birds[ i ];
		bird.position.copy( boids[ i ].position );

		var color = bird.material.color;
		color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

		bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
		bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

		bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
		bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

	}
	renderer.render( scene, camera );
}



/////////////////////Steer the camera and birds/////////////////////////

var MovingCube;

function camSteer(){
  var delta = clock.getDelta(); // seconds.
  var moveDistance = 100 * delta; // 200 pixels per second
  var rotateAngle = Math.PI / 5 * delta;   // pi/2 radians (90 degrees) per second
  

//   // local transformations
//   //MovingCube.translateZ( -moveDistance );
//   controler()
//   // move forwards/backwards/left/right
  if (up==true){
//     // MovingCube.rotateOnAxis( new THREE.Vector4(1,0,0), rotateAngle);
//     //MovingCube.translateY(  moveDistance );
    console.log('up')
  }
    if (down==true){
//     // MovingCube.rotateOnAxis( new THREE.Vector4(1,0,0), -rotateAngle);
//     //MovingCube.translateY(  -moveDistance );
    console.log('down')
  }
    if (right==true){
//     // MovingCube.rotateOnAxis( new THREE.Vector4(0,1,0), -rotateAngle);
    console.log('right')
  }
    if (left==true){
//     // MovingCube.rotateOnAxis( new THREE.Vector4(0,1,0), rotateAngle);
    console.log('left')
  }
    
//   // POTENTALLY CAN  MAKE THIS RESET THE POSITION 
//   //   MovingCube.position.set(0,25.1,0);
//   //   MovingCube.rotation.set(0,0,0);
  
//   var relativeCameraOffset = new THREE.Vector3(0,5,20);

//   var cameraOffset = relativeCameraOffset.applyMatrix4( MovingCube.matrixWorld );
//   camera.position.x = cameraOffset.x;
//   camera.position.y = cameraOffset.y;
//   camera.position.z = cameraOffset.z;
//   camera.lookAt( MovingCube.position );
//   camera.updateMatrix();
//   camera.updateProjectionMatrix();
}


/////////////////////handle keypress/////////////////////////

var Key = {
  // translates the keys into english
  _pressed: {},LEFT: 37,UP: 38,RIGHT: 39,DOWN: 40,
  //return if pressed, on or off
  isDown: function(keyCode) { return this._pressed[keyCode];},
  onKeydown: function(event) {this._pressed[event.keyCode] = true;},
  onKeyup: function(event) {delete this._pressed[event.keyCode];}
};

// what to do if arrow key pressed
let controler = function() {
  if (Key.isDown(Key.UP)) console.log('up');
  else up=false 
  if (Key.isDown(Key.LEFT))    console.log('down')
  else left=false 
  if (Key.isDown(Key.DOWN)) console.log('right')
  else down=false 
  if (Key.isDown(Key.RIGHT))  console.log('left')
  else right=false 
};

// Key listener
document.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
document.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);




//var camera, scene, renderer, cube, tree; //Declare three.js variables
var container, scene, camera, renderer, controls, stats;
var clock = new THREE.Clock();

let up = false;
let down = false;
let right = false;
let left = false;

var tree = new THREE.Tree({
    generations : 3,        // # for branch' hierarchy
    length      : 7.0,      // length of root branch
    uvLength    : 16.0,     // uv.v ratio against geometry length (recommended is generations * length)
    radius      : 0.5,      // radius of root branch
    radiusSegments : 8,     // # of radius segments for each branch geometry
    heightSegments : 8      // # of height segments for each branch geometry
});

function init(){    //assign three.js objects to each variable
  scene = new THREE.Scene();
  //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );  //camera
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0,5,10);// initial camera positon?
  camera.lookAt(scene.position);  


  //scene = new THREE.Scene();    //scene
  renderer = new THREE.WebGLRenderer();    //renderer
  renderer.setSize( window.innerWidth, window.innerHeight );    //set the size of the renderer
  container = document.getElementById( 'GameContainer' );   // put into div
  container.appendChild( renderer.domElement );

}

function addTree(){
  var geometry = THREE.TreeGeometry.build(tree);
  var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
    //combine geometry with material to create the cube
    tree = new THREE.Mesh( geometry, material );
    scene.add( tree );    //add tree to the scene

  }

  function addCube(){
  var MovingCubeMat = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
  var MovingCubeGeom = new THREE.BoxGeometry( 1, 1, 1, 1, 1, 1 );
  MovingCube = new THREE.Mesh( MovingCubeGeom, MovingCubeMat );
  MovingCube.position.set(0, 25.1, 0);
  scene.add( MovingCube );  
  }


  // function render() {
  //   renderer.render( scene, camera );
  // }



function animate() 
{
  requestAnimationFrame( animate );
  render();   
  update();
}


     init();
  addCube();
  addTree();
    function render() {
    renderer.render( scene, camera );
  }

 // render();

// var light = new THREE.PointLight(0xFFFFFF);
// light.position.set(-10, 15, 100);
// scene.add(light);

// Generate a terrain
var xS = 63, yS = 63;
terrainScene = THREE.Terrain({
    easing: THREE.Terrain.Linear,
    frequency: 2.5,
    heightmap: THREE.Terrain.DiamondSquare,
    material: new THREE.MeshBasicMaterial({color: 0x5566aa}),
    maxHeight: 100,
    minHeight: -100,
    steps: 1,
    useBufferGeometry: false,
    xSegments: xS,
    xSize: 1024,
    ySegments: yS,
    ySize: 1024,
});
// Assuming you already have your global scene, add the terrain to it
scene.add(terrainScene);

// Optional:
// Get the geometry of the terrain across which you want to scatter meshes
var geo = terrainScene.children[0].geometry;
// Add randomly distributed foliage
decoScene = THREE.Terrain.ScatterMeshes(geo, {
    mesh: new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 12, 6)),
    w: xS,
    h: yS,
    spread: 0.02,
    randomness: Math.random,
});
terrainScene.add(decoScene);



var MovingCube;

function update()
{
  var delta = clock.getDelta(); // seconds.
  var moveDistance = 200 * delta; // 200 pixels per second
  var rotateAngle = Math.PI / 5 * delta;   // pi/2 radians (90 degrees) per second
  
  // local transformations
  MovingCube.translateZ( -moveDistance );
  controler()
  // move forwards/backwards/left/right
  if (up==true){
    //MovingCube.rotateOnAxis( new THREE.Vector4(1,0,0), rotateAngle);
    MovingCube.translateY(  moveDistance/2 );
   // console.log('up')
  }
    if (down==true){
    //MovingCube.rotateOnAxis( new THREE.Vector4(1,0,0), -rotateAngle);
    MovingCube.translateY(  -moveDistance /2 );
    //console.log('down')
  }
    if (right==true){
    MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
    //console.log('right')
  }
    if (left==true){
    MovingCube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
    //console.log('left')
  }
    
  // POTENTALLY CAN  MAKE THIS RESET THE POSITION 
  //   MovingCube.position.set(0,25.1,0);
  //   MovingCube.rotation.set(0,0,0);

  
  var relativeCameraOffset = new THREE.Vector3(0,5,20);

  var cameraOffset = relativeCameraOffset.applyMatrix4( MovingCube.matrixWorld );
  camera.position.x = cameraOffset.x;
  camera.position.y = cameraOffset.y;
  camera.position.z = cameraOffset.z;
  camera.lookAt( MovingCube.position );
  
  camera.updateMatrix();
  camera.updateProjectionMatrix();
      
  //stats.update();
}


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
  if (Key.isDown(Key.UP)) up=true;
  else up=false 
  if (Key.isDown(Key.LEFT)) left=true;
  else left=false 
  if (Key.isDown(Key.DOWN)) down=true;
  else down=false 
  if (Key.isDown(Key.RIGHT))  right=true;
  else right=false 
};

// Key listener
scene.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
scene.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


animate()








 


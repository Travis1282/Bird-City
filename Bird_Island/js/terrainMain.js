var date = new Date();
var pn = new Perlin('rnd' + date.getTime());
  //Declare three.js variables
var camera, scene, renderer, stars=[], floor=[];
 
//assign three.js objects to each variable
function init(){
   
  //camera
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 5;   
  //scene
  scene = new THREE.Scene();
   
  //renderer
  renderer = new THREE.WebGLRenderer();
  //set the size of the renderer
  renderer.setSize( window.innerWidth, window.innerHeight );
   
  //add the renderer to the html document body
  document.body.appendChild( renderer.domElement );
}

function render() {
  //get the frame
  requestAnimationFrame( render );
  //render the scene
  renderer.render( scene, camera );
}


init();
render();
addLight();
addSphere();
addGround();


  function animateScene() { 
        
    // loop through each star
    for(var i=0; i<stars.length; i++) {
      
      star = stars[i]; 
        
      // move it forward by a 10th of its array position each time 
      star.position.z +=  i/10;
        
      // once the star is too close, reset its z position
      if(star.position.z>1000) star.position.z-=2000;   
    }
       // loop through each floor (there's just 2)
    for(var i=0; i<floor.length; i++) {
      
      ground = floor[i]; 
        
      // move it forward by a 10th of its array position each time 
      ground.position.z +=  0.5;
        
      // once the star is too close, reset its z position
      if(ground.position.z>400) ground.position.z-=1600;   
    }
  }

  animateScene();

    function addSphere(){
        // The loop will move from z position of -1000 to z position 1000, adding a random particle at each position. 
        for ( var z= -1000; z < 1000; z+=20 ) {
    
          // Make a sphere (exactly the same as before). 
          var geometry   = new THREE.SphereGeometry(0.5, 32, 32)
          var material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
          var sphere = new THREE.Mesh(geometry, material)
    
          // This time we give the sphere random x and y positions between -500 and 500
          sphere.position.x = Math.random() * 1000 - 500;
          sphere.position.y = Math.random() * 1000 - 500;
    
          // Then set the z position to where it is in the loop (distance of camera)
          sphere.position.z = z;
    
          // scale it up a bit
          sphere.scale.x = sphere.scale.y = 2;
    
          //add the sphere to the scene
          scene.add( sphere );
    
          //finally push it to the stars array 
          stars.push(sphere); 
        }
  }


function addLight(){
    //use directional light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9);
    //set the position
    directionalLight.position.set(10, 2, 20);
    //enable shadow
    directionalLight.castShadow = false;
    //enable camera 
    directionalLight.shadowCameraVisible = true;
    //add light to the scene
    scene.add( directionalLight );
  }




/*
    Renderer setup
*/
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(maxResolution(800), maxResolution(800));
renderer.setClearColor(0x000000, 0);
document.querySelector('.js-polyhedron-container').appendChild(renderer.domElement);
document.querySelector('.js-polyhedron-container canvas').style.zIndex = 5;
document.querySelector('.js-polyhedron-container canvas').style.position = 'relative';

/*
    Lights
*/
var lights = [];
lights[0] = new THREE.SpotLight(0xffffff,1,0);
lights[1] = new THREE.SpotLight(0xffffff,0.25,0);

lights[0].position.set(25, 100, 80);
lights[1].position.set(-100, -200, 100);

scene.add(lights[0]);
scene.add(lights[1]);

/*
    Meshes
*/
var polyhedron = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.5, 0),
  new THREE.MeshPhongMaterial({
    color: 0x1b5f87,
    emissive: 0x072534,
    emissiveIntensity: 1,
    side: THREE.FrontSide,
    flatShading: true,
  })
);
scene.add(polyhedron);

/*
    Listeners
*/
window.addEventListener('resize', function() {
  requestAnimationFrame(function() {
    camera.updateProjectionMatrix();
    renderer.setSize(maxResolution(800), maxResolution(800));
  });
}, false);

/*
    Utilities
*/
function maxResolution(resolution) {
  return window.innerWidth <= resolution ? window.innerWidth : resolution;
}

/*
    Render function and per-frame mutations
*/      
var render = function() {
  requestAnimationFrame(render);
  polyhedron.rotation.x += 0.0009;
  polyhedron.rotation.y += 0.001;
  polyhedron.rotation.z += 0.0005;
  renderer.render(scene, camera);
};
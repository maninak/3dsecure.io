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
renderer.setSize(getRenderedSize(), getRenderedSize());
renderer.setClearColor(0x000000, 0);
document.querySelector('.js-polyhedron-container').appendChild(renderer.domElement);
document.querySelector('.js-polyhedron-container canvas').style.zIndex = 5;
document.querySelector('.js-polyhedron-container canvas').style.position = 'relative';

/*
    Lights
*/
var lights = [];
lights[0] = new THREE.SpotLight(0xffffff, 1, 0);
lights[1] = new THREE.SpotLight(0xffffff, 0.25, 0);

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
    color: 0x076c98,    // $color-primary
    emissive: 0x9e5300, // $color-accent-dark
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
    renderer.setSize(getRenderedSize(800), getRenderedSize(800));
  });
}, false);

/*
    Utilities
*/
function getRenderedSize() {
  // magic numbers stem from CSS design and related rules
  if (window.innerWidth >= 1200) { return 800; }
  else if (window.innerWidth >= 900) { return 700; }
  else if (window.innerWidth >= 600) { return 600; }
  else { return 400; }
}

/*
    Render function and per-frame mutations
*/      
var render = function() {
  requestAnimationFrame(render);
  polyhedron.rotation.x += 0.0007;
  polyhedron.rotation.y += 0.0008;
  polyhedron.rotation.z += 0.0003;
  renderer.render(scene, camera);
};
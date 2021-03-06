// 1. Enable shadow mapping in the renderer. 
// 2. Enable shadows and set shadow parameters for the lights that cast shadows. 
// Both the THREE.DirectionalLight type and the THREE.SpotLight type support shadows. 
// 3. Indicate which geometry objects cast and receive shadows.

let renderer = null,
    scene = null,
    camera = null,
    root = null,
    group = null,
    objectList = [],
    orbitControls = null;

let objLoader = null, jsonLoader = null;

let duration = 20000; // ms
let currentTime = Date.now();

let directionalLight = null;
let spotLight = null;
let ambientLight = null;
let pointLight = null;
let mapUrl = "../images/checker_large.gif";

let SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;
// let objModelUrl = {obj:'../models/obj/Penguin_obj/penguin.obj', map:'../models/obj/Penguin_obj/peng_texture.jpg'};
let objModelUrl = { obj: '../models/obj/Char.obj', map: '../models/obj/tex.jpg' };

/* let jsonModelUrl = { url: '../models/json/teapot-claraio.json' }; */

function promisifyLoader(loader, onProgress) {
    function promiseLoader(url) {

        return new Promise((resolve, reject) => {

            loader.load(url, resolve, onProgress, reject);

        });
    }

    return {
        originalLoader: loader,
        load: promiseLoader,
    };
}

const onError = ((err) => { console.error(err); });

async function loadJson(url, objectList) {
    const jsonPromiseLoader = promisifyLoader(new THREE.ObjectLoader());

    try {
        const object = await jsonPromiseLoader.load(url);

        object.castShadow = true;
        object.receiveShadow = true;
        object.position.y = -1;
        object.position.x = 1.5;
        object.name = "jsonObject";
        objectList.push(object);
        scene.add(object);

    }
    catch (err) {
        return onError(err);
    }
}

async function loadObj(objModelUrl, objectList) {
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(objModelUrl.obj);

        let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
        let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
        let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });

        object.scale.set(.5, .5, .5);
        object.position.z = 0;
        object.position.x = 0;
        object.position.y = 1.5;
        object.rotation.y = -3;
        object.name = "objObject";
        objectList.push(object);
        scene.add(object);

        for (let x = 0; x < array.length; x++) {
            array[x].position.y -= -5 + (x * 5);
            array[x].attach(object);
            root.add(array[x]);
        }

    }
    catch (err) {
        return onError(err);
    }
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

}

function run() {
    requestAnimationFrame(function () { run(); });

    // Render the scene
    renderer.render(scene, camera);

    // Update the camera controller
    orbit.update();
}

function setLightColor(light, r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

function createScene(canvas) {
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(-2, 6, 12);
    scene.add(camera);

    orbit = new THREE.OrbitControls(camera, renderer.domElement);
    orbit.enableRotate = false;
    orbit.update();

    array = [];
    for (let x = 0; x < 4; x++) {
        let commands = new THREE.TransformControls(camera, renderer.domElement);
        commands.mode = 'rotate';
        commands.showX = false;
        commands.showZ = false;
        commands.setSize(4);
        commands.addEventListener('change', run);
        array.push(control)
    }

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight(0x000000, 1);

    // Create and add all the lights
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    root.add(directionalLight);

    spotLight = new THREE.SpotLight(0x000000);
    spotLight.position.set(-2, 0, -2);
    spotLight.target.position.set(0, 10, 0);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    root.add(ambientLight);

    // Create the objects
    loadObj(objModelUrl, objectList);

    /* loadJson(jsonModelUrl.url, objectList); */

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let color = 0xffffff;

    // let asteroid = new THREE.Object3D();
    // Put in a ground plane to show off the lighting
    let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: color, map: map, side: THREE.DoubleSide }));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    group.add(mesh);

    scene.add(root);

    window.addEventListener('keyup', function (event) {
        switch (event.keyCode) {
            case 17:
                control.setTranslationSnap(null);
                control.setRotationSnap(null);
                control.setScaleSnap(null);
                break;
        }
    });
}
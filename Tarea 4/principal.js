let container;
let camera, scene, raycaster, renderer, Obj, score, timer, intermedios;
let mouse = new THREE.Vector2(), accion;
let radius = 100, theta = 0;
let puntaje, tiempo, perdiste, reiniciar;

let floorUrl = "./piso.gif";
let modelUrl = { obj: './Pokeball.obj', map: './texturaMorada.jpg' };
let myCanvas;
let modelNum = 0;

async function createScene(canvas) {
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  let map = new THREE.TextureLoader().load(floorUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);

  let floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
  let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, map: map, side: THREE.DoubleSide }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  raycaster = new THREE.Raycaster();

  Obj = await loadObj(modelUrl);
  await crearObj(Obj);

  intermedios = setInterval(temporizador, 100);

  document.addEventListener('mousedown', onDocumentMouseDown);
  window.addEventListener('resize', onWindowResize);

  score = 0;
  timer = 30;

  puntaje = $('#score span');
  tiempo = $('#timer span');
  perdiste = $('#game-over');
  reiniciar = $('#restart');
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  let intersecciones = raycaster.intersectObjects(scene.children, true);

  if (intersecciones.length > 0) {
    accion = intersecciones[intersecciones.length - 1].object;
    if (accion.name.includes('Model')) {
      scene.remove(accion.parent);
      createObj(Obj);
      score++;
      puntaje.text(score);
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

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

async function loadObj(objModelUrl) {
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
        child.name = 'Model';
      }
    });
    object.rotation.y = 90;
    object.scale.set(0.1, 0.1, 0.1);
    return object;
  }
  catch (err) {
    return onError(err);
  }
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function createObj(object) {
  let newObject = object.clone();
  newObject.name = 'Model' + modelNum;
  let spawnPoint = Math.random();
  if (spawnPoint < 0.25) {
    newObject.position.set(random(-6, 6), 6, -10);
  }
  else if (spawnPoint < 0.75) {
    newObject.position.set(random(-6, 6), -7, -10);
  }
  else if (spawnPoint < 0.5) {
    newObject.position.set(12, random(-6, 6), -10);
  }
  else if (spawnPoint < 1) {
    newObject.position.set(-12, random(-6, 6), -10);
  }

  scene.add(newObject);
  modelNum++;
}

function run() {
  if (timer <= 0) {
    perdiste.css('display', 'block');
    reiniciar.css('display', 'block');
    puntaje = null;
    borrarIntermedios(intermedios);
    return;
  }
  requestAnimationFrame(run);
  movimientoCamara(0.02);
  render();
}

function temporizador() {
  timer = Math.round((timer - 0.1) * 10) / 10;
  tiempo.text(timer);
}

async function restart() {
  timer = 30;
  score = 0;
  borrarObj();
  await crearObj(Obj);
  if (perdiste.css('display') === 'block') {
    run();
  } else {
    borrarIntermedios(intermedios);
  }
  intermedios = setInterval(temporizador, 100);
  puntaje = $('#score span');
  puntaje.text(score);
  tiempo.text(timer);
  perdiste.css('display', 'none');
  reiniciar.css('display', 'none');
}

async function crearObj(Obj) {
  for (let i = 0; i < 10; i++) {
    await createObj(Obj);
  }
}

async function borrarObj() {
  for (child of scene.children) {
    if (child.name.includes('Model')) {
      await scene.remove(child);
    }
  }
}

function render() {
  renderer.render(scene, camera);
}

function movimientoCamara(speed) {
  for (child of scene.children) {
    if (child.name.includes('Model')) {
      if (child.position.x > camera.position.x) {
        child.position.x -= speed;
      }
      else if (child.position.x < camera.position.x) {
        child.position.x += speed;
      }
      if (child.position.y > camera.position.y) {
        child.position.y -= speed;
      }
      else if (child.position.y < camera.position.y) {
        child.position.y += speed;
      }
      const X = child.position.x - camera.position.x;
      const Y = child.position.y - camera.position.y;
      if (Math.abs(X) < speed && Math.abs(Y) < speed) {
        score--;
        puntaje.text(score);
        scene.remove(child);
        createObj(Obj);
      }
    }
  }
}
'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;
const THREE = require('three');

const time = require('../util/time');
const threeUtil = require('../util/three');
const BVHLoader = require('../util/bvh');

const hook = (state$, actions, canvas) => {
	canvas.width = canvas.parentNode.offsetWidth;
	canvas.height = canvas.parentNode.offsetHeight;
	let width = canvas.width;
	let height = canvas.height;

	let clock = new THREE.Clock();

	let camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
	let scene = new THREE.Scene();
	scene.background = new THREE.Color().setHSL(0.6, 0, 0.1);
	scene.fog = new THREE.Fog(scene.background, 1, 3000);

	// lights
	let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
	hemiLight.color.setHSL(0.6, 0, 0.8);
	hemiLight.groundColor.setHSL(0.095, 1, 0.75);
	hemiLight.position.set(0, 100, -100);
	scene.add(hemiLight);

	// LIGHTS
	// var light = new THREE.PointLight(0xffffff, 1, 1000);
	// light.position.set(0, 300, -100);
	// light.castShadow = true;            // default false
	// scene.add(light);
	// scene.add(dirLightHeper);
	let sunLight = new THREE.DirectionalLight(0xffffff, 1, 700);
	sunLight.color.setHSL(0.1, 0.3, 0.7);
	// dirLight.position.set(1000, 1000, 1000);
	// dirLight.position.multiplyScalar(1000);
	// scene.add(dirLight);
	sunLight.castShadow = true;
	sunLight.shadow.mapSize.width = 1024;
	sunLight.shadow.mapSize.height = 1024;
	var d = 700;
	sunLight.shadow.camera.left = -d;
	sunLight.shadow.camera.right = d;
	sunLight.shadow.camera.top = d;
	sunLight.shadow.camera.bottom = -d;
	sunLight.shadow.camera.far = 2000;
	sunLight.shadow.bias = -0.0001;
	scene.add(sunLight);
	scene.add(sunLight.target);

	// ground
	let texture = new THREE.TextureLoader().load('assets/textures/dirt.jpg');
	let textureNormal = new THREE.TextureLoader().load('assets/textures/dirt-normal.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(32, 32);
	textureNormal.wrapS = THREE.RepeatWrapping;
	textureNormal.wrapT = THREE.RepeatWrapping;
	textureNormal.repeat.set(32, 32);

	let geometry = new THREE.BoxBufferGeometry(10000, 10, 10000);
	let material = new THREE.MeshPhongMaterial({
		map: texture,
		bumpMap: textureNormal,
		bumpScale: 0.7,
		reflectivity: 0.3,
		shininess: 0.3
	});
	let ground = new THREE.Mesh(geometry, material);
	ground.position.set(0, 0, 0);
	ground.receiveShadow = true;
	ground.castShadow = true;
	scene.add(ground);

	let mixer = false;
	let player = false;
	let acts = false;

	/*
	threeUtil.load('assets/models/fighter.json')
		.subscribe(mesh => {
			player = mesh.clone();
			// player.rotation.y = -180 * Math.PI / 180;
			scene.add(player);
			player.castShadow = true;
			player.receiveShadow = true;
			player.scale.set(10, 10, 10);

			console.log({player});

			mixer = new THREE.AnimationMixer(player);
			mixer.clipAction('walk').setEffectiveWeight(1).play();
		});
	*/
	threeUtil.load('assets/models/fighter.json')
		.subscribe(mesh => {
			player = mesh.clone();
			player.rotation.y = -180 * Math.PI / 180;
			scene.add(player);
			player.castShadow = true;
			player.receiveShadow = true;
			player.scale.set(10, 10, 10);

			// skeleton
			let skeleton = new THREE.SkeletonHelper(player);
			skeleton.visible = false;
			scene.add(skeleton);
			// testMesh.scale.set(0.001, 0.001, 0.001);
			mixer = new THREE.AnimationMixer(player);
			console.log(mixer, skeleton);
			let idleAction = mixer.clipAction('Pose');
			let walkAction = mixer.clipAction('walk');
			let runAction = mixer.clipAction('run');
			acts = [walkAction];

			acts.forEach(function(action) {
				action.play();
			});
		});

	// sky

	// renderer
	let renderer = new THREE.WebGLRenderer({canvas, antialias: true});
	renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	renderer.setPixelRatio(window.devicePixelRatio);

	const degreeToRadiant = deg => Math.PI / (180 / deg);
	const calcucalateAngle = (view, range) => ({
		x: (view.x / view.width * range.h) + range.hOffset,
		y: (view.y / view.height * range.v) + range.vOffset
	});

	time.frame().withLatestFrom(state$, (time, state) => state)
		.subscribe(state => {
			const newPos = new THREE.Vector3().fromArray(state.position);

			const cameraAngle = calcucalateAngle(state.view, state.camera.range);

			let anim = false;
			let running = false;

			// player
			if (player && player.position) {
				if (player.position.distanceTo(newPos) > 0) {
					anim = true;
					player.lookAt(newPos);
					// player.rotation.y -= 135;
					console.log(player.position.distanceTo(newPos));
					if (player.position.distanceTo(newPos) >= 10) running = true;
				}
				player.position.copy(newPos);
			}

			sunLight.position.copy(newPos.clone().addScalar(100));
			sunLight.target.position.copy(newPos);
			// sunLight.lookAt(newPos);

			// manage animation

			if (acts) {
				if (anim) {
					acts[0].setEffectiveWeight(1);
					// acts[1].setEffectiveWeight(running ? 0 : 1);
					// acts[2].setEffectiveWeight(running ? 1 : 0);
				} else {
					acts[0].setEffectiveWeight(0);
					// acts[1].setEffectiveWeight(0);
					// acts[2].setEffectiveWeight(0);
				}
			}

			let mixerUpdateDelta = clock.getDelta();
			if (mixer) mixer.update(mixerUpdateDelta);

			camera.position.copy(newPos.clone().add({
				x: Math.cos(degreeToRadiant(cameraAngle.x)) *
					Math.cos(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
				y: Math.sin(degreeToRadiant(cameraAngle.y)) * state.camera.distance,
				z: -Math.cos(degreeToRadiant(cameraAngle.y)) *
					Math.sin(degreeToRadiant(cameraAngle.x)) * state.camera.distance
			}));
			// console.log(newPos.distanceTo(camera.position));

			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			camera.lookAt(newPos);

			renderer.setSize(width, height);
			renderer.render(scene, camera);
		});

	window.addEventListener("resize", function() {
		if (canvas && canvas.parentNode) {
			canvas.width = canvas.parentNode.offsetWidth;
			canvas.height = canvas.parentNode.offsetHeight;
			width = canvas.width;
			height = canvas.height;
		}
	});
};

module.exports = {
	hook
};

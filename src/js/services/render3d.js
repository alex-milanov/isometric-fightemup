'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;
const THREE = require('three');

const time = require('../util/time');

const hook = (state$, actions, canvas) => {
	canvas.width = canvas.parentNode.offsetWidth;
	canvas.height = canvas.parentNode.offsetHeight;
	let width = canvas.width;
	let height = canvas.height;

	let camera = new THREE.PerspectiveCamera(70, width / height, 1, 10000);
	let scene = new THREE.Scene();
	let texture = new THREE.TextureLoader().load('assets/textures/dirt.jpg');
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(4, 4);
	let geometry = new THREE.BoxBufferGeometry(1000, 10, 1000);
	let material = new THREE.MeshBasicMaterial({map: texture});
	let mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	let renderer = new THREE.WebGLRenderer({canvas});
	renderer.setPixelRatio(window.devicePixelRatio);

	time.frame().withLatestFrom(state$, (time, state) => state)
		.subscribe(state => {
			// camera
			camera.position.x = state.position[0] + state.cameraOffset[0];
			camera.position.y = state.position[1] + state.cameraOffset[1];
			camera.position.z = state.position[2] + state.cameraOffset[2];
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			camera.lookAt(new THREE.Vector3().fromArray(state.position));

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

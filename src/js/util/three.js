'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;
const THREE = require('three');

const create = (geometry, materials) => (
	(materials.forEach(mat => {
		// mat.lightMapIntensity = 0.75;
		// mat.flatShading = true;
	})),
	new THREE.SkinnedMesh(geometry, materials)
);

const load = url => $.create(o =>
	new THREE.ObjectLoader().load(url,
		loaded => loaded.traverse(child => child instanceof THREE.Mesh
			&& (o.onNext(child), o.onCompleted())
		)))
	.map(data => (console.log(data), data));
	// .map(({geometry, materials}) => create(geometry, materials));

// const load = url => $.create(o =>
// 	new THREE.FBXLoader().load(url,
// 		loaded => loaded))
// 	.map(data => (console.log(data), data));

module.exports = {
	create,
	load
};

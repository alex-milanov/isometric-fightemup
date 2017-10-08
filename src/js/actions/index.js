'use strict';

const {obj, arr} = require('iblokz-data');

// namespaces=

// initial
const initial = {
	camera: {
		distance: 520,
		range: {
			h: 360,
			hOffset: -90,
			v: 80,
			vOffset: 10
		},
		rotateWithPlayer: false
	},
	position: [0, 0, 0],
	needsRefresh: false,
	// 3d view info
	view: {
		width: 800,
		height: 600,
		x: 400,
		y: 300
	},
	controls: {
		on: true,
		camera: true
	}
};

// actions
const set = (key, value) => state => obj.patch(state, key, value);
const toggle = key => state => obj.patch(state, key, !obj.sub(state, key));
const arrToggle = (key, value) => state =>
	obj.patch(state, key,
		arr.toggle(obj.sub(state, key), value)
	);

const move = (direction, force) =>
	state => obj.patch(state, 'position', state.position.map((p, i) => (p + direction[i] * force)));

const updateView = (width, height, x, y) => state =>
	obj.patch(state, 'view', {
		width, height, x, y
	});

module.exports = {
	initial,
	set,
	toggle,
	arrToggle,
	move,
	updateView
};

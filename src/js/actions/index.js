'use strict';

const {obj, arr} = require('iblokz-data');

// namespaces=
const counter = require('./counter');

// initial
const initial = {
	cameraOffset: [0, 200, -100],
	position: [0, 0, 0],
	needsRefresh: false
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

module.exports = {
	initial,
	counter,
	set,
	toggle,
	arrToggle,
	move
};

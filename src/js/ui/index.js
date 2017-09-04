'use strict';

// dom
const {header, h1, section, button, span, canvas} = require('iblokz-snabbdom-helpers');
// components
// const counter = require('./counter');

module.exports = ({state, actions}) => section('#ui', [].concat(
	header([
		h1('Isometric Fightemup')
	]),
	state.needsRefresh === false ? canvas('#view3d[width="640"][height="480"]') : ''
));

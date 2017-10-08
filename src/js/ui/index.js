'use strict';

// dom
const {
	header, h1, section, button, span, canvas,
	form, input, label, legend, fieldset, div, i
} = require('iblokz-snabbdom-helpers');
// components
// const counter = require('./counter');

const {obj} = require('iblokz-data');

const inputControl = ({title, type, value, path}, actions) => div([
	label(title),
	input({
		attrs: {
			type
		},
		on: {
			input: ev => actions.set(path, type === 'number'
				? parseFloat(ev.target.value)
				: ev.target.value
			)
		},
		props: {
			value
		}
	})
]);

const toggleControl = (path, value, actions) => div('.toggle', {
	on: {
		click: () => actions.toggle(path)
	}
}, [
	i('.fa', {
		class: {
			'fa-square-o': !value,
			'fa-check-square-o': value
		}
	}),
	path.slice(-1).pop()
]);

const parseFields = (data, path, actions) => Object.keys(data)
	.reduce((fields, field) => [].concat(fields,
		obj.switch(typeof data[field], {
			default: () => inputControl({
				title: field,
				type: typeof data[field],
				value: data[field],
				path: [].concat(path, field)
			}, actions),
			object: () => parseFields(data[field], [].concat(path, field), actions),
			boolean: () => toggleControl([].concat(path, field), data[field], actions)
		})()), []);

module.exports = ({state, actions}) => section('#ui', [].concat(
	header([
		h1('Isometric Fightemup')
	]),
	section('.controls', [form([
		fieldset([].concat(
			legend({
				on: {
					click: () => actions.toggle(['controls', 'camera'])
				}
			}, [
				i('.fa', {
					class: {
						'fa-minus': state.controls.camera,
						'fa-plus': !state.controls.camera
					}
				}),
				'Camera'
			]),
			state.controls.camera && parseFields(state.camera, ['camera'], actions) || []
			// inputControl({
			// 	title: 'distance',
			// 	type: 'number',
			// 	value: state.camera.distance,
			// 	path: ['camera', 'distance']
			// }, actions),
			// inputControl({
			// 	title: 'range.h',
			// 	type: 'number',
			// 	value: state.camera.range.h,
			// 	path: ['camera', 'range', 'h']
			// }, actions),
			// inputControl({
			// 	title: 'range.hOffset',
			// 	type: 'number',
			// 	value: state.camera.range.hOffset,
			// 	path: ['camera', 'range', 'hOffset']
			// }, actions),
			// inputControl({
			// 	title: 'range.v',
			// 	type: 'number',
			// 	value: state.camera.range.v,
			// 	path: ['camera', 'range', 'v']
			// }, actions),
			// inputControl({
			// 	title: 'range.vOffset',
			// 	type: 'number',
			// 	value: state.camera.range.vOffset,
			// 	path: ['camera', 'range', 'vOffset']
			// }, actions),
			// div('.toggle', {
			// 	on: {
			// 		click: () => actions.toggle(['camera', 'rotateWithPlayer'])
			// 	}
			// }, [
			// 	i('.fa', {
			// 		class: {
			// 			'fa-square-o': !state.camera.rotateWithPlayer,
			// 			'fa-check-square-o': state.camera.rotateWithPlayer
			// 		}
			// 	}),
			// 	'Rotate with player'
			// ])
		)),
		fieldset([
			legend('View Info'),
			div(`Size: ${state.view.width} x ${state.view.height}`),
			div(`Mouse: ${state.view.x} x ${state.view.y}`),
			div(`Move: WASD / Arrow keys`),
			div(`Run: Shift`)
		])
	])]),
	state.needsRefresh === false ? canvas('#view3d[width="640"][height="480"]') : ''
));

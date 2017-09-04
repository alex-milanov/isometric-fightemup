'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;
const THREE = require('three');

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// util
const keyboard = require('./util/keyboard');
const time = require('./util/time');

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
let ui = require('./ui');
let actions$;
window.actions = actions;

// services
let render3d = require('./services/render3d');

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		window.actions = actions;
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
	// render3d
	module.hot.accept("./services/render3d", function() {
		console.log('updating render3d');
		render3d = require('./services/render3d');
		actions.set('needsRefresh', true);
		// state$.connect();
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
const state$ = new Rx.BehaviorSubject();
actions$
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.map(state => (console.log(state), state))
	.subscribe(state => state$.onNext(state));

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

// refesh
state$.distinctUntilChanged(state => state.needsRefresh)
	.filter(state => state.needsRefresh)
	.subscribe(state =>
			actions.toggle('needsRefresh')
	);

$.interval(100).map(() => document.querySelector('#view3d'))
	.distinctUntilChanged(canvas => canvas)
	.filter(canvas => canvas)
	.subscribe(canvas => render3d.hook(state$, actions, canvas));

// control
const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift']);

const getDirection = keys => ([
	keys.left && 1 || keys.right && -1 || 0,
	0,
	keys.up && 1 || keys.down && -1 || 0
]);

const getForce = keys => (keys.shift && 10 || 5) * ((keys.left || keys.right || keys.up || keys.down) ? 1 : 0);

const directionForce$ = pressedKeys$
	// .filter(keys => keys.up || keys.down || keys.left || keys.right)
	.map(keys => (console.log('keys', keys), keys))
	.map(keys => ({
		direction: getDirection(keys),
		force: getForce(keys)
	}));

time.frame().withLatestFrom(directionForce$, (t, df) => df)
	.filter(({force}) => force > 0)
	.subscribe(({direction, force}) => actions.move(direction, force));

/*
const jump$ = keyboard.on('space')
	.map(ev => (console.log(ev), ev))
	.subscribe(() => actions.jump());
*/

// state$.connect();

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}

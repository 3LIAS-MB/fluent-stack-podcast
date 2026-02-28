"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const remotion_1 = require("remotion");
const index_1 = require("../index");
const test_utils_1 = require("./test-utils");
test('no compositionWidth should give errors', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player
        // @ts-expect-error
        , { 
            // @ts-expect-error
            compositionWidth: null, errorFallback: () => 'something went wrong', compositionHeight: 400, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    }
    catch (e) {
        expect(e.message).toMatch(/'compositionWidth' must be a number but got 'object' instead/);
    }
});
test('no compositionHeight should give errors', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 400, errorFallback: () => 'something went wrong', 
            // @ts-expect-error
            compositionHeight: undefined, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    }
    catch (e) {
        expect(e.message).toMatch(/'compositionHeight' must be a number but got 'undefined' instead/);
    }
});
test('No fps should give errors', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, errorFallback: () => 'something went wrong', 
            // @ts-expect-error
            fps: null, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    }
    catch (e) {
        expect(e.message).toMatch(/"fps" must be a number, but you passed a value of type object/);
    }
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, errorFallback: () => 'something went wrong', 
            // @ts-expect-error
            fps: undefined, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    }
    catch (e) {
        expect(e.message).toMatch(/"fps" must be a number, but you passed a value of type undefined/);
    }
});
test('No durationInFrames should give errors', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, errorFallback: () => 'something went wrong', fps: 30, 
            // @ts-expect-error
            durationInFrames: undefined, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    }
    catch (e) {
        expect(e.message).toMatch(/The "durationInFrames" prop of the <Player\/> component must be a number, but you passed a value of type undefined/);
    }
});
test('Invalid playbackRate should give error', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true, playbackRate: -5 }));
    }
    catch (e) {
        expect(e.message).toMatch(/The lowest possible playback rate is -4. You passed: -5/);
    }
});
test('playbackRate of 0 should not be possible', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true, playbackRate: 0 }));
    }
    catch (e) {
        expect(e.message).toMatch(/A playback rate of 0 is not supported./);
    }
});
test('playbackRate of wrong type should not be possible', () => {
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true, 
            // @ts-expect-error
            playbackRate: 'hi' }));
    }
    catch (e) {
        expect(e.message).toMatch(/A playback rate of 0 is not supported./);
    }
});
test('playbackRate of undefined should be okay', () => {
    (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, component: test_utils_1.HelloWorld, controls: true, showVolumeControls: true }));
    expect(true).toBe(true);
});
test('passing in <Composition /> instance should not be possible', () => {
    expect(() => {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, component: remotion_1.Composition, controls: true, showVolumeControls: true, inputProps: {
                id: 'HelloWorld',
                width: 500,
                height: 400,
                fps: 30,
                durationInFrames: 500,
                component: test_utils_1.HelloWorld,
            } }));
    }).toThrow(/'component' must not be the 'Composition' component\. Pass your own React/);
});
test('passing in <Composition /> instance should not be possible', () => {
    expect(() => {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, fps: 30, durationInFrames: 500, 
            // @ts-expect-error
            component: (0, jsx_runtime_1.jsx)(remotion_1.Composition, { durationInFrames: 30, fps: 30, height: 10, width: 10, id: "hello", component: test_utils_1.HelloWorld }), controls: true, showVolumeControls: true, inputProps: {
                id: 'HelloWorld',
                width: 500,
                height: 400,
                fps: 30,
                durationInFrames: 500,
                component: test_utils_1.HelloWorld,
            } }));
    }).toThrow(/'component' should not be an instance of <Composition\/>\. Pass the React component dir/);
});
test.each([
    ['controls'],
    ['loop'],
    ['autoPlay'],
    ['showVolumeControls'],
    ['allowFullscreen'],
    ['clickToPlay'],
    ['doubleClickToFullscreen'],
])('No durationInFrames should give errors %s', (a) => {
    const props = {};
    props[a] = 'hey';
    try {
        (0, test_utils_1.render)((0, jsx_runtime_1.jsx)(index_1.Player, { compositionWidth: 500, compositionHeight: 400, errorFallback: () => 'something went wrong', fps: 30, durationInFrames: 100, component: test_utils_1.HelloWorld, ...props }));
    }
    catch (e) {
        expect(e.message).toMatch(`'${a}' must be a boolean or undefined but got 'string' instead`);
    }
});

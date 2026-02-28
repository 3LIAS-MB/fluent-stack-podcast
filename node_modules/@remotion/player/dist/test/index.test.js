"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const use_player_1 = require("../use-player");
test('It should throw an error if not being used inside a RemotionRoot', () => {
    expect(() => {
        (0, use_player_1.usePlayer)();
    }).toThrow();
});

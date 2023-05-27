import Phaser from "phaser";

import MemoryGameScene from "./scenes/MemoryGameScene";

const config = {
  type: Phaser.AUTO,
  width: 720, //atur lebar
  height: 680, //atur tinggi
  physics: {
    default: "arcade", // library Arcade Phaser
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [MemoryGameScene], //atur scene
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
export default new Phaser.Game(config);

import Phaser from "phaser";

export default class MemoryGameScene extends Phaser.Scene {
  constructor() {
    super("memory-game-scene");
  }

  preload() {
    this.load.image("bg", "images/bg.jpg");
  }

  create() {
    this.add.image(this.halfWidth, this.halfHeight, "bg").setScale(3);
  }

  update() {}
}

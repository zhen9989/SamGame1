import Phaser from "phaser";

// Function to generate a random array of a given size and range
function generateRandomArray(rows, cols, min, max) {
  const randomArray = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push(0); // Start with all values as 0
    }
    randomArray.push(row);
  }

  // Generate pairs of 1, 2, 3, and 4
  for (let num = 1; num <= max; num++) {
    for (let pair = 0; pair < 2; pair++) {
      const emptyCells = findEmptyCells(randomArray);
      if (emptyCells.length === 0) {
        // All cells are filled, break
        break;
      }
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const [x, y] = emptyCells[randomIndex];
      randomArray[x][y] = num;
    }
  }

  // Add a single 0 value randomly
  const emptyCells = findEmptyCells(randomArray);
  if (emptyCells.length > 0) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const [x, y] = emptyCells[randomIndex];
    randomArray[x][y] = 0;
  }

  return randomArray;
}

// Function to find empty cells in the array
function findEmptyCells(array) {
  const emptyCells = [];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (array[i][j] === 0) {
        emptyCells.push([i, j]);
      }
    }
  }
  return emptyCells;
}

// Define the size of the random array
const numRows = 3;
const numCols = 3;

// Generate the random array
const randomArray = generateRandomArray(numRows, numCols, 0, 4);

// Push the random array to the 'level' constant
const level = randomArray;

export default class MemoryGameScene extends Phaser.Scene {
  constructor() {
    super("memory-game-scene");
  }

  init() {
    this.halfWidth = this.scale.width / 2;
    this.halfHeight = this.scale.height / 2;
    this.boxGroup = undefined;
    this.player = undefined;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.activeBox = undefined;
    this.itemsGroup = undefined;
    this.selectedBoxes = [];
    this.matchesCount = 0;
    this.timerLabel = undefined;
    this.countdownTimer = 40;
    this.timedEvent = undefined;
    this.winCondition = false;
  }

  preload() {
    this.load.image("bg", "images/bg2.jpg");
    this.load.spritesheet("tilesheet", "images/sokoban_tilesheet.png", {
      frameWidth: 64,
    });
    this.load.image("chicken", "images/chicken.png");
    this.load.image("duck", "images/duck.png");
    this.load.image("bear", "images/bear.png");
    this.load.image("parrot", "images/parrot.png");
    this.load.image("penguin", "images/penguin.png");
    this.load.image("play", "images/play.png");
    this.load.spritesheet("player", "images/retro.png", {
      frameWidth: 175.25,
      frameHeight: 255.75,
    });
  }

  create() {
    this.add.image(this.halfWidth, 20, "bg").setScale(10);
    this.boxGroup = this.physics.add.staticGroup();
    this.createBoxes();
    this.player = this.createPlayer();

    this.physics.add.collider(
      this.player,
      this.boxGroup,
      this.handlePlayerBoxCollide,
      undefined,
      this
    );
    this.itemsGroup = this.add.group();
    this.timerLabel = this.add.text(610, 600, null);
    this.timedEvent = this.time.addEvent({
      delay: 1000,
      callback: this.gameOver,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    this.movePlayer(this.player);
    this.children.each((children) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      // @ts-ignore
      const child = children;
      if (child.getData("sorted")) {
        return;
      }
      child.setDepth(child.y);
    });
    this.updateActiveBox();
    this.timerLabel
      .setStyle({
        fontSize: "80px",
        fill: "#ffffff",
        fontStyle: "bold",
        align: "center",
      })
      .setText(String(this.countdownTimer));
  }

  createBoxes() {
    const width = this.scale.width;
    let xPer = 0.25;
    let y = 150;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        this.boxGroup
          .get(width * xPer, y, "tilesheet", 7)
          .setSize(64, 32)
          .setOffset(0, 32)
          .setData("itemType", level[row][col]);
        xPer += 0.25;
      }
      xPer = 0.25;
      y += 150;
    }
  }
  createPlayer() {
    const player = this.physics.add
      .sprite(this.halfWidth, this.halfHeight, "player")
      .setSize(40, 16)
      .setScale(0.25, 0.25)
      .setOffset(12, 38);
    player.setCollideWorldBounds(true);
    this.anims.create({
      key: "standby",
      frames: [{ key: "player", frame: 0 }],
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("player", {
        start: 1,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("player", {
        start: 5,
        end: 7,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("player", {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("player", {
        start: 13,
        end: 15,
      }),
      frameRate: 10,
      repeat: -1,
    });

    return player;
  }

  movePlayer(player) {
    if (!this.player.active) {
      return;
    }
    const speed = 200;
    if (this.cursors.left.isDown) {
      this.player.setVelocity(-speed, 0);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocity(speed, 0);
      this.player.anims.play("right", true);
    } else if (this.cursors.up.isDown) {
      this.player.setVelocity(0, -speed);
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocity(0, speed);
      this.player.anims.play("down", true);
    } else {
      this.player.setVelocity(0, 0);
      this.player.anims.play("standby", true);
    }

    const spaceJustPressed = Phaser.Input.Keyboard.JustUp(this.cursors.space);
    if (spaceJustPressed && this.activeBox) {
      this.openBox(this.activeBox);
      this.activeBox.setFrame(7);
      this.activeBox = undefined;
    }
  }

  handlePlayerBoxCollide(player, box) {
    const opened = box.getData("opened");
    if (opened) {
      return;
    }
    if (this.activeBox) {
      return;
    }
    this.activeBox = box;
    this.activeBox.setFrame(9);
  }

  updateActiveBox() {
    if (!this.activeBox) {
      return;
    }
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.activeBox.x,
      this.activeBox.y
    );
    if (distance < 64) {
      return;
    }
    this.activeBox.setFrame(7); //mengembalikan frame merah
    this.activeBox = undefined;
  }

  openBox(box) {
    if (!box) {
      return;
    }
    const itemType = box.getData("itemType");
    let item;
    switch (itemType) {
      case 0:
        item = this.itemsGroup.get(box.x, box.y);
        item.setTexture("bear");
        break;
      case 1:
        item = this.itemsGroup.get(box.x, box.y);
        item.setTexture("chicken");
        break;
      case 2:
        item = this.itemsGroup.get(box.x, box.y);
        item.setTexture("duck");
        break;
      case 3:
        item = this.itemsGroup.get(box.x, box.y);
        item.setTexture("parrot");
        break;
      case 4:
        item = this.itemsGroup.get(box.x, box.y);
        item.setTexture("penguin");
        break;
    }
    if (!item) {
      return;
    }
    box.setData("opened", true);
    item.setData("sorted", true);
    item.setDepth(2000);
    item.setActive(true);
    item.setVisible(true);
    item.scale = 0;
    item.alpha = 0;

    this.selectedBoxes.push({ box, item });

    this.tweens.add({
      targets: item,
      y: "-=50",
      alpha: 1,
      scale: 1,
      duration: 500,
      onComplete: () => {
        if (itemType === 0) {
          this.handleBearSelected();
          return;
        }
        if (this.selectedBoxes.length < 2) {
          return;
        }
        this.checkForMatch();
      },
    });
  }

  handleBearSelected() {
    const { box, item } = this.selectedBoxes.pop();
    item.setTint(0xff0000); //ubah warna beruang
    box.setFrame(20); //ubah frame box
    this.player.active = false; //non active kan player
    this.player.setVelocity(0, 0); //tidak bisa bergerak
    this.time.delayedCall(1000, () => {
      item.setTint(0xffffff);
      box.setFrame(7);
      box.setData("opened", false);
      this.tweens.add({
        targets: item,
        y: "+=50",
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => {
          this.player.active = true;
        },
      });
    });
  }
  checkForMatch() {
    const second = this.selectedBoxes.pop();
    const first = this.selectedBoxes.pop();
    if (first.item.texture !== second.item.texture) {
      this.tweens.add({
        targets: [first.item, second.item],
        y: "+=50",
        alpha: 0,
        scale: 0,
        duration: 300,
        delay: 1000,
        onComplete: () => {
          this.itemsGroup.killAndHide(first.item);
          this.itemsGroup.killAndHide(second.item);
          first.box.setData("opened", false);
          second.box.setData("opened", false);
        },
      });
      return;
    }
    ++this.matchesCount;
    this.time.delayedCall(1000, () => {
      first.box.setFrame(8);
      second.box.setFrame(8);
      if (this.matchesCount >= 4) {
        this.player.active = false;
        this.player.setVelocity(0, 0);
        this.add
          .text(this.halfWidth, this.halfHeight + 250, "You Win!", {
            fontSize: "60px",
          })
          .setOrigin(0.5);
        this.winCondition = true;
      }
    });
  }
  gameOver() {
    if (this.countdownTimer == 0) {
      this.add
        .text(this.halfWidth, this.halfHeight + 250, "You Lose!", {
          fontSize: "60px",
        })
        .setOrigin(0.5);
      this.countdownTimer = 0;
      this.player.active = false;
      this.player.setVelocity(0, 0);
    } else if (this.countdownTimer != 0 && this.winCondition != true) {
      this.countdownTimer -= 1;
    }
  }
}

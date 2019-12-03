var config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: window.innerWidth,
    height: window.innerHeight,
    pixelArt: true,
    roundPixels: true,
    scene: [
        BootScene,
        MainScene,
    ]
};

var game = new Phaser.Game(config);
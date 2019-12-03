class BootScene extends Phaser.Scene {
    constructor() {
        super({
            key:'BootScene'
        });
    }
 
    preload() {
        this.load.spritesheet('tileset:forest', 'assets/sprites/forest.png', { frameWidth: 24, frameHeight: 24 });
        this.load.spritesheet('tileset:units', 'assets/sprites/units.png', { frameWidth: 24, frameHeight: 24 });

        this.load.spritesheet('tileset:effectsSmall', 'assets/sprites/effectsSmall.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('tileset:effectsLarge', 'assets/sprites/effectsLarge.png', { frameWidth: 64, frameHeight: 64 });

        this.load.json('data:units', 'assets/units.json');
    }
 
    create() {
        this.scene.start('MainScene');
    }
};
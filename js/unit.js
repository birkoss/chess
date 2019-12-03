class Unit extends Phaser.GameObjects.Container {

    constructor(scene, unitId) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.pixelScale = 2;
        this.unitId = unitId;
    }

    create() {
        this.unitData = {};

        let unitsData = this.scene.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            if (single_data.id == this.unitId) {
                this.unitData = single_data;
            }
        }, this);

        this.background = this.scene.add.sprite(0, 0, "tileset:units", this.unitData.frames[0]);
        this.background.setScale(this.pixelScale);
        this.add(this.background);

        this.x += this.background.width / 2;
        this.y += this.background.height / 2;

        this.direction = -1;
    }

    activate() {
        this.background.anims.play(this.unitId);
    }

    face(newDirection) {
        if (newDirection == this.direction) {
            return;
        }

        this.direction = newDirection;
        
        this.scaleX = (this.direction * -1);
    }

    deactivate() {
        this.background.anims.stop();
    }
};
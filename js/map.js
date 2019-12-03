class Map extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);

        this.gridWidth = 8;
        this.gridHeight = 8;

        this.pixelScale = 2;
    }

    create() {
        let unitsData = this.scene.cache.json.get('data:units');
        unitsData.forEach(single_data => {
            this.scene.anims.create({
                key: single_data.id,
                frames:this.scene.anims.generateFrameNumbers('tileset:units', { frames: single_data.frames }),
                frameRate: 3,
                repeat: -1
            });
        }, this);

        this.scene.anims.create({
            key: "attack",
            frames:this.scene.anims.generateFrameNumbers('tileset:effectsLarge', { frames: [10, 11] }),
            frameRate: 3,
            repeat: -1
        });

        this.createTiles();
        this.createUnits();

        this.actions = this.scene.add.group();
    }
 
    createTiles() {
        this.background = this.scene.add.sprite(0, 0, "tileset:forest", 0);
        this.background.setTint(0x000000);
        this.background.setOrigin(0, 0);
        this.add(this.background);

        this.tiles = this.scene.add.group();

        for (var y=0; y<this.gridHeight; y++) {
            for (var x=0; x<this.gridWidth; x++) {
                var tile = this.scene.add.sprite(0, 0, "tileset:forest", 0);
                tile.setScale(this.pixelScale);
                tile.setOrigin(0, 0);

                tile.x = (tile.width * this.pixelScale) * x;
                tile.y = (tile.height * this.pixelScale) * y;

                tile.index = (y * this.gridHeight) + x;

                if ((tile.index % 2 == 0 && y % 2) || (tile.index % 2 == 1 && y % 2 == 0)) {
                    tile.setFrame(1);
                }

                this.add(tile);
                this.tiles.add(tile);
            }
        }

        /* A background handles all events */
        this.background.displayWidth = this.getBounds().width;
        this.background.displayHeight = this.getBounds().height;
        this.background.setInteractive();
        this.background.on('pointerdown', this.backgroundClicked, this);
    }

    createUnits() {
        this.units = this.scene.add.group();

        let unit = new Unit(this.scene, "knight")
        unit.create();

        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 3, 0);

        unit = new Unit(this.scene, "rogue")
        unit.create();

        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 0, 3);


        unit = new Unit(this.scene, "archer");
        unit.create();
        unit.face(1);
        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 0, 2);

        unit = new Unit(this.scene, "skeleton")
        unit.create();

        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 6, 4);
    }

    deleteUnitAt(x, y) {
        this.units.getChildren().forEach(single_unit => {
            if (single_unit.gridX == x && single_unit.gridY == y) {
                console.log(single_unit);
                single_unit.destroy(true);
            }
        }, this);
    }

    moveUnitTo(unit, x, y) {
        unit.x = (x * (unit.getBounds().width)) + unit.getBounds().width / 2;
        unit.y = (y * (unit.getBounds().height)) + unit.getBounds().height / 2;

        unit.face(unit.gridX < x ? 1 : -1);

        unit.gridX = x;
        unit.gridY = y;


    }

    createActions(unit) {
        console.log("createActions -> " + unit.gridX + "x" + unit.gridY);

        var actions = {
            "peon": [
                {x:-1, y:0, range:1},
                {x:1, y:0, range:1},
                {x:0, y:-1, range:1},
                {x:0, y:1, range:1},
            ],
            "tower": [
                {x:-1, y:0, range:this.gridWidth},
                {x:1, y:0, range:this.gridWidth},
                {x:0, y:-1, range:this.gridHeight},
                {x:0, y:1, range:this.gridHeight},
            ],
            "fool": [
                {x:-1, y:-1, range:this.gridWidth},
                {x:1, y:1, range:this.gridWidth},
                {x:1, y:-1, range:this.gridHeight},
                {x:-1, y:1, range:this.gridHeight},
            ],
            "queen": [
                {x:-1, y:0, range:this.gridWidth},
                {x:1, y:0, range:this.gridWidth},
                {x:0, y:-1, range:this.gridHeight},
                {x:0, y:1, range:this.gridHeight},
                {x:-1, y:-1, range:this.gridWidth},
                {x:1, y:1, range:this.gridWidth},
                {x:1, y:-1, range:this.gridHeight},
                {x:-1, y:1, range:this.gridHeight},
            ],
            "king": [
                {x:-1, y:0, range:1},
                {x:1, y:0, range:1},
                {x:0, y:-1, range:1},
                {x:0, y:1, range:1},
                {x:-1, y:-1, range:1},
                {x:1, y:1, range:1},
                {x:1, y:-1, range:1},
                {x:-1, y:1, range:1},
            ],
            "knight": [
                {x:-2, y:-1, range:1},
                {x:-2, y:1, range:1},
                {x:-1, y:-2, range:1},
                {x:-1, y:2, range:1},
                {x:1, y:2, range:1},
                {x:1, y:-2, range:1},
                {x:2, y:1, range:1},
                {x:2, y:-1, range:1},
            ]
        };

        /* Check movement */
        actions[unit.unitData.pattern.move].forEach(single_position => {
            for (var r=1; r<=single_position.range; r++) {
                var isValid = true;

                var newX = unit.gridX + (single_position.x * r);
                var newY = unit.gridY + (single_position.y * r);

                /* Out of bounds of the map */
                if (newX >= this.gridWidth || newX < 0 || newY >= this.gridHeight || newY < 0) {
                    isValid = false;
                }

                /* Check if a unit is present */
                if (isValid) {
                    this.units.getChildren().forEach(single_unit => {
                        if (single_unit.gridX == newX && single_unit.gridY == newY) {
                            isValid = false;
                        }
                    }, this);
                }

                /* If it's not valid, stop trying further with ranges */
                if (!isValid) {
                    break;
                }

                console.log(unit.unitData.id);

                var tile = new Unit(this.scene, unit.unitData.id);
                tile.gridX = unit.gridX;
                tile.gridY = unit.gridY;
                tile.create();
                this.moveUnitTo(tile, newX, newY);
                tile.actionType = "move";
                tile.alpha = 0.3;

                this.add(tile);
                this.actions.add(tile);
            }
        }, this);

        /* Check attack */
        actions[unit.unitData.pattern.move].forEach(single_position => {
            for (var r=1; r<=single_position.range; r++) {
                var isValid = true;

                var newX = unit.gridX + (single_position.x * r);
                var newY = unit.gridY + (single_position.y * r);

                /* Out of bounds of the map */
                if (newX >= this.gridWidth || newX < 0 || newY >= this.gridHeight || newY < 0) {
                    isValid = false;
                }

                /* If it's not valid, stop trying further with ranges */
                if (!isValid) {
                    break;
                }

                /* Check if a unit is present */
                this.units.getChildren().forEach(single_unit => {
                    if (single_unit.gridX == newX && single_unit.gridY == newY) {
                        var tile = this.scene.add.sprite(0, 0, "tileset:effectsLarge", 10);
                        tile.anims.play("attack");
                        tile.actionType = "attack";
                        //tile.setScale(this.pixelScale);
                        tile.setOrigin(0, 0);
                        tile.x = (48 * newX);
                        tile.y = (48 * newY);
                        //tile.alpha = 0.5;
                        tile.gridX = newX;
                        tile.gridY = newY;

                        this.add(tile);
                        this.actions.add(tile);
                    }
                }, this);
            }
        }, this);
    }

    clearActions() {
        console.log("Position: " + this.actions.getChildren().length);
        this.actions.clear(true, true);
        console.log("After: " + this.actions.getChildren().length);
    }

    /* Events */

    backgroundClicked(pointer) {
        console.log("backgroundClicked");

        var touchX = pointer.x - this.x;
        var touchY = pointer.y - this.y;

        var unitSize = 24 * this.pixelScale;

        var gridX = Math.floor(touchX / unitSize);
        var gridY = Math.floor(touchY / unitSize);

        //console.log("backgroundClicked -> " + gridX + "x" + gridY + " | actions: " + this.actions.getChildren().length);

        this.actions.getChildren().forEach(single_action => {
            if (single_action.gridX == gridX && single_action.gridY == gridY) {
                this.emit('actionClicked', single_action, gridX, gridY);
                return;
            }
        }, this);

        this.units.getChildren().forEach(single_unit => {
            console.log(gridX+"x"+gridY + " == " + single_unit.gridX + "x" + single_unit.gridY);
            if (single_unit.gridX == gridX && single_unit.gridY == gridY) {
                this.emit('unitClicked', single_unit, gridX, gridY);
                return;
            }
        }, this);
    }


};
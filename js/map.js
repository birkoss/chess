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

        this.scene.anims.create({
            key: "move",
            frames:this.scene.anims.generateFrameNumbers('tileset:effectsSmall', { frames: [2, 3, 4, 3] }),
            frameRate: 6,
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

        let unit = new Unit(this.scene, "knight", 0);
        unit.create();
        unit.face(1);

        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 6, 0);


        unit = new Unit(this.scene, "rogue", 0);
        unit.create();
        unit.face(1);

        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 0, 3);

        unit = new Unit(this.scene, "archer", 0);
        unit.create();
        unit.face(1);
        this.add(unit);
        this.units.add(unit);
    
        this.moveUnitTo(unit, 0, 2);

        for (var i=0; i<5; i++) {
            unit = new Unit(this.scene, "skeleton", 1)
            unit.create();

            this.add(unit);
            this.units.add(unit);
        
            this.moveUnitTo(unit, 7, i);
        }
        
    }

    deleteUnitAt(x, y) {
        this.units.getChildren().forEach(single_unit => {
            if (single_unit.gridX == x && single_unit.gridY == y) {
                single_unit.destroy(true);
            }
        }, this);
    }

    moveUnitTo(unit, x, y) {
        unit.x = (x * (unit.getBounds().width)) + unit.getBounds().width / 2;
        unit.y = (y * (unit.getBounds().height)) + unit.getBounds().height / 2;

        if (unit.gridX != x) {
            unit.face(unit.gridX < x ? 1 : -1);
        }

        unit.gridX = x;
        unit.gridY = y;
    }

    generateActions(unit) {
        console.log("generateActions -> " + unit.gridX + "x" + unit.gridY);

        var actionsList = {
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

        var actions = [];

        /* Check movement */
        actionsList[unit.unitData.pattern.move].forEach(single_position => {
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

                actions.push({
                    "type": "move",
                    "x": newX,
                    "y": newY,
                    "points": 0
                });
            }
        }, this);

        /* Check attack */
        actionsList[unit.unitData.pattern.move].forEach(single_position => {
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
                        if (single_unit.player != unit.player) {
                            actions.push({
                                "type": "attack",
                                "x": newX,
                                "y": newY,
                                "points": single_unit.unitData.points
                            });
                        }
                    }
                }, this);
            }
        }, this);

        return actions;
    }

    createActions(unit) {
        console.log("createActions -> " + unit.gridX + "x" + unit.gridY);

        let actions = this.generateActions(unit);

        actions.forEach(single_action => {
            var spriteSheet = "tileset:effectsSmall";
            if (single_action.type == "attack") {
                spriteSheet = "tileset:effectsLarge";
            }
            var tile = this.scene.add.sprite(0, 0, spriteSheet);
            tile.anims.play(single_action.type);

            tile.gridX = single_action.x;
            tile.gridY = single_action.y;

            tile.setOrigin(0, 0);
            tile.x = (48 * single_action.x);
            tile.y = (48 * single_action.y);

            
            tile.actionType = single_action.type;

            this.add(tile);
            this.actions.add(tile);
        });
    }

    clearActions() {
        this.actions.clear(true, true);
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

        var custom_event = {
            "name": "",
            "target": null,
            "x": -1,
            "y": -1
        };

        this.actions.getChildren().forEach(single_action => {
            if (single_action.gridX == gridX && single_action.gridY == gridY) {
                if (custom_event.name == "") {
                    custom_event.name = "actionClicked";
                    custom_event.target = single_action;
                    custom_event.x = gridX;
                    custom_event.y = gridY;
                }
            }
        }, this);

        this.units.getChildren().forEach(single_unit => {
            if (single_unit.gridX == gridX && single_unit.gridY == gridY) {
                if (custom_event.name == "") {
                    custom_event.name = "unitClicked";
                    custom_event.target = single_unit;
                    custom_event.x = gridX;
                    custom_event.y = gridY;
                }
            }
        }, this);

        if (custom_event.name != "") {
            this.emit(custom_event.name, custom_event.target, custom_event.x, custom_event.y);
        }
    }


};
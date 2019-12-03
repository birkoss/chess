class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });

        this.currentUnit = null;
    }

    create() {
        this.map = new Map(this, 0, 0);
        this.map.create();

        this.map.x = (this.sys.game.canvas.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;

        this.startTurn();
    }

    startTurn() {
        this.map.off("actionClicked", this.actionClicked, this);
        this.map.on("unitClicked", this.unitClicked, this);
    }

    enableUnit(unit) {
        console.log("enableUnit");
        console.log(unit);

        this.currentUnit = unit;

        this.currentUnit.activate();

        this.map.createActions(unit);
        this.map.on("unitClicked", this.unitClicked, this);
        this.map.on("actionClicked", this.actionClicked, this);
    }

    disableUnit(unit) {
        this.map.off("actionClicked", this.actionClicked, this);

        console.log("disableUnit");
        console.log(unit);
        if (unit != null) {
            unit.deactivate();

            this.currentUnit = null;
        }
        this.map.clearActions();

        //this.map.on("unitClicked", this.unitClicked, this);
    }

    /* Events */
 
    unitClicked(unit, x, y) {
        console.log("unitClicked");
        this.map.off("unitClicked", this.unitClicked, this);

        if (unit == this.currentUnit) {
            this.disableUnit(this.currentUnit);
            this.startTurn();
        } else {
            this.disableUnit(this.currentUnit);
            this.enableUnit(unit);
        }
    }

    actionClicked(action, x, y) {
        console.log("actionClicked");
        console.log(x, y);

        if (action.actionType == "move") {
            this.map.moveUnitTo(this.currentUnit, x, y);            
        } else {
            this.map.deleteUnitAt(x, y);
            this.map.moveUnitTo(this.currentUnit, x, y);
        }

        this.disableUnit(this.currentUnit);
        this.startTurn();
    }



};
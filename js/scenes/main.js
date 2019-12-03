class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'MainScene'
        });

        this.currentUnit = null;
    }

    create() {
        this.players = [{
            "ai": -1,
        },{
            "ai": -1,
        }];

        this.map = new Map(this, 0, 0);
        this.map.create();

        this.map.x = (this.sys.game.canvas.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;

        this.currentPlayer = 0;
        this.startTurn();
    }

    startTurn() {
        console.warn("startTurn : " + (this.players[this.currentPlayer].ai == -1 ? "PLAYER" : "CPU"));
        /* Remove all events */
        this.map.off("actionClicked", this.selectAction, this);
        this.map.off("unitClicked", this.unitClicked, this);

        if (this.players[this.currentPlayer].ai == -1) {
            console.log("Waiting for player. Enable unit click...");
            this.map.on("unitClicked", this.unitClicked, this);
        } else {
            /* Pick an unit */
            let units = this.map.units.getChildren().filter(single_unit => single_unit.player == this.currentPlayer);
            this.selectUnit(units[0]);

            /* Pick an actions */
            let actions = this.map.actions.getChildren();
            this.selectAction(actions[0], actions[0].gridX, actions[0].gridY);
        }
    }

    endTurn() {
        console.log("endTurn");
        this.currentPlayer++;
        if (this.currentPlayer >= this.players.length) {
            this.currentPlayer = 0;
        }

        this.startTurn();
    }

    selectUnit(unit) {
        console.log("enableUnit");

        this.currentUnit = unit;

        this.currentUnit.activate();

        this.map.createActions(unit);
        this.map.on("actionClicked", this.selectAction, this);
    }

    disableUnit(unit) {
        if (unit != null) {
            unit.deactivate();
            this.currentUnit = unit;
        }

        /* Always clear actions (and events) */
        this.map.off("actionClicked", this.selectAction, this);
        this.map.clearActions();
    }

    /* Events */
 
    unitClicked(unit, x, y) {
        console.log("unitClicked");

        if (unit == this.currentUnit) {
            this.disableUnit(this.currentUnit);
            this.startTurn();
        } else {
            this.disableUnit(this.currentUnit);
            this.selectUnit(unit);
        }
    }

    selectAction(action, x, y) {
        console.log("selectAction");

        if (action.actionType == "move") {
            this.map.moveUnitTo(this.currentUnit, x, y);            
        } else {
            this.map.deleteUnitAt(x, y);
            this.map.moveUnitTo(this.currentUnit, x, y);
        }

        this.disableUnit(this.currentUnit);
        
        this.endTurn();
    }



};
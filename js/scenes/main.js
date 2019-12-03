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
            "ai": 1,
        }];

        this.map = new Map(this, 0, 0);
        this.map.create();

        this.map.x = (this.sys.game.canvas.width - this.map.getBounds().width) / 2;
        this.map.y = this.map.x;

        this.currentPlayer = 0;
        this.startTurn();
    }

    calculateBestMoves() {
        // Get all the possible moves
        let units = this.map.units.getChildren().filter(single_unit => single_unit.player == 1);

        var action = {
            "type": "idle",
            "points": -1,
            "unit": null,
        }

        units.forEach(single_unit => {
            let actions = this.map.generateActions(single_unit);

            actions.forEach(single_action => {
                if (action.points < single_action.points) {
                    action = single_action;
                    action.unit = single_unit;
                }
            });
        });

        return action;
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
            let action = this.calculateBestMoves();

            this.selectUnit(action.unit);
            this.selectAction(action.type, action.x, action.y);
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
        }

        this.currentUnit = null;

        /* Always clear actions (and events) */
        this.map.off("actionClicked", this.selectAction, this);
        this.map.clearActions();
    }

    /* Events */
 
    /* @TODO Do something different when we select the other player unit */
    unitClicked(unit, x, y) {
        console.log("unitClicked");

        if (unit == this.currentUnit) {
            this.disableUnit(this.currentUnit);
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
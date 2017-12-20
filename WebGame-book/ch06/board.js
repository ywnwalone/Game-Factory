class Board {
    constructor($board, options) {
        this.board = $board;
        this.openSlot = {};
        this.tiles = [];
        this.options = options;
        this.initTiles();
    }

    initTiles() {
        for (let i = 0; i < this.options.gameSize; i++) {
            this.tiles.push(new Tile(i, this, this.options));
        }
        this.tiles.push(null);
        this.setOptionSlot(15);
    }

    setOpenSlot(i) {
        this.openSlot = {
            position: i,
            row: ~~(i / 4),
            col: i % 4
        };
    }
}
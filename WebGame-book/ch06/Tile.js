class Tile {
    constructor(position, board, options) {
        this.position = position;
        this.options = options;
        this.el = '<div></div>';
        this.board = board;
        this.templates = {
            tile: (no) => {
                const top = ~~(no / 4) * -this.options.tileSize;
                const left = no % 4 * -this.options.tileSize;

                return (
                    `
                    <div class="tile" data-position="${no}">
                        <img src="./img/onepiece.jpg" draggable="false" style="top: ${top}px; left: ${left}px;" />
                    </div>
                    `
                )
            }
        }
    }

}
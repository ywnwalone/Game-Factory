// 1. 사용할 이미지 URL을 배열로 저장
const IMAGE_URL = [
    './img/block.png',
    './img/green.png',
    './img/lightblue.png',
    './img/blue.png',
    './img/pink.png',
    './img/purple.png',
    './img/gray.png'
];
const SHAPE = {
    I: [
        [1, 1, 1, 1]
    ],
    J: [
        [1, 1, 1],
        [0, 0, 1]
    ],
    L: [
        [1, 1, 1],
        [1, 0, 0]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ]
};
const randomProperty = function(obj) {
    let keys = Object.keys(obj),
        randomKeyIndex = Math.floor(keys.length * Math.random());

    return obj[keys[randomKeyIndex]];
}

class Tetris {
    constructor(options) {
        this.canvas = options.canvas;
        this.context = this.canvas.getContext('2d');

        this.rows = 20; //행 개수
        this.cols = 10; //열 개수
        this.board = []; //게임 화면을 2d array로 구현
        this.requestId = 0; //requestAnimationFrame()의 ID값

        this.blockSize = {
            w: 0,
            h: 0,
        };
        this.tickSize = 500;
        this.prevTick = Date.now();
        this.controlButtons = [];

        // this.blockImage = new Image();
        // this.blockImage.src = './img/block.png';
        //this.blockImage.onload = () => this.init();

        this.animations = [];
        this.animationImageUrl = './img/animation.png';
        this.loadImages(this.animationImageUrl);

        this.blockImages = [];

        this.init();
    }
    loadImages(images, callback) {
        let loader = new ImageLoader(images);
        loader.done(callback);
        loader.load();
    }
    init() {
        // 2. 이미지들을 로딩하고, 기존의 initializing 로직을 콜백 안으로 이동시킨다.
        this.loadImages(IMAGE_URL, () => {
            // 3. 이미지마다 Image객체를 생성하고 src 속성을 지정
            for (let url of IMAGE_URL) {
                let image = new Image();
                image.src = url;
                this.blockImages.push(image);
            }

            this.makeNewBlock(0, this.cols / 2);
            this.addKeyControl();

            let rowsArray = Array(this.rows).fill();
            this.board = rowsArray.map(() => Array(this.cols).fill(0));

            this.requestId = requestAnimationFrame(this.loop.bind(this));
        });
    }
    eeinit() {
        requestAnimationFrame(this.loop.bind(this));
        //2d 배열을 모두 0으로 초기화함

        let rowsArray = Array(this.rows).fill();
        this.board = rowsArray.map(() => Array(this.cols).fill(0));

        this.blockSize = {
            w: this.canvas.width / this.cols,
            h: this.canvas.height / this.rows
        };

        // //board 배열을 정해진 rows * cols에 맞도록 초기화하고, 값을 0으로 채워 넣음
        // let rowsArray = Array(this.rows).fill();
        // this.board = rowsArray.map(()=>Array(this.cols).fill(0));

        //새 블록을 보드 최상단 중간지점에 생성
        this.makeNewBlock(0, this.cols / 2);
        this.addKeyControl();

        this.resizeCanvas();
        this.addControlButtons();
    }
    loop() {
        //console.log('We are in the loop()...');
        let now = Date.now();

        if (now - this.prevTick > this.tickSize) {
            this.moveBlock(1, 0);
            this.prevTick = now;
            //블록이 더 이동 가능한 지 확인 후, 불가능하다면 보드에 새로운 블록을 추가시킨다.
            if (!this.isMovable({ row: 1, col: 0 })) {
                this.addBlockToBoard();
                this.makeNewBlock(0, this.cols / 2);
            }
        }
        this.removeCompleteRow();

        for (let animation of this.animations) {
            animation.update();
        }
        this.render();
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }
    render() {
        let color,
            blockSize = {
                w: this.canvas.width / this.cols,
                h: this.canvas.height / this.rows
            };
        this.context.fillStyle = "#000";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let [row, rowArray] of this.board.entries()) {
            for (let [col, cell] of rowArray.entries()) {
                if (cell > 0) {
                    //this.context.fillStyle = "red";
                    //this.context.fillRect(col * blockSize.w, row * blockSize.h, blockSize.w, blockSize.h);


                    let image = this.blockImages[cell - 1];
                    this.context.drawImage(image, col * blockSize.w, row * blockSize.h, blockSize.w, blockSize.h);
                }
            }
        }

        //1. 블록 렌더링
        for (let [row, rowArray] of this.block.shape.entries()) {
            for (let [col, cell] of rowArray.entries()) {
                if (cell > 0) {
                    //this.context.fillStyle = "red";
                    //this.context.fillRect((this.block.position.col + col) * blockSize.w, (this.block.position.row + row) * blockSize.h, blockSize.w, blockSize.h);
                    let image = this.blockImages[this.block.color - 1];
                    this.context.drawImage(image, (this.block.position.col + col) * blockSize.w, (this.block.position.row + row) * blockSize.h, blockSize.w, blockSize.h);
                }
            }
        }

        for (let button of this.controlButtons) {
            button.render();
        }
        for (let animation of this.animations) {
            animation.render(this.context);
        }
    }

    makeNewBlock(row, col) {
        //1. 랜덤한 모양을 선택한다.
        let randomShape = randomProperty(SHAPE);
        let randomColor = Math.floor(Math.random() * IMAGE_URL.length) + 1;

        this.block = {
            shape: randomShape,
            //2. 블록의 좌측 위 좌표를 지정
            color: randomColor,
            position: {
                row: row,
                col: Math.ceil(col - randomShape[0].length / 2)
            },
            rows: randomShape.length,
            cols: randomShape[0].length
        };
    }

    moveBlock(row, col) {
        // 이동시키기 전 이동하려는 좌표의 유효성 확인
        if (!this.isMovable({ row, col })) {
            return;
        }
        this.block.position.row += row;
        this.block.position.col += col;
    }

    isMovable(offset) {
        let block = this.block,
            newBlockPosition = {
                row: block.position.row + offset.row,
                col: block.position.col + offset.col
            },
            row, col,
            isOverlap, isOutOfBoundary;


        // 1. 각 열의 가장 아래 칸만 확인하던 로직을 수정하여 블록의 모든 칸을 체크
        for (let row = 0; row < block.rows; row++) {
            for (let col = 0; col < block.cols; col++) {
                // 2. 화면을 벗어나는지 확인
                let isOutOfBoundary = !this.blockIsWithinBoundary(offset);

                // 3. 다른 블록과 겹치는지 확인
                let isOverlap = !isOutOfBoundary &&
                    block.shape[row][col] > 0 &&
                    this.board[newBlockPosition.row + row][newBlockPosition.col + col] > 0;

                // 2나 3 둘 중 하나라도 해당하면 false를 리턴함.
                if (isOutOfBoundary || isOverlap) {
                    return false;
                }
            }
        }
        return true;
    }
    addBlockToBoard() {
        for (let row = 0; row < this.block.rows; row++) {
            for (let col = 0; col < this.block.cols; col++) {
                if (this.block.shape[row][col] > 0) {
                    this.board[this.block.position.row + row][this.block.position.col + col] = this.block.color;
                }
            }
        }
    }
    addKeyControl() {
        document.body.addEventListener('keydown', e => {
            switch (e.keyCode) {
                case 37:
                    e.preventDefault();
                    this.moveBlock(0, -1);
                    break;
                case 38:
                    e.preventDefault();
                    this.rotateBlock();
                    break;
                case 39:
                    e.preventDefault();
                    this.moveBlock(0, 1);
                    break;
                case 40:
                    e.preventDefault();
                    this.moveBlock(1, 0);
                    break;
                default:
                    break;
            }
        });
    }
    blockIsWithinBoundary(offset) {
        let tempPosition = {
            row: this.block.position.row + offset.row,
            col: this.block.position.col + offset.col
        };

        return tempPosition.row >= 0 &&
            tempPosition.col >= 0 &&
            tempPosition.row + this.block.rows <= this.rows &&
            tempPosition.col + this.block.cols <= this.cols;
    }
    rotateBlock() {
        let newShape = [],
            oldCols = this.block.cols,
            oldRows = this.block.rows,
            oldShape = this.block.shape;

        // 1. 회전 후에는 원래의 가로 * 세로 사이즈가 서로 뒤바뀌기 때문에 새로운 사이즈의 shape 배열을 생성
        for (let row = 0; row < oldCols; row++) {
            newShape.push([]);
        }

        for (let row = 0; row < oldCols; row++) {
            for (let col = 0; col < oldRows; col++) {
                // 2. 회전 로직은 새 배열의 (row, col) 좌표에 원래 배열의 (col 역순, row)값을 넣음
                newShape[row][col] = this.block.shape[oldRows - 1 - col][row];
            }
        }

        // 3. 새 shape 배열과 행 수, 열 수를 블록에 저장
        this.block.shape = newShape;
        this.block.rows = oldCols;
        this.block.cols = oldRows;

        // 4. 만약 회전시킨 블록이 화면 밖으로 벗어나거나 다른 블록과 겹치면 원래대로 되돌림
        if (!this.isMovable({ row: 0, col: 0 })) {
            this.block.shape = oldShape;
            this.block.rows = oldRows;
            this.block.cols = oldCols;
        }
    }
    removeCompleteRow() {
        let removeRow = (rowIndex) => {
                this.board.splice(rowIndex, 1);
                this.board.splice(0, 0, Array(this.cols).fill(0));
            },
            rowIndex = -1,
            blockSize = {
                w: this.canvas.width / this.cols,
                h: this.canvas.height / this.rows
            };

        for (let row = 0; row < this.rows; row++) {
            // 1. Array.every 메소드를 활용해, 행의 모든 값이 1 이상인지 확인
            if (this.board[row].every(value => value > 0)) {

                //Animation 객체를 생성
                for (let col = 0; col < this.cols; col++) {
                    let animation = new Animation({
                        x: col * blockSize.w,
                        y: row * blockSize.h,
                        width: blockSize.w,
                        height: blockSize.h,
                        frameWidth: 128,
                        frameHeight: 128,
                        frames: 10,
                        image: this.animationImageUrl,
                        interval: 30
                    });
                    // 4. Animation 객체를 저장하고, 재생
                    this.animations.push(animation);
                    animation.start();

                    if (col === this.cols - 1) {
                        animation.done(() => {
                            removeRow(row);
                            this.animations = [];
                        });
                    }
                    this.board[row] = Array(this.cols).fill(0);
                }

                // // 2. Array.splice를 사용해 완성된 행을 삭제
                // this.board.splice(row, 1);

                // // 3. 다시 한 번 Array.splice를 사용해 보드의 제일 위에 빈 행을 추가
                // this.board.splice(0, 0, Array(this.cols).fill(0));
            }
        }
    }

    resizeCanvas() {
        let ratio = this.cols / (this.rows + 2),
            windowWidth = window.innerWidth,
            windowHeight = window.innerHeight,
            windowRatio = windowWidth / windowHeight,
            scaledWidth = 0,
            scaledHeight = 0;

        if (ratio < windowRatio) {
            //  가로를 똑같이 1로 놓았을 때, 분모인 세로 길이가 window쪽이 더 짧다는 의미이므로,
            //  windowHeight를 기준으로 가로의 길이를 계산해서 캔버스를 조정한다.
            //  세로로 여백이 발생한다.
            scaledHeight = windowHeight;
            scaledWidth = windowHeight * ratio;
        } else {
            //  가로를 똑같이 1로 놓았을 때, 분자인 가로 길이가 window쪽이 더 짧다는 의미이므로,
            //  windowwidth를 기준으로 가로의 길이를 계산해서 캔버스를 조정한다.
            //  가로로 여백이 발생한다.
            scaledWidth = windowWidth;
            scaledHeight = windowWidth / ratio;
        }
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;

        //  2. 블록 사이즈와 버튼 사이즈를 계산한다.
        this.blockSize = {
            w: this.canvas.width / this.cols,
            h: this.canvas.height / (this.rows + 2)
        };
        this.buttonSize = {
            w: this.blockSize.w * 2.5,
            h: this.blockSize.h * 2
        }
    }
    addControlButtons() {
        let buttonSizes = this.buttonSize,
            leftButton = new Button({
                x: 0,
                y: this.blockSize.h * 20,
                width: buttonSizes.w,
                height: buttonSizes.h,
                text: 'L',
                canvas: this.canvas
            }),
            downButton = new Button({
                x: buttonSizes.w,
                y: this.blockSize.h * 20,
                width: buttonSizes.w,
                height: buttonSizes.h,
                text: 'D',
                canvas: this.canvas
            }),
            rotateButton = new Button({
                x: buttonSizes.w * 2,
                y: this.blockSize.h * 20,
                width: buttonSizes.w,
                height: buttonSizes.h,
                text: 'U',
                canvas: this.canvas
            }),
            rightButton = new Button({
                x: buttonSizes.w * 3,
                y: this.blockSize.h * 20,
                width: buttonSizes.w,
                height: buttonSizes.h,
                text: 'R',
                canvas: this.canvas
            });

        leftButton.onTouchend(() => {
            this.moveBlock(0, -1);
        });
        rightButton.onTouchend(() => {
            this.moveBlock(0, 1);
        });
        rotateButton.onTouchend(() => {
            this.rotateBlock();
        });
        downButton.onTouchend(() => {
            this.moveBlock(1, 0);
        });

        this.controlButtons.push(leftButton);
        this.controlButtons.push(rightButton);
        this.controlButtons.push(rotateButton);
        this.controlButtons.push(downButton);
    }
}

class Button {
    constructor(props) {
        this._callback = () => {};
        this.x = props.x || 0;
        this.y = props.y || 0;
        this.width = props.width || 0;
        this.height = props.height || 0;
        this.text = props.text || '';
        this.canvas = props.canvas;
        this.context = this.canvas.getContext('2d');


        this.init();
    }
    init() {
        this.canvas.addEventListener('touchend', (e) => {
            const touchX = e.changedTouches[0].clientX,
                touchY = e.changedTouches[0].clientY;

            if (touchX > this.x && touchX < this.x + this.width && touchY > this.y && touchY < this.y + this.height) {
                this._callback();
            }
        });

    }

    render(context) {
        this.context.fillStyle = '#333';
        this.context.fillRect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = '#fff';
        this.context.font = 'italic 200 48px/2 Helvetica';
        this.context.textBaseline = 'top';
        this.context.fillText(this.text, this.x, this.y);


    }



    onTouchend(callback) {
        this._callback = callback;
    }

    off() {
        this._callback = () => {};
    }

}
const SHAPE ={
    I: [[1, 1, 1, 1]],
    J: [[1, 1, 1], [0, 0, 1]],
    L: [[1, 1, 1], [1, 0, 0]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[1, 1, 1], [0, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]]
};
const randomProperty = function(obj){
    let keys = Object.keys(obj),
        randomKeyIndex = Math.floor(keys.length * Math.random());
    
    return obj[keys[randomKeyIndex]];
}

class Tetris {
    constructor(options){
        this.canvas = options.canvas;
        this.context = this.canvas.getContext('2d');

        this.rows = 20;     //행 개수
        this.cols = 10;     //열 개수
        this.board = [];    //게임 화면을 2d array로 구현
        this.requestId = 0; //requestAnimationFrame()의 ID값

        this.blockSize = {
            w: 0,
            h: 0,
        };

        this.init();
    }
    init(){
        requestAnimationFrame(this.loop.bind(this));
        //2d 배열을 모두 0으로 초기화함

        let rowsArray = Array(this.rows).fill();
        this.board = rowsArray.map(()=>Array(this.cols).fill(0));

        this.blockSize = {
            w: this.canvas.width / this.cols,
            h: this.canvas.height / this.rows
        };

        // //board 배열을 정해진 rows * cols에 맞도록 초기화하고, 값을 0으로 채워 넣음
        // let rowsArray = Array(this.rows).fill();
        // this.board = rowsArray.map(()=>Array(this.cols).fill(0));

        //새 블록을 보드 최상단 중간지점에 생성
        this.makeNewBlock(0, this.cols/2);
    }
    loop(){
        console.log('We are in the loop()...');
        this.render();
        this.requestId = requestAnimationFrame(this.loop.bind(this));
    }
    render(){
        let color,
            blockSize = {
                w: this.canvas.width / this.cols,
                h: this.canvas.height / this.rows
            };
        this.context.fillStyle = "#000";
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height);

        for(let [row, rowArray] of this.board.entries()){
            for(let [col, cell] of rowArray.entries()){
                if(cell > 0){
                    this.context.fillStyle = "red";
                    this.context.fillRect(col*blockSize.w, row*blockSize.h, blockSize.w, blockSize.h);
                }
            }
        }
        
        //1. 블록 렌더링
        for(let [row, rowArray] of this.block.shape.entries()){
            for(let [col, cell] of rowArray.entries()){
                if(cell > 0){
                    this.context.fillStyle = "red";
                    this.context.fillRect((this.block.position.col + col) * blockSize.w, (this.block.position.row + row) * blockSize.h, blockSize.w, blockSize.h);
                }
            }
        }
    }

    makeNewBlock(row, col){
        //1. 랜덤한 모양을 선택한다.
        let randomShape = randomProperty(SHAPE);

        this.block = {
            shape: randomShape,
            //2. 블록의 좌측 위 좌표를 지정
            position: {row, col},
            rows: randomShape.length,
            cols: randomShape[0].length
        };
    }
}
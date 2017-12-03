const STATUS = {
    PENDING: 1,
    RUNNING: 2,
    STOPPED: 3
};

class Animation {
    constructor(option) {
        this.imageUrl = option.image;
        //애니메이션이 그려질 위치
        this.position = {
            x: option.x,
            y: option.y
        };
        //그려질 애니메이션 사이즈
        this.size = {
            width: option.width,
            height: option.height
        };
        //소스 이미지에서 한 프레임의 사이즈
        this.frameSize = {
            width: option.frameWidth,
            height: option.frameHeight
        };
        //소스 이미지의 총 프레임 수
        this.frames = option.frames;

        //반복 여부
        this.loop = option.loop || false;

        //프레임 간의 인터벌
        this.interval = option.interval || 100;

        this._currentFrame = 0;
        this._image = new Image();
        this._image.src = this.imageUrl;
        this._lastUpdate = 0;
        this._status = STATUS.PENDDING;
        this._callback = function() {};
    }
    start() {
        this._lastUpdate = Date.now();
        this.status = STATUS.RUNNING;
    }
    update() {
        // 1. 애니메이션을 플레이하는 중이 아니라면 업데이트 하지 않는다.
        if (this.status !== STATUS.RUNNING) {
            return;
        }

        // 2. 현재 시간이 이전 업데이트 시간보다 interval에 지정된 시간 이상 흘렀을 경우, 다음 프레임으로 넘긴다.
        //  다음 프레임이 없고, 반복 옵션이 false라면 종료한다.
        let now = Date.now();
        if (now - this._lastUpdate >= this.interval) {
            this._currentFrame++;

            if (this._currentFrame >= this.frames) {
                this._currentFrame = this.loop ? 0 : -1;
            }
            this._lastUpdate = now;
        }
        if (this._currentFrame === -1) {
            this._stop();
        }
    }
    _stop() {
        this.status = STATUS.STOPPED;
        this._callback();
    }
    done(callback) {
        this._callback = callback;
    }

    render(context) {
        // 3. 애니메이션을 플레이하는 중이 아니라면 그리지 않는다.
        if (this.status !== STATUS.RUNNING) {
            return;
        }

        // 4. 스프라이트 이미지를 활용하여 애니메이션 프레임을 그린다.
        let sx = this.frameSize.width * this._currentFrame,
            sy = 0,
            sw = this.frameSize.width,
            sh = this.frameSize.height,
            dx = this.position.x,
            dy = this.position.y,
            dw = this.size.width,
            dh = this.size.height;

        context.drawImage(this._image, sx, sy, sw, sh, dx, dy, dw, dh);
    }
}
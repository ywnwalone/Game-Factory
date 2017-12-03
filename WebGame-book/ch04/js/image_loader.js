class ImageLoader {
    constructor(imageUrl) {
        this.imageUrls = [];
        this.assets = [];
        this.loading = false;

        this.addImage(imageUrl);
    }

    addImage(imageUrl) {
        // 1. 이미 로딩 중일 경우 추가하지 않는다.
        if (this.loading) {
            console.log('loader cannot add more images while it is loading.');
            return;
        }

        // 2. 인자가 배열 형태일 경우 concat하여 합치고, 단일 string일 경우 push해서 추가
        if (Array.isArray(imageUrl)) {
            this.imageUrls = this.imageUrls.concat(imageUrl);
        } else {
            this.imageUrls.push(imageUrl);
        }
    }
    load() {
        // 3. 추가된 모든 이미지 URL마다 Image 객체를 생성하고, onload 콜백과 src를 등록
        this.assets = this.imageUrls.map((url) => {
            let image = new Image();
            image.onload = () => this.onload(image);
            image.src = url;

            return image;
        });
    }
    done(callback) {
        // 4. 로딩이 완료된 후 호출될 콜백 함수를 등록
        this.callback = callback;
    }
    onload(image) {
        // 5. 로딩된 이미지에는 loaded flag를 추가하고
        image.loaded = true;

        // 6. 모든 이미지가 loaded == true일 경우 완료 콜백을 실행
        if (this.assets.every((image) => image.loaded)) {
            this.callback();
            this.loading = false;
        }
    }
}
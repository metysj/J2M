export class Worker {
    constructor() {
        this.replace_map = {};
    }

    handleReplaceMap(str) {
        Object.keys(this.replace_map).forEach(key => {
            str = str.replace(key, this.replace_map[key]);
        });
        return str;
    }
}
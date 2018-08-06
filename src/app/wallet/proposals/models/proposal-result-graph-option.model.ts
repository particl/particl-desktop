export class GraphOption {
    option: string;
    voters: number;
    constructor(obj: any) {
        this.option = obj.option;
        this.voters = obj.voters;
    }
}

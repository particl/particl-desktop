export class GraphOption {
    description: string;
    voters: number;
    constructor(obj: any) {
        this.description = obj.description;
        this.voters = obj.voters;
    }
}

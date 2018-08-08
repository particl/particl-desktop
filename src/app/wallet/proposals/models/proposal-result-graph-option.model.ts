export class GraphOption {
    description: string;
    voters: number;
    optionId: number;
    constructor(object: any) {
        this.description = object.description;
        this.voters = object.voters;
        this.optionId = object.optionId;
    }
}

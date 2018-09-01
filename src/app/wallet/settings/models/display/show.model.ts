export class Show {
        sentTo: boolean;
        receivedWith: boolean;
        receivedFrom: boolean;
        selfPayment: boolean;
        partReceived: boolean;
        partSent: boolean;
        other: boolean;
        constructor(obj: any) {
            this.sentTo = obj.sentTo;
            this.receivedWith = obj.receivedWith;
            this.receivedFrom = obj.receivedFrom;
            this.selfPayment = obj.selfPayment;
            this.partReceived = obj.partReceived;
            this.partSent = obj.partSent;
            this.other = obj.other;
        }
}

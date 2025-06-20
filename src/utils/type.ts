export enum PrizeType {
    book = 'BOOK',
    coupon = 'COUPON',
    credit = 'CREDIT',
    blindbox = 'BLIND_BOX',
}

export type PrizeStatus = 'AVAILABLE' | 'GENERATED'

export type Recipient = {
    name: string;
    telephone: string;
    location: string;
}

export type DrawRequest = {
    quantity: number;
}
declare type Callback = () => void;
export declare type CancelSignal = (callback: Callback) => void;
export declare const makeCancelSignal: () => {
    cancelSignal: CancelSignal;
    cancel: () => void;
};
export {};

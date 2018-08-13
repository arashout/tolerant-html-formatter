export { }; // Fixes compile error
declare global {
    type Primitive = string | number | boolean;
    type Maybe<T> = T | void;
    interface Dictionary<T> {
        [key: string]: T;
    }
}
export { }; // Fixes compile error
declare global {
    type Primitive = string | number | boolean;
    interface Dictionary<T> {
        [key: string]: T;
    }
}
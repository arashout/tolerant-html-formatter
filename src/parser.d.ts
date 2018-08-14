declare namespace parser {
    interface Node {
        type: string;
        name: string;
        raw: string;
        data: string;
        children?: Node
        attribs?: Dictionary<string>
        startIndex?: number;
        endIndex?: number;
    }
}
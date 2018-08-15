import { CommentNode } from "../ast";
import { RuleTypes, CommentRule, indentString } from "./rules";

export const commentRules: CommentRule[] = [
    {
        type: RuleTypes.COMMENT_RULE,
        name: 'commentSameLine',
        shouldApply: (_: CommentNode): boolean => true,
        apply: (cn: CommentNode, indent: number): string => {
            // Trim leading/trailing white space and add our own
            return indentString(`<!-- ${cn.value.trim()} -->\n`, indent);
        },
    },
];
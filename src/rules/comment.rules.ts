import { CommentNode } from "../ast";
import { RuleTypes, CommentRule } from "./rules";

export const commentRules: CommentRule[] = [
    {
        type: RuleTypes.COMMENT_RULE,
        name: 'commentSameLine',
        shouldApply: (_: CommentNode): boolean => true,
        apply: (cn: CommentNode, ___: number): string => {
            return cn.value;
        },
        
    },
];
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Babel plugin to protect against infinite loops
 * Injects a time check into every loop to prevent browser freezing
 */
export const loopProtectionPlugin = (timeout = 2000) => {
    return ({ types: t }: any): any => {
        return {
            visitor: {
                "WhileStatement|DoWhileStatement|ForStatement|ForInStatement|ForOfStatement"(path: any) {
                    // Generate unique variable name for loop start time
                    const startId = path.scope.generateUidIdentifier("loop_start");

                    // Date.now() expression
                    const now = t.callExpression(
                        t.memberExpression(t.identifier("Date"), t.identifier("now")),
                        []
                    );

                    // var _loop_start = Date.now();
                    const startDecl = t.variableDeclaration("var", [
                        t.variableDeclarator(startId, now)
                    ]);

                    // Insert declaration before the loop
                    path.insertBefore(startDecl);

                    // Check expression:
                    // if (Date.now() - _loop_start > timeout) throw new Error("Execution Timeout");
                    const check = t.ifStatement(
                        t.binaryExpression(
                            ">",
                            t.binaryExpression("-", now, startId),
                            t.numericLiteral(timeout)
                        ),
                        t.throwStatement(
                            t.newExpression(t.identifier("Error"), [
                                t.stringLiteral(`Execution Timeout: Loop exceeded ${timeout}ms`)
                            ])
                        )
                    );

                    // Ensure loop body is a block statement
                    if (!t.isBlockStatement(path.node.body)) {
                        path.node.body = t.blockStatement([path.node.body]);
                    }

                    // Insert check at the beginning of the loop body
                    path.node.body.body.unshift(check);
                }
            }
        };
    };
};

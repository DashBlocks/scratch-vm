class ExpandableBlocksUtil {
    static getArgsStartedWith (args, argStart) {
        if (!(
            typeof args === 'object' &&
            args instanceof Object &&
            !Array.isArray(args)
        )) return [];
        const findedArgs = [];
        for (let i = 1, done = false; !done; i++) {
            done = !(`${argStart}${i}` in args);
            if (!done) findedArgs.push(args[`${argStart}${i}`]);
        }
        return findedArgs;
    }
}

module.exports = ExpandableBlocksUtil;

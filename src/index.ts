import * as llvm from "llvmc";
import * as path from "path";
import * as fs from "fs";
import { promisify } from "util";

import { parse } from "./parser";
import { Context } from "./scope/Context";

const readFile = promisify(fs.readFile);

readFile(path.resolve(process.argv[2]), "utf8")
    .then((content) => {
        let ctx: Context = parse(content, {});
        ctx.validate()
            .initTarget()
            .build()
            .optimize();

        console.log(ctx.print());
        ctx.writeBitcodeToFile("out.bc");

        const result = ctx.run("start");
        console.log("start():", result.toInt());
        result.free();

        ctx.free();
        ctx = null;

        global.gc();

        llvm.shutdown();
    })
    .catch((error: Error) => {
        // Something should probably be done to handle the error
        if (error.stack) {
            console.error(error.stack);
        } else {
            console.error(error.toString());
        }
    });

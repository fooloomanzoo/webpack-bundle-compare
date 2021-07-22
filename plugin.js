"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleComparisonPlugin = void 0;
const bfj_1 = require("bfj");
const fs_1 = require("fs");
const msgpack_lite_1 = require("msgpack-lite");
const path_1 = require("path");
const stream_1 = require("stream");
const zlib_1 = require("zlib");
const defaultFilename = (gzip, format) => {
    let filename = 'stats';
    if (format === "msgpack" /* MsgPack */) {
        filename += '.msp';
    }
    else {
        filename += '.json';
    }
    if (gzip) {
        filename += '.gz';
    }
    return filename;
};
const writeToStream = (options, data, stream) => {
    if (options.format === "msgpack" /* MsgPack */) {
        const encode = msgpack_lite_1.createEncodeStream();
        encode.pipe(stream);
        encode.write(data);
        encode.end();
    }
    else {
        const encode = bfj_1.streamify(data, Object.assign({ promises: 'ignore', buffers: 'ignore', maps: 'ignore', iterables: 'ignore', circular: 'ignore' }, options.bfjOptions));
        encode.pipe(stream);
    }
};
/**
 * Default listener used in the compiler. Webpack 4 will have a callback
 * function, but webpack 3 doesn't provide one, so we use this.
 */
const defaultListener = (err) => {
    if (err) {
        // tslint:disable-next-line
        console.error(`Error in the ${BundleComparisonPlugin.name}: ${err.stack || err.message}`);
    }
};
/**
 * Plugin that writes stat information to the compilation output.
 */
class BundleComparisonPlugin {
    constructor(_a = {}) {
        var { gzip = true, format = "msgpack" /* MsgPack */ } = _a, defaults = __rest(_a, ["gzip", "format"]);
        this.options = Object.assign({ gzip,
            format, file: defaultFilename(gzip, format) }, defaults);
    }
    apply(compiler) {
        const handler = (stats, callback = defaultListener) => {
            const target = fs_1.createWriteStream(path_1.resolve(compiler.outputPath, this.options.file));
            target
                .on('end', () => callback())
                .on('finish', () => callback())
                .on('error', callback);
            const jsonData = stats.toJson({
                source: false,
                chunkModules: false,
            });
            if (this.options.gzip) {
                const compressor = this.options.gzip ? zlib_1.createGzip() : new stream_1.PassThrough();
                compressor.pipe(target);
                writeToStream(this.options, jsonData, compressor);
            }
            else {
                writeToStream(this.options, jsonData, target);
            }
        };
        if (compiler.hooks) {
            compiler.hooks.done.tapAsync(BundleComparisonPlugin.name, handler);
        }
        else {
            // webpack 3
            compiler.plugin('done', handler);
        }
    }
}
exports.BundleComparisonPlugin = BundleComparisonPlugin;
//# sourceMappingURL=plugin.js.map
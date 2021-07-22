"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComparisonAddress = void 0;
const js_base64_1 = require("js-base64");
__exportStar(require("./plugin"), exports);
/**
 * A link to the bundle comparison tool preloaded to pull the stats from
 * the provided URLs.
 */
function getComparisonAddress(bundleStatUrls, toolUrl = 'https://webpackbundlecomparison.z5.web.core.windows.net') {
    return `${toolUrl}?urls=${bundleStatUrls.map(js_base64_1.Base64.encodeURI).join(',')}`;
}
exports.getComparisonAddress = getComparisonAddress;
//# sourceMappingURL=index.js.map
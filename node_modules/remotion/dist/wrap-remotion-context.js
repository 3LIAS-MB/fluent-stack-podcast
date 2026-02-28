"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemotionContextProvider = exports.useRemotionContexts = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
// This is used for when other reconcilers are being used
// such as in React Three Fiber. All the contexts need to be passed again
// for them to be useable
const react_1 = __importStar(require("react"));
const CanUseRemotionHooks_1 = require("./CanUseRemotionHooks");
const CompositionManager_1 = require("./CompositionManager");
const nonce_1 = require("./nonce");
const Sequence_1 = require("./Sequence");
const timeline_position_state_1 = require("./timeline-position-state");
function useRemotionContexts() {
    const compositionManagerCtx = react_1.default.useContext(CompositionManager_1.CompositionManager);
    const timelineContext = react_1.default.useContext(timeline_position_state_1.TimelineContext);
    const setTimelineContext = react_1.default.useContext(timeline_position_state_1.SetTimelineContext);
    const sequenceContext = react_1.default.useContext(Sequence_1.SequenceContext);
    const nonceContext = react_1.default.useContext(nonce_1.NonceContext);
    const canUseRemotionHooksContext = react_1.default.useContext(CanUseRemotionHooks_1.CanUseRemotionHooks);
    return (0, react_1.useMemo)(() => ({
        compositionManagerCtx,
        timelineContext,
        setTimelineContext,
        sequenceContext,
        nonceContext,
        canUseRemotionHooksContext,
    }), [
        compositionManagerCtx,
        nonceContext,
        sequenceContext,
        setTimelineContext,
        timelineContext,
        canUseRemotionHooksContext,
    ]);
}
exports.useRemotionContexts = useRemotionContexts;
const RemotionContextProvider = (props) => {
    const { children, contexts } = props;
    return ((0, jsx_runtime_1.jsx)(CanUseRemotionHooks_1.CanUseRemotionHooks.Provider, { value: contexts.canUseRemotionHooksContext, children: (0, jsx_runtime_1.jsx)(nonce_1.NonceContext.Provider, { value: contexts.nonceContext, children: (0, jsx_runtime_1.jsx)(CompositionManager_1.CompositionManager.Provider, { value: contexts.compositionManagerCtx, children: (0, jsx_runtime_1.jsx)(timeline_position_state_1.TimelineContext.Provider, { value: contexts.timelineContext, children: (0, jsx_runtime_1.jsx)(timeline_position_state_1.SetTimelineContext.Provider, { value: contexts.setTimelineContext, children: (0, jsx_runtime_1.jsx)(Sequence_1.SequenceContext.Provider, { value: contexts.sequenceContext, children: children }) }) }) }) }) }));
};
exports.RemotionContextProvider = RemotionContextProvider;

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
exports.CompositionManagerProvider = exports.compositionsRef = exports.CompositionManager = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
exports.CompositionManager = (0, react_1.createContext)({
    compositions: [],
    registerComposition: () => undefined,
    unregisterComposition: () => undefined,
    registerFolder: () => undefined,
    unregisterFolder: () => undefined,
    currentComposition: null,
    setCurrentComposition: () => undefined,
    registerSequence: () => undefined,
    unregisterSequence: () => undefined,
    registerAsset: () => undefined,
    unregisterAsset: () => undefined,
    sequences: [],
    assets: [],
    folders: [],
});
exports.compositionsRef = react_1.default.createRef();
const CompositionManagerProvider = ({ children }) => {
    // Wontfix, expected to have
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [compositions, setCompositions] = (0, react_1.useState)([]);
    const [currentComposition, setCurrentComposition] = (0, react_1.useState)(null);
    const [assets, setAssets] = (0, react_1.useState)([]);
    const [folders, setFolders] = (0, react_1.useState)([]);
    const [sequences, setSequences] = (0, react_1.useState)([]);
    const registerComposition = (0, react_1.useCallback)((comp) => {
        setCompositions((comps) => {
            if (comps.find((c) => c.id === comp.id)) {
                throw new Error(`Multiple composition with id ${comp.id} are registered.`);
            }
            return [...comps, comp].slice().sort((a, b) => a.nonce - b.nonce);
        });
    }, []);
    const registerSequence = (0, react_1.useCallback)((seq) => {
        setSequences((seqs) => {
            return [...seqs, seq];
        });
    }, []);
    const unregisterComposition = (0, react_1.useCallback)((id) => {
        setCompositions((comps) => {
            return comps.filter((c) => c.id !== id);
        });
    }, []);
    const unregisterSequence = (0, react_1.useCallback)((seq) => {
        setSequences((seqs) => seqs.filter((s) => s.id !== seq));
    }, []);
    const registerAsset = (0, react_1.useCallback)((asset) => {
        setAssets((assts) => {
            return [...assts, asset];
        });
    }, []);
    const unregisterAsset = (0, react_1.useCallback)((id) => {
        setAssets((assts) => {
            return assts.filter((a) => a.id !== id);
        });
    }, []);
    const registerFolder = (0, react_1.useCallback)((name, parent) => {
        setFolders((prevFolders) => {
            return [
                ...prevFolders,
                {
                    name,
                    parent,
                },
            ];
        });
    }, []);
    const unregisterFolder = (0, react_1.useCallback)((name, parent) => {
        setFolders((prevFolders) => {
            return prevFolders.filter((p) => !(p.name === name && p.parent === parent));
        });
    }, []);
    (0, react_1.useLayoutEffect)(() => {
        if (typeof window !== 'undefined') {
            window.remotion_collectAssets = () => {
                setAssets([]); // clear assets at next render
                return assets;
            };
        }
    }, [assets]);
    (0, react_1.useImperativeHandle)(exports.compositionsRef, () => {
        return {
            getCompositions: () => compositions,
        };
    }, [compositions]);
    const contextValue = (0, react_1.useMemo)(() => {
        return {
            compositions,
            registerComposition,
            unregisterComposition,
            currentComposition,
            setCurrentComposition,
            registerSequence,
            unregisterSequence,
            registerAsset,
            unregisterAsset,
            sequences,
            assets,
            folders,
            registerFolder,
            unregisterFolder,
        };
    }, [
        compositions,
        currentComposition,
        registerComposition,
        registerSequence,
        unregisterComposition,
        unregisterSequence,
        registerAsset,
        unregisterAsset,
        sequences,
        assets,
        registerFolder,
        unregisterFolder,
        folders,
    ]);
    return ((0, jsx_runtime_1.jsx)(exports.CompositionManager.Provider, { value: contextValue, children: children }));
};
exports.CompositionManagerProvider = CompositionManagerProvider;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Folder = exports.FolderContext = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const CompositionManager_1 = require("./CompositionManager");
const truthy_1 = require("./truthy");
const validate_folder_name_1 = require("./validation/validate-folder-name");
exports.FolderContext = (0, react_1.createContext)({
    folderName: null,
    parentName: null,
});
const Folder = ({ name, children, }) => {
    const parent = (0, react_1.useContext)(exports.FolderContext);
    const { registerFolder, unregisterFolder } = (0, react_1.useContext)(CompositionManager_1.CompositionManager);
    (0, validate_folder_name_1.validateFolderName)(name);
    const parentNameArr = [parent.parentName, parent.folderName].filter(truthy_1.truthy);
    const parentName = parentNameArr.length === 0 ? null : parentNameArr.join('/');
    const value = (0, react_1.useMemo)(() => {
        return {
            folderName: name,
            parentName,
        };
    }, [name, parentName]);
    (0, react_1.useEffect)(() => {
        registerFolder(name, parentName);
        return () => {
            unregisterFolder(name, parentName);
        };
    }, [name, parent.folderName, parentName, registerFolder, unregisterFolder]);
    return ((0, jsx_runtime_1.jsx)(exports.FolderContext.Provider, { value: value, children: children }));
};
exports.Folder = Folder;

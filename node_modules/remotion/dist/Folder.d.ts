import type { FC } from 'react';
export declare type TFolder = {
    name: string;
    parent: string | null;
};
declare type FolderContextType = {
    folderName: string | null;
    parentName: string | null;
};
export declare const FolderContext: import("react").Context<FolderContextType>;
export declare const Folder: FC<{
    name: string;
    children: React.ReactNode;
}>;
export {};

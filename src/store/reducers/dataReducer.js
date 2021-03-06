/* eslint-disable no-underscore-dangle */
import { clone } from 'Utils';

import {
  CREATE_FOLDER,
  UPDATE_FOLDER,
  DELETE_FOLDER,
  CREATE_RECORD,
  UPDATE_RECORD,
  DELETE_RECORD,
  READ_FILES,
  RESET_STORES,
} from 'Constants';

import {
  getStructuredFiles,
  getDestructuredFiles,
  swapChildInOneOfFolders,
  deleteChildInOneOfFolders,
  collectAllRelativeFolders,
} from './helpers';

const initialState = {
  rootFolder: {},
  folders: [],
  records: [],
};

const makeStructured = (state) => {
  state.rootFolder = getStructuredFiles(clone(state));
};

// eslint-disable-next-line no-unused-vars
export default function dataReducer(state = initialState, { type, payload }) {
  let newState = type !== READ_FILES && type !== RESET_STORES ? { ...state } : null;
  let file;

  switch (type) {
    case RESET_STORES:
      newState = {
        rootFolder: {},
        folders: [],
        records: [],
      };
      break;
    case READ_FILES:
      const rootFolder = clone(payload);
      const { folders, records } = getDestructuredFiles(clone(payload));
      newState = { rootFolder, folders, records };
      break;
    case CREATE_FOLDER:
      file = clone({ ...payload, children: { folders: [], records: [] } });
      newState.folders = [...clone(newState.folders), file];
      swapChildInOneOfFolders(newState.folders, file);
      makeStructured(newState);
      break;
    case UPDATE_FOLDER:
      file = clone(payload);
      newState.folders = [
        ...clone(newState.folders).filter((folder) => folder._id !== payload._id),
        file,
      ];
      swapChildInOneOfFolders(newState.folders, file);
      makeStructured(newState);
      break;
    case DELETE_FOLDER:
      const relatives = collectAllRelativeFolders(
        newState.folders.find((folder) => folder._id === payload._id)
      );
      const relatedRecords = relatives.flatMap((relative) => relative.children.records);
      if (relatedRecords) {
        newState.records = newState.records.filter(
          (record) => !relatedRecords.some((relatedRecord) => relatedRecord._id === record._id)
        );
      }
      newState.folders = clone(newState.folders).filter(
        (folder) => !relatives.some((relative) => relative._id === folder._id)
      );
      deleteChildInOneOfFolders(newState.folders, payload);
      makeStructured(newState);
      break;
    case CREATE_RECORD:
      file = clone(payload);
      newState.records = [...newState.records, file];
      newState.folders = clone(newState.folders);
      swapChildInOneOfFolders(newState.folders, file);
      makeStructured(newState);
      break;
    case UPDATE_RECORD:
      file = clone(payload);
      newState.records = [...newState.records.filter((record) => record._id !== payload._id), file];
      newState.folders = clone(newState.folders);
      swapChildInOneOfFolders(newState.folders, file);
      makeStructured(newState);
      break;
    case DELETE_RECORD:
      newState.records = [...newState.records.filter((record) => record._id !== payload._id)];
      newState.folders = clone(newState.folders);
      deleteChildInOneOfFolders(newState.folders, payload);
      makeStructured(newState);
      break;
    default:
      break;
  }

  return newState;
}

import React from 'react';
import PropTypes from 'prop-types';
import File from './File';
import '../css/FileList.css';

export default function TopLevelFolderList(props) {
  const {
    loadAuth, moveExternal, moveWithin, openFolder, refreshFunc, shareFile, topLevelFolderList, userId,
  } = props;

  return (
    <div className="topFolder">
      <div className="file-list-container" style={{ display: 'flex', flexDirection: 'row' }}>
        {topLevelFolderList.map((folderObj) => (
          <File
            key={folderObj.folder.id}
            data={folderObj.folder}
            displayed
            loadAuth={loadAuth}
            moveExternal={moveExternal}
            moveWithin={moveWithin}
            oId={null}
            openFolder={openFolder}
            refreshFunc={refreshFunc}
            shareFile={shareFile}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
}

TopLevelFolderList.propTypes = {
  loadAuth: PropTypes.func.isRequired,
  moveExternal: PropTypes.func.isRequired,
  moveWithin: PropTypes.func.isRequired,
  openFolder: PropTypes.func.isRequired,
  refreshFunc: PropTypes.func.isRequired,
  shareFile: PropTypes.func.isRequired,
  topLevelFolderList: PropTypes.arrayOf(PropTypes.object).isRequired,
  userId: PropTypes.number.isRequired,
};

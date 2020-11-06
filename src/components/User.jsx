import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faSyncAlt, faEye, faEyeSlash, faUpload, faPlus, faEllipsisV, faFolderPlus, faSortNumericDown, faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  ContextMenu, MenuItem, ContextMenuTrigger, SubMenu,
} from 'react-contextmenu';
import LooseFileList from './LooseFileList';
import TopLevelFolderList from './TopLevelFolderList';
import OpenFolderList from './OpenFolderList';
import '../css/User.css';
import Checklist from  './Checklist';

class User extends Component {
  constructor() {
    super();
    this.state = {
      looseFilesIsDisplayed: true,
    };
  }

  viewToggle = () => {
    const { forwardRef } = this.props;
    const { display } = forwardRef.current.style;
    forwardRef.current.style.display = (display === 'none') ? 'block' : 'none';
  }

  handleIconClick = (event, func) => {
    event.stopPropagation();
    if (func !== undefined) {
      func();
    }
  }

  uploadController = (event, idToken) => {
    event.stopPropagation();
    const uploadedFiles = this.addFiles(event.target, idToken);
    this.uploadFiles(uploadedFiles);
  }

  addFiles = (target, idToken) => {
    const list = [];
    for (let i = 0; i < target.files.length; i++) {
      list[i] = {
        file: target.files[i],
        user: idToken,
      };
    }
    return list;
  }

  uploadFiles = (filesList) => {
    const { fileUpload } = this.props;
    for (let i = 0; i < filesList.length; i++) {
      fileUpload((filesList[i].user), filesList[i].file);
    }
  }

  toggleLoose = () => {
    this.setState((prevState) => ({
      looseFilesIsDisplayed: !prevState.looseFilesIsDisplayed,
    }));
  }

  shareFile = (fileId, newEmail) => {
    const { refreshFunc } = this.props;
    const { userId } = this.props;
    window.gapi.client.drive.permissions.create({
      fileId,
      emailMessage: 'Share Success!',
      sendNotificationEmail: true,
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: newEmail,
      },
    }).then((response) => {
      refreshFunc(userId);
    }, (error) => {
      alert('Insufficient Permission to Share This File');
    });
  }

  // This is to be used with the decorator func in app
  moveExternal = (fileId, newEmail) => {
    window.gapi.client.drive.permissions.create({
      fileId,
      resource: {
        type: 'user',
        role: 'writer',
        emailAddress: newEmail,
      },
    }).then((response) => {
      if (response.error) {
        console.log(response.error);
      }
      console.log(response);
      window.gapi.client.drive.permissions.update({
        fileId,
        permissionId: response.result.id,
        transferOwnership: true,
        resource: {
          role: 'owner',
        },
      }).then((response) => {
        if (response.error) {
          console.log(response.error);
        }
      });
    });
  }

  create = (fileType) => {
    const { userId } = this.props;
    let newName = prompt('Enter a Name');
    if (newName === null) { return; }
    if (newName === '') {
      newName = null;
    }
    const reqBody = JSON.stringify({
      mimeType: fileType,
      name: newName,
    });
    window.gapi.client.drive.files.create({
      resource: reqBody,
    }).then((response) => {
      this.refreshFunc(userId);
    });
  }

  render() {
    const { looseFilesIsDisplayed } = this.state;
  
    const {
      closePath, currentSort, idToken, loadAuth, looseFileList, moveExternal, moveWithin,
      openFolder, openFolderList, parseIDToken, refreshFunc, removeFunc, sortFunc,
      topLevelFolderList, updatePath, userId, filterFunc
    } = this.props;

    const { name, email, picture } = parseIDToken(idToken);
    const createFunc = loadAuth(userId, this.create);
    return (
      <ContextMenuTrigger className="user" id={userId.toString()}>
        <button
          type="button"
          className="user-banner"
          onClick={() => this.viewToggle()}
          onKeyDown={() => this.viewToggle()}
        >
          <img className="profile-picture" src={picture} alt="Account profile" />
          <span className="profile-text">
            <span className="profile-name">{name}</span>
            {' '}
            <span className="profile-email">
              (
              {email}
              )
            </span>
          </span>
          <ContextMenuTrigger className="context-menu" id={userId.toString()} holdToDisplay={0}>
            <FontAwesomeIcon className="fa-ellipsis menu-icon" icon={faEllipsisV} size="lg" onClick={(event) => this.handleIconClick(event, () => {})} title="Options" />
          </ContextMenuTrigger>
        </button>
        <ContextMenu className="context-menu" id={userId.toString()}>
          <MenuItem className="menu-item upload">
            <SubMenu
              className="context-menu sub-menu-upload"
              title={
              (
                <span>
                  <FontAwesomeIcon className="fa-plus menu-icon" icon={faPlus} onClick={(event) => this.handleIconClick(event, () => {})} />
                  Create New...
                </span>
              )
            }
            >
              <MenuItem className="menu-item" onClick={() => createFunc('application/vnd.google-apps.folder', 'New Folder')}>
                <FontAwesomeIcon className="fa-folder menu-icon" icon={faFolderPlus} />
                Folder
              </MenuItem>
              <hr className="divider" />
              <MenuItem className="menu-item" onClick={() => createFunc('application/vnd.google-apps.document', 'New Doc')}>
                <img className="menu-icon" src="https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document" alt="Google Doc icon" />
                Google Doc
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => createFunc('application/vnd.google-apps.spreadsheet', 'New Sheet')}>
                <img className="menu-icon" src="https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet" alt="Google Speardsheet icon" />
                Google Sheets
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => createFunc('application/vnd.google-apps.presentation', 'New Presentation')}>
                <img className="menu-icon" src="https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation" alt="Google Slides icon" />
                Google Slides
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => createFunc('application/vnd.google-apps.form', 'New Form')}>
                <img className="menu-icon" src="https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.form" alt="Google Forms icon" />
                Google Forms
              </MenuItem>
            </SubMenu>
          </MenuItem>
          <label htmlFor={email}>
            <MenuItem className="menu-item">
              <FontAwesomeIcon className="fa-upload menu-icon" icon={faUpload} />
              <input
                type="file"
                id={email}
                className="file-input"
                onChange={(e) => this.uploadController(e, idToken)}
                multiple
              />
              Upload
            </MenuItem>
          </label>
          <MenuItem className="menu-item" onClick={(event) => this.handleIconClick(event, () => this.toggleLoose())}>
            <FontAwesomeIcon className="fa-eye-slash menu-icon" icon={(looseFilesIsDisplayed) ? faEye : faEyeSlash} />
            Toggle Folder View
          </MenuItem>

          <MenuItem className="menu-item sort">
            <SubMenu
              className="context-menu sub-menu-sort"
              title={
              (
                <span>
                  <FontAwesomeIcon className="fa-sort menu-icon" icon={faSortNumericDown} onClick={(event) => this.handleIconClick(event, () => {})} />
                  Sort...
                </span>
              )
            }
            >
              <MenuItem className="menu-item" onClick={() => sortFunc(userId, 'folder, viewedByMeTime desc')}>
                {'Last Opened by Me'}
                {currentSort === 'folder, viewedByMeTime desc'
                  && (
                  <FontAwesomeIcon className="fa-check menu-icon" icon={faCheck} />
                  )}
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => sortFunc(userId, 'folder, modifiedTime desc')}>
                Last Modified
                {currentSort === 'folder, modifiedTime desc'
                && (
                <FontAwesomeIcon className="fa-check menu-icon" icon={faCheck} />
                )}
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => sortFunc(userId, 'folder, createdTime desc')}>
                Newest
                {currentSort === 'folder, createdTime desc'
                && (
                <FontAwesomeIcon className="fa-check menu-icon" icon={faCheck} />
                )}
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => sortFunc(userId, 'folder, createdTime')}>
                Oldest
                {currentSort === 'folder, createdTime'
                && (
                <FontAwesomeIcon className="fa-check menu-icon" icon={faCheck} />
                )}
              </MenuItem>
              <MenuItem className="menu-item" onClick={() => sortFunc(userId, 'folder, name')}>
                By Name
                {currentSort === 'folder, name'
                && (
                <FontAwesomeIcon className="fa-check menu-icon" icon={faCheck} />
                )}
              </MenuItem>
            </SubMenu>
          </MenuItem>

          <MenuItem className="menu-item" onClick={(event) => this.handleIconClick(event, () => refreshFunc(userId))}>
            <FontAwesomeIcon className="fa-sync menu-icon" icon={faSyncAlt} />
            Refresh Account
          </MenuItem>
          <MenuItem className="menu-item" onClick={(event) => this.handleIconClick(event, () => removeFunc(userId))}>
            <FontAwesomeIcon className="fa-trash menu-icon" icon={faTrash} />
            Remove Account
          </MenuItem>
        </ContextMenu>
        <div style={{display: 'none',}} className="Files/Folders" ref={this.props.forwardRef}>




       <Checklist
        userId = {userId}
         filterFunc={filterFunc}
       />
          <TopLevelFolderList
            userId={userId}
            topLevelFolderList={topLevelFolderList}
            shareFile={loadAuth(userId, this.shareFile)}
            moveWithin={moveWithin}
            loadAuth={loadAuth}
            moveExternal={moveExternal}
            refreshFunc={refreshFunc}
            email={email}
            openFolder={openFolder}
          />
          <OpenFolderList
            userId={userId}
            openFolderList={openFolderList}
            shareFile={loadAuth(userId, this.shareFile)}
            moveWithin={moveWithin}
            loadAuth={loadAuth}
            moveExternal={moveExternal}
            refreshFunc={refreshFunc}
            email={email}
            openFolder={openFolder}
            closePath={closePath}
            updatePath={updatePath}
          />
          <LooseFileList
            userId={userId}
            looseFileList={looseFileList}
            shareFile={loadAuth(userId, this.shareFile)}
            moveWithin={moveWithin}
            isDisplayed={looseFilesIsDisplayed}
            loadAuth={loadAuth}
            moveExternal={moveExternal}
            refreshFunc={refreshFunc}
            email={email}
          />
        </div>
      </ContextMenuTrigger>
    );
  }
}

User.propTypes = {
  closePath: PropTypes.func.isRequired,
  currentSort: PropTypes.string.isRequired,
  fileUpload: PropTypes.func.isRequired,
  forwardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]).isRequired,
  idToken: PropTypes.string.isRequired,
  loadAuth: PropTypes.func.isRequired,
  looseFileList: PropTypes.arrayOf(PropTypes.object).isRequired,
  moveExternal: PropTypes.func.isRequired,
  moveWithin: PropTypes.func.isRequired,
  openFolder: PropTypes.func.isRequired,
  openFolderList: PropTypes.arrayOf(PropTypes.object).isRequired,
  parseIDToken: PropTypes.func.isRequired,
  refreshFunc: PropTypes.func.isRequired,
  removeFunc: PropTypes.func.isRequired,
  sortFunc: PropTypes.func.isRequired,
  topLevelFolderList: PropTypes.arrayOf(PropTypes.object).isRequired,
  updatePath: PropTypes.func.isRequired,
  userId: PropTypes.number.isRequired,
};

export default User;

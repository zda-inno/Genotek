import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/StyledComponents';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #ccc;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;

  &:hover {
    border-color: #666;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const UploadTreeModal = ({ isOpen, onClose, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>Upload New Tree</h2>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <UploadArea onClick={() => document.getElementById('fileInput').click()}>
          {file ? (
            <p>Selected file: {file.name}</p>
          ) : (
            <p>Click to select a GEDCOM file or drag and drop it here</p>
          )}
          <FileInput
            id="fileInput"
            type="file"
            accept=".ged"
            onChange={handleFileChange}
          />
        </UploadArea>
        <Button 
          className="primary" 
          onClick={handleUpload}
          disabled={!file}
        >
          Upload
        </Button>
      </ModalContent>
    </ModalOverlay>
  );
};

export default UploadTreeModal; 
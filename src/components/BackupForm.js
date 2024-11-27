import React, { useState, useEffect } from "react";

// Google API Client Load function
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    window.gapi.load('client:auth2', {
      callback: resolve,
      onerror: reject,
    });
  });
};

const BackupForm = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('userData'));
    if (savedData) {
      setUserData(savedData);
      setName(savedData.name);
      setSurname(savedData.surname);
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const userInfo = { name, surname };
    localStorage.setItem('userData', JSON.stringify(userInfo));
    setUserData(userInfo);
    alert('Data saved locally!');
  };

  // Handle backup to Google Drive
  const backupToGoogleDrive = async () => {
    try {
      await loadGoogleAPI();

      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      if (!GoogleAuth.isSignedIn.get()) {
        alert('Please sign in to Google to proceed with the backup.');
        await GoogleAuth.signIn();
      }

      const userInfo = `${name}\n${surname}`;
      const folderId = 'your-google-drive-folder-id'; // Replace with your actual folder ID

      await window.gapi.client.load('drive', 'v3');

      const fileMetadata = {
        name: `${name}_${surname}_info.txt`,
        mimeType: 'text/plain',
        parents: [folderId], // Upload to a specific folder
      };

      const fileContent = {
        mimeType: 'text/plain',
        body: userInfo, // Content of the file
      };

      const response = await window.gapi.client.drive.files.create({
        resource: fileMetadata,
        media: fileContent,
        fields: 'id',
      });

      if (response.result.id) {
        alert('Data successfully backed up to Google Drive!');
      } else {
        alert('Failed to backup data to Google Drive.');
      }
    } catch (error) {
      console.error('Error during backup to Google Drive:', error);
      alert('An error occurred while backing up data.');
    }
  };

  // Initialize Google API
  const initializeGoogleAPI = async () => {
    try {
      await loadGoogleAPI();
      window.gapi.auth2.init({
        client_id: 'your-client-id.apps.googleusercontent.com', // Replace with your OAuth2 client ID
      });
    } catch (error) {
      console.error('Error initializing Google API:', error);
    }
  };

  useEffect(() => {
    initializeGoogleAPI();
  }, []);

  return (
    <div>
      <h1>Backup Your Info</h1>

      {/* User Info Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Surname:</label>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <button type="submit">Save Data</button>
      </form>

      {/* Backup Button (visible after data is saved) */}
      {userData && (
        <div>
          <h3>Your Data:</h3>
          <p>Name: {userData.name}</p>
          <p>Surname: {userData.surname}</p>
          <button onClick={backupToGoogleDrive}>Backup to Google Drive</button>
        </div>
      )}
    </div>
  );
};

export default BackupForm;

import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

// Load Google API client when needed
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (typeof gapi === 'undefined') {
      reject('Google API script not loaded.');
      return;
    }
    gapi.load('client:auth2', () => {
      gapi.auth2
        .init({
          client_id: '576814553808-sep0nc7e0bho41of3ri2e1c5ldgcb4rf.apps.googleusercontent.com', // Replace with your Google Client ID
          scope: 'https://www.googleapis.com/auth/drive.file',
        })
        .then(resolve, reject);
    });
  });
};
const BackupForm = () => {
  const [name, setName] = useState('');
  const [lastname, setLastname] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user data from localStorage if it exists
  useEffect(() => {
    const savedUserData = JSON.parse(localStorage.getItem('userData'));
    if (savedUserData) {
      setName(savedUserData.name);
      setLastname(savedUserData.lastname);
    }
  }, []);

  // Handle form submission to save data in localStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = { name, lastname };
    localStorage.setItem('userData', JSON.stringify(userData));
    alert('Data saved to localStorage!');
  };

  // Authenticate with Google API
  const authenticateGoogle = async () => {
    try {
      await loadGoogleAPI();
      const GoogleAuth = gapi.auth2.getAuthInstance();
      if (!GoogleAuth.isSignedIn.get()) {
        await GoogleAuth.signIn();
      }
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Google authentication failed', err);
    }
  };

  // Backup data to Google Drive
  const backupToGoogleDrive = async () => {
    try {
      await loadGoogleAPI();
      const GoogleAuth = gapi.auth2.getAuthInstance();

      // If not signed in, initiate sign-in
      if (!GoogleAuth.isSignedIn.get()) {
        alert('Please sign in to Google to proceed with the backup.');
        await GoogleAuth.signIn();
        setIsAuthenticated(true);
      }

      const userData = localStorage.getItem('userData');
      if (!userData) {
        alert('No data found in localStorage to backup!');
        return;
      }

      await gapi.client.load('drive', 'v3');
      const fileMetadata = {
        name: 'user_data_backup.json',
        mimeType: 'application/json',
      };

      const media = {
        mimeType: 'application/json',
        body: userData,
      };

      const response = await gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      if (response.result.id) {
        alert('Data successfully backed up to Google Drive!');
      } else {
        alert('Failed to backup data to Google Drive.');
      }
    } catch (error) {
      console.error('Error backing up data to Google Drive:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Backup Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            First Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="lastname" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            className="form-control"
            id="lastname"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      <button
        id="backupBtn"
        className="btn btn-success mt-3"
        onClick={backupToGoogleDrive}
      >
        Backup Data to Google Drive
      </button>
    </div>
  );
};

export default BackupForm;

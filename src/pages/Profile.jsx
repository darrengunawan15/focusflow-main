import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavbarIn from '../components/NavbarIn';

const Profile = () => {
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewURL, setPreviewURL] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = JSON.parse(localStorage.getItem('user'));
        
        if (!token || !userData) {
            navigate('/login');
            return;
        }

        setDisplayName(userData.displayName || '');
        setPhotoURL(userData.photoURL || '');
        setPreviewURL(userData.photoURL || 'https://cdn.vectorstock.com/i/500p/54/69/male-user-icon-vector-8865469.jpg');
    }, [navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewURL(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let newPhotoURL = photoURL;
            
            // If a new file is selected, upload it to Cloudinary
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('upload_preset', 'ml_default');
                
                const cloudinaryResponse = await axios.post(
                    'https://api.cloudinary.com/v1_1/dn5t68vyk/image/upload',
                    formData
                );
                newPhotoURL = cloudinaryResponse.data.secure_url;
            }

            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:5000/api/auth/profile',
                { displayName, photoURL: newPhotoURL },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update local storage with new user data
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setPhotoURL(newPhotoURL);
            setSelectedFile(null);
            setError('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <NavbarIn />
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Profile Settings
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleUpdateProfile}>
                            {error && (
                                <div className={`p-4 rounded-md ${error.includes('successfully') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col items-center">
                                <img
                                    src={previewURL}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover mb-4"
                                />
                                <div className="mt-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-md file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                                    Display Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="displayName"
                                        name="displayName"
                                        type="text"
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </button>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Logout
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;

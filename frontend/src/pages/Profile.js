import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageCropper from '../components/ImageCropper';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverPicture, setCoverPicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [showProfileCropper, setShowProfileCropper] = useState(false);
  const [showCoverCropper, setShowCoverCropper] = useState(false);
  const [croppingImage, setCroppingImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        studentId: user.studentId || ''
      });
      setProfilePreview(user.profilePicture || null);
      setCoverPreview(user.coverPicture || null);
    }
  }, [user]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingImage(reader.result);
        setShowProfileCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover picture must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingImage(reader.result);
        setShowCoverCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileCropComplete = (croppedImage) => {
    setProfilePreview(croppedImage);
    setProfilePicture(croppedImage);
    setShowProfileCropper(false);
    setCroppingImage(null);
  };

  const handleCoverCropComplete = (croppedImage) => {
    setCoverPreview(croppedImage);
    setCoverPicture(croppedImage);
    setShowCoverCropper(false);
    setCroppingImage(null);
  };

  const cancelCrop = () => {
    setShowProfileCropper(false);
    setShowCoverCropper(false);
    setCroppingImage(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // MOCK PROFILE UPDATE
      console.log('MOCK PROFILE UPDATE:', formData);
      
      // Get current user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update user data
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId
      };
      
      // Handle profile picture upload (mock)
      if (profilePicture) {
        // In a real app, you'd upload to a server
        // For now, we'll store the base64 string
        updatedUser.profilePicture = profilePreview;
        console.log('Profile picture updated');
      }
      
      // Handle cover picture upload (mock)
      if (coverPicture) {
        updatedUser.coverPicture = coverPreview;
        console.log('Cover picture updated');
      }
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update all users in mockUsers
      const allUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      const updatedUsers = allUsers.map(u => 
        u._id === currentUser._id ? updatedUser : u
      );
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      
      // Update auth context
      updateUser(updatedUser);
      
      // Reset picture states
      setProfilePicture(null);
      setCoverPicture(null);
      
      setIsEditing(false);
      setLoading(false);
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Restore original values from user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        studentId: user.studentId || ''
      });
      setProfilePreview(user.profilePicture || null);
      setCoverPreview(user.coverPicture || null);
      setProfilePicture(null);
      setCoverPicture(null);
      setIsEditing(false);
      toast.success('Changes cancelled');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      truck_manager: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cover Picture Section */}
        <div className="relative h-32 bg-gradient-to-r from-red-600 to-red-800">
          {coverPreview ? (
            <img 
              src={coverPreview} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-800"></div>
          )}
          
          {/* Cover Picture Upload Button - Only show in edit mode */}
          {isEditing && (
            <div className="absolute top-2 right-2">
              <label className="btn bg-white/90 hover:bg-white text-gray-800 px-3 py-1 rounded-lg text-sm flex items-center cursor-pointer">
                <Camera className="h-4 w-4 mr-1" />
                Change Cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPictureChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
          
          {/* Profile Picture Section */}
          <div className="absolute -bottom-12 left-6">
            <div className="relative">
              {profilePreview ? (
                <img 
                  src={profilePreview} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <User className="h-12 w-12 text-red-600" />
                </div>
              )}
              
              {/* Profile Picture Upload Button - Only show in edit mode */}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
        
        {/* User Info Section */}
        <div className="pt-16 px-6 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                </span>
              </div>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="label">Full Name</label>
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input flex-1"
                  />
                ) : (
                  <span className="text-gray-900">{user.name}</span>
                )}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input flex-1"
                  />
                ) : (
                  <span className="text-gray-900">{user.email}</span>
                )}
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input flex-1"
                    placeholder="Add your phone number"
                  />
                ) : (
                  <span className="text-gray-900">
                    {user.phone || 'Not provided'}
                  </span>
                )}
              </div>
            </div>

            {user.role === 'student' && (
              <div>
                <label className="label">Student ID</label>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      className="input flex-1"
                    />
                  ) : (
                    <span className="text-gray-900">
                      {user.studentId || 'Not provided'}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="label">Account Created</label>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: '#7d0c0c' }}>EGP 0</div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modals */}
      {showProfileCropper && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleProfileCropComplete}
          onCancel={cancelCrop}
          aspectRatio={1}
          cropShape="round"
        />
      )}

      {showCoverCropper && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleCoverCropComplete}
          onCancel={cancelCrop}
          aspectRatio={16/9}
          cropShape="rect"
        />
      )}
      </>
    );
};

export default Profile;

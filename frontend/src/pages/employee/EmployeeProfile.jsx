import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import employeeService from '../../services/employeeService';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Shield, Edit, CheckCircle, Save, X, Loader, Building2, IdCard, Heart, AlertCircle, Camera, Upload } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

// Memoized ProfileField to prevent unnecessary re-renders
const ProfileField = React.memo(({ label, value, name, isEditing, icon, type = 'text', options, as = 'input', onChange }) => (
  <div className="flex items-start text-gray-600 group hover:text-blue-600 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-blue-50 transition-colors flex-shrink-0 mt-1">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {isEditing ? (
        as === 'select' ? (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full font-medium border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 px-2 py-1 rounded"
          >
            <option value="">Select...</option>
            {options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            rows={2}
            className="w-full font-medium border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 px-2 py-1 rounded"
          />
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full font-medium border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 px-2 py-1 rounded"
          />
        )
      ) : (
        <p className="font-medium break-words">{value || 'Not provided'}</p>
      )}
    </div>
  </div>
));

export default function EmployeeProfile() {
  const { user, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous errors
      setError(null);
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF)');
        setTimeout(() => setError(null), 5000);
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const profileData = await employeeService.getProfile();
      setProfile(profileData);
      setEditableProfile({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        surname: profileData.surname || '',
        firstName: profileData.firstName || '',
        middleName: profileData.middleName || '',
        suffix: profileData.suffix || '',
        contactNumber: profileData.contactNumber || '',
        dateOfBirth: profileData.dateOfBirth || '',
        placeOfBirth: profileData.placeOfBirth || '',
        sex: profileData.sex || '',
        civilStatus: profileData.civilStatus || '',
        citizenship: profileData.citizenship || 'Filipino',
        age: profileData.age || '',
        religion: profileData.religion || '',
        contractNumber: profileData.contractNumber || '',
        bloodType: profileData.bloodType || '',
        gsisIdNo: profileData.gsisIdNo || '',
        pagibigIdNo: profileData.pagibigIdNo || '',
        philhealthNo: profileData.philhealthNo || '',
        sssNo: profileData.sssNo || '',
        tinNo: profileData.tinNo || '',
        residentialAddress: profileData.residentialAddress || '',
        residentialZip: profileData.residentialZip || '',
        permanentAddress: profileData.permanentAddress || '',
        permanentZip: profileData.permanentZip || '',
        emergencyContactName: profileData.emergencyContactName || '',
        emergencyContactNumber: profileData.emergencyContactNumber || '',
        emergencyContactRelationship: profileData.emergencyContactRelationship || ''
        ,
        spouseName: profileData.spouseName || '',
        spouseContactNumber: profileData.spouseContactNumber || '',
        spouseOccupation: profileData.spouseOccupation || '',
        spouseAddress: profileData.spouseAddress || '',
        fatherName: profileData.fatherName || '',
        motherName: profileData.motherName || '',
        children: profileData.children || [],
        education: profileData.education || [],
        eligibility: profileData.eligibility || [],
        workExperience: profileData.workExperience || [],
        communityInvolvement: profileData.communityInvolvement || [],
        learningAndDevelopment: profileData.learningAndDevelopment || [],
        trainings: profileData.trainings || [],
        otherInformation: profileData.otherInformation || { skills: '', recognitions: '', memberships: '' },
        legalResponses: profileData.legalResponses || { adminOffense: { answered: false, details: '' }, criminalCharge: { answered: false, details: '' }, separatedFromService: { answered: false, details: '' } },
        references: profileData.references || []
      });

      // Fetch current contract
      try {
        const contractData = await employeeService.getCurrentContract();
        setContract(contractData);
      } catch (err) {
        console.log('No active contract found');
        setContract(null);
      }
      
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset on cancel
      setEditableProfile({
        fullName: profile.fullName || '',
        email: profile.email || '',
        surname: profile.surname || '',
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        suffix: profile.suffix || '',
        contactNumber: profile.contactNumber || '',
        dateOfBirth: profile.dateOfBirth || '',
        placeOfBirth: profile.placeOfBirth || '',
        sex: profile.sex || '',
        civilStatus: profile.civilStatus || '',
        citizenship: profile.citizenship || 'Filipino',
        age: profile.age || '',
        religion: profile.religion || '',
        contractNumber: profile.contractNumber || '',
        bloodType: profile.bloodType || '',
        gsisIdNo: profile.gsisIdNo || '',
        pagibigIdNo: profile.pagibigIdNo || '',
        philhealthNo: profile.philhealthNo || '',
        sssNo: profile.sssNo || '',
        tinNo: profile.tinNo || '',
        residentialAddress: profile.residentialAddress || '',
        residentialZip: profile.residentialZip || '',
        permanentAddress: profile.permanentAddress || '',
        permanentZip: profile.permanentZip || '',
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactNumber: profile.emergencyContactNumber || '',
        emergencyContactRelationship: profile.emergencyContactRelationship || ''
        ,
        spouseName: profile.spouseName || '',
        spouseContactNumber: profile.spouseContactNumber || '',
        spouseOccupation: profile.spouseOccupation || '',
        spouseAddress: profile.spouseAddress || '',
        fatherName: profile.fatherName || '',
        motherName: profile.motherName || '',
        children: profile.children || []
      });
    }
    if (isEditing) {
      // Cancel editing - reset image preview
      setProfileImageFile(null);
      setProfileImagePreview(null);
    }
    setIsEditing(!isEditing);
    setSuccess(false);
  };

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    // Handle nested properties (e.g., "otherInformation.skills")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditableProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setEditableProfile(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const addChild = useCallback(() => {
    setEditableProfile(prev => {
      const children = Array.isArray(prev.children) ? [...prev.children] : [];
      children.push({ fullName: '', dob: '' });
      return { ...prev, children };
    });
  }, []);

  const updateChild = useCallback((index, field, value) => {
    setEditableProfile(prev => {
      const children = Array.isArray(prev.children) ? [...prev.children] : [];
      children[index] = { ...children[index], [field]: value };
      return { ...prev, children };
    });
  }, []);

  const removeChild = useCallback((index) => {
    setEditableProfile(prev => {
      const children = Array.isArray(prev.children) ? [...prev.children] : [];
      children.splice(index, 1);
      return { ...prev, children };
    });
  }, []);

  // Generic helpers for dynamic lists - memoized for performance
  const addItem = useCallback((key, item) => {
    setEditableProfile(prev => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr.push(item);
      return { ...prev, [key]: arr };
    });
  }, []);

  const updateItem = useCallback((key, index, field, value) => {
    setEditableProfile(prev => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [key]: arr };
    });
  }, []);

  const removeItem = useCallback((key, index) => {
    setEditableProfile(prev => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Upload image first if changed
      let uploadedImagePath = null;
      if (profileImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        const uploadResponse = await employeeService.uploadProfileImage(formData);
        uploadedImagePath = uploadResponse.profileImage;
        setUploadingImage(false);
      }

      await employeeService.updateProfile({
        name: editableProfile.fullName,
        surname: editableProfile.surname,
        firstName: editableProfile.firstName,
        middleName: editableProfile.middleName,
        suffix: editableProfile.suffix,
        email: editableProfile.email,
        contactNumber: editableProfile.contactNumber,
        dateOfBirth: editableProfile.dateOfBirth || null,
        placeOfBirth: editableProfile.placeOfBirth,
        sex: editableProfile.sex || null,
        civilStatus: editableProfile.civilStatus || null,
        citizenship: editableProfile.citizenship,
        age: editableProfile.age || null,
        religion: editableProfile.religion,
        contractNumber: editableProfile.contractNumber,
        bloodType: editableProfile.bloodType,
        gsisIdNo: editableProfile.gsisIdNo,
        pagibigIdNo: editableProfile.pagibigIdNo,
        philhealthNo: editableProfile.philhealthNo,
        sssNo: editableProfile.sssNo,
        tinNo: editableProfile.tinNo,
        residentialAddress: editableProfile.residentialAddress,
        residentialZip: editableProfile.residentialZip,
        permanentAddress: editableProfile.permanentAddress,
        permanentZip: editableProfile.permanentZip,
        emergencyContactName: editableProfile.emergencyContactName,
        emergencyContactNumber: editableProfile.emergencyContactNumber,
        emergencyContactRelationship: editableProfile.emergencyContactRelationship
        ,
        spouseName: editableProfile.spouseName,
        spouseContactNumber: editableProfile.spouseContactNumber,
        spouseOccupation: editableProfile.spouseOccupation,
        spouseAddress: editableProfile.spouseAddress,
        fatherName: editableProfile.fatherName,
        motherName: editableProfile.motherName,
        children: editableProfile.children || [],
        education: editableProfile.education || [],
        eligibility: editableProfile.eligibility || [],
        workExperience: editableProfile.workExperience || [],
        communityInvolvement: editableProfile.communityInvolvement || [],
        learningAndDevelopment: editableProfile.learningAndDevelopment || [],
        trainings: editableProfile.trainings || [],
        otherInformation: editableProfile.otherInformation || { skills: '', recognitions: '', memberships: '' },
        legalResponses: editableProfile.legalResponses || {},
        references: editableProfile.references || []
      });

      // Refresh profile data
      const updatedProfile = await fetchProfileData();
      setIsEditing(false);
      setProfileImageFile(null);
      setProfileImagePreview(null);
      
      // Update user context with new profile image - use uploaded path immediately
      if (updateUser && uploadedImagePath) {
        updateUser({ profileImage: uploadedImagePath });
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestChange = async () => {
    try {
      if (!changeReason.trim()) {
        setError('Please provide a reason for your profile change request');
        setTimeout(() => setError(null), 5000);
        return;
      }

      setSaving(true);
      setError(null);

      // Upload image first if changed
      if (profileImageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('profileImage', profileImageFile);
        await employeeService.uploadProfileImage(formData);
        setUploadingImage(false);
      }

      // Submit change request
      await employeeService.requestProfileChange({
        requestedChanges: {
          fullName: editableProfile.fullName,
          surname: editableProfile.surname,
          firstName: editableProfile.firstName,
          middleName: editableProfile.middleName,
          suffix: editableProfile.suffix,
          email: editableProfile.email,
          contactNumber: editableProfile.contactNumber,
          dateOfBirth: editableProfile.dateOfBirth || null,
          placeOfBirth: editableProfile.placeOfBirth,
          sex: editableProfile.sex || null,
          civilStatus: editableProfile.civilStatus || null,
          citizenship: editableProfile.citizenship,
          age: editableProfile.age || null,
          religion: editableProfile.religion,
          contractNumber: editableProfile.contractNumber,
          bloodType: editableProfile.bloodType,
          gsisIdNo: editableProfile.gsisIdNo,
          pagibigIdNo: editableProfile.pagibigIdNo,
          philhealthNo: editableProfile.philhealthNo,
          sssNo: editableProfile.sssNo,
          tinNo: editableProfile.tinNo,
          residentialAddress: editableProfile.residentialAddress,
          residentialZip: editableProfile.residentialZip,
          permanentAddress: editableProfile.permanentAddress,
          permanentZip: editableProfile.permanentZip,
          emergencyContactName: editableProfile.emergencyContactName,
          emergencyContactNumber: editableProfile.emergencyContactNumber,
          emergencyContactRelationship: editableProfile.emergencyContactRelationship,
          emergencyContactAddress: editableProfile.emergencyContactAddress,
          spouseName: editableProfile.spouseName,
          spouseContactNumber: editableProfile.spouseContactNumber,
          spouseOccupation: editableProfile.spouseOccupation,
          spouseAddress: editableProfile.spouseAddress,
          fatherName: editableProfile.fatherName,
          motherName: editableProfile.motherName,
          children: editableProfile.children || [],
          education: editableProfile.education || [],
          eligibility: editableProfile.eligibility || [],
          workExperience: editableProfile.workExperience || [],
          communityInvolvement: editableProfile.communityInvolvement || [],
          learningAndDevelopment: editableProfile.learningAndDevelopment || [],
          trainings: editableProfile.trainings || [],
          otherInformation: editableProfile.otherInformation || { skills: '', recognitions: '', memberships: '' },
          legalResponses: editableProfile.legalResponses || {},
          references: editableProfile.references || []
        },
        reason: changeReason
      });

      setSuccess(true);
      setHasPendingRequest(true);
      setIsEditing(false);
      setChangeReason('');
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting change request:', error);
      setError(error.response?.data?.message || 'Failed to submit profile change request');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = useCallback((status) => {
    const colors = {
      active: 'bg-green-100 text-green-700 border-green-200',
      probationary: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'part-time': 'bg-blue-100 text-blue-700 border-blue-200',
      'job-order': 'bg-purple-100 text-purple-700 border-purple-200',
      contractual: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      resigned: 'bg-gray-100 text-gray-700 border-gray-200',
      terminated: 'bg-red-100 text-red-700 border-red-200',
      retired: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchProfileData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Success Message */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle size={20} className="mr-2" />
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-xl relative group">
                <div className="w-full h-full rounded-xl bg-white overflow-hidden relative">
                  {profileImagePreview || profile?.profileImage ? (
                    <>
                      <img 
                        src={profileImagePreview || `${API_BASE_URL}${profile.profileImage}`} 
                        alt={profile?.fullName || "Profile"} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 items-center justify-center absolute inset-0">
                        <User size={64} className="text-blue-600" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <User size={64} className="text-blue-600" />
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 flex flex-col gap-1 items-center justify-center bg-black bg-opacity-60 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer z-10">
                      <Camera size={28} className="text-white" />
                      <span className="text-white text-xs font-bold">Change Photo</span>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" 
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  {profileImagePreview && isEditing && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg z-20">
                      <CheckCircle size={18} />
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-xl z-20">
                      <Loader size={36} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="ml-4 mt-2 text-xs text-gray-500 max-w-xs">
                  <p className="flex items-center gap-1">
                    <Upload size={12} />
                    Click photo to upload (Max 5MB: JPG, PNG, GIF)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{profile.fullName}</h1>
                <div className="flex items-center gap-3 mt-2">
                  {contract && (
                    <p className="text-gray-600 font-medium flex items-center">
                      <Briefcase size={16} className="mr-2" />
                      {contract.position}
                    </p>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(profile.status)}`}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </span>
                </div>
              </div>
              {!isEditing ? (
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleEditToggle}
                    disabled={hasPendingRequest}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit size={16} />
                    Edit Profile
                  </button>
                  {hasPendingRequest && (
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Pending change request
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditToggle}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestChange}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {saving ? 'Submitting...' : 'Request Approval'}
                  </button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Change Request *
                </label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Please explain why you need to update your profile information..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows="3"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Your changes will be reviewed by HR before being applied to your profile.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-gray-50 p-6 rounded-xl">
              <div className="hidden md:block md:col-span-3">
                <div className="sticky top-28 border rounded-xl p-4 bg-white shadow-sm">
                  <p className="text-sm font-bold mb-4 text-gray-800 uppercase tracking-wide">Quick Jump</p>
                  <ul className="space-y-1">
                    {['all','personal','family','education','work','ids','address','emergency','trainings','other','legal','references'].map(tab => (
                      <li key={tab}>
                        <button onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`text-left w-full px-3 py-2 rounded-lg text-sm transition-all ${activeTab===tab? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>{tab === 'all' ? 'Show All' : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:col-span-9">
                {(activeTab === 'all' || activeTab === 'personal') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Contact Information</h3>
                    <div className="space-y-5">
                      <ProfileField
                        label="Full Name"
                        value={editableProfile.fullName}
                        name="fullName"
                        isEditing={isEditing}
                        onChange={handleInputChange}
                        icon={<User size={20} />}
                      />
                      <ProfileField
                        label="Email Address"
                        value={editableProfile.email}
                        name="email"
                        isEditing={isEditing}
                        onChange={handleInputChange}
                        type="email"
                        icon={<Mail size={20} />}
                      />
                      <ProfileField
                        label="Contact Number"
                        value={editableProfile.contactNumber}
                        name="contactNumber"
                        isEditing={isEditing}
                        onChange={handleInputChange}
                        type="tel"
                        icon={<Phone size={20} />}
                      />
                    </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'work') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Employment Details</h3>
                    <div className="space-y-5">
                      <ProfileField
                        label="Employee ID"
                        value={profile.employeeId}
                        name="employeeId"
                        isEditing={false}
                        icon={<IdCard size={20} />}
                      />
                      <ProfileField
                        label="Role"
                        value={profile.role.toUpperCase()}
                        name="role"
                        isEditing={false}
                        icon={<Shield size={20} />}
                      />
                      <ProfileField
                        label="Joined On"
                        value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        name="createdAt"
                        isEditing={false}
                        icon={<Calendar size={20} />}
                      />
                    </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'personal') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                <Heart size={20} className="text-purple-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Surname"
                  value={editableProfile.surname}
                  name="surname"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="First Name"
                  value={editableProfile.firstName}
                  name="firstName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Middle Name"
                  value={editableProfile.middleName}
                  name="middleName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Suffix"
                  value={editableProfile.suffix}
                  name="suffix"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="select"
                  options={['Jr.', 'Sr.', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Date of Birth"
                  value={editableProfile.dateOfBirth}
                  name="dateOfBirth"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="date"
                  icon={<Calendar size={20} />}
                />
                <ProfileField
                  label="Age"
                  value={editableProfile.age}
                  name="age"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="number"
                  icon={<Calendar size={20} />}
                />
                <ProfileField
                  label="Place of Birth"
                  value={editableProfile.placeOfBirth}
                  name="placeOfBirth"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<MapPin size={20} />}
                />
                <ProfileField
                  label="Sex"
                  value={editableProfile.sex}
                  name="sex"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="select"
                  options={['Male', 'Female']}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Civil Status"
                  value={editableProfile.civilStatus}
                  name="civilStatus"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="select"
                  options={['Single', 'Married', 'Widowed', 'Separated', 'Annulled']}
                  icon={<Heart size={20} />}
                />
                <ProfileField
                  label="Religion"
                  value={editableProfile.religion}
                  name="religion"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Heart size={20} />}
                />
                <ProfileField
                  label="Contract Number"
                  value={editableProfile.contractNumber}
                  name="contractNumber"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Briefcase size={20} />}
                />
                <ProfileField
                  label="Blood Type"
                  value={editableProfile.bloodType}
                  name="bloodType"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Heart size={20} />}
                />
                <ProfileField
                  label="Citizenship"
                  value={editableProfile.citizenship}
                  name="citizenship"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Shield size={20} />}
                />
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'ids') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                <IdCard size={20} className="text-green-600" />
                Government IDs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="GSIS ID No."
                  value={editableProfile.gsisIdNo}
                  name="gsisIdNo"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<IdCard size={20} />}
                />
                <ProfileField
                  label="PAG-IBIG ID No."
                  value={editableProfile.pagibigIdNo}
                  name="pagibigIdNo"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<IdCard size={20} />}
                />
                <ProfileField
                  label="PhilHealth No."
                  value={editableProfile.philhealthNo}
                  name="philhealthNo"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<IdCard size={20} />}
                />
                <ProfileField
                  label="SSS No."
                  value={editableProfile.sssNo}
                  name="sssNo"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<IdCard size={20} />}
                />
                <ProfileField
                  label="TIN No."
                  value={editableProfile.tinNo}
                  name="tinNo"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<IdCard size={20} />}
                />
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'address') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                <MapPin size={20} className="text-orange-600" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <ProfileField
                  label="Residential Address"
                  value={editableProfile.residentialAddress}
                  name="residentialAddress"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="textarea"
                  icon={<MapPin size={20} />}
                />
                <ProfileField
                  label="Residential ZIP Code"
                  value={editableProfile.residentialZip}
                  name="residentialZip"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<MapPin size={20} />}
                />
                <ProfileField
                  label="Permanent Address"
                  value={editableProfile.permanentAddress}
                  name="permanentAddress"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="textarea"
                  icon={<MapPin size={20} />}
                />
                <ProfileField
                  label="Permanent ZIP Code"
                  value={editableProfile.permanentZip}
                  name="permanentZip"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<MapPin size={20} />}
                />
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'emergency') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ProfileField
                  label="Contact Person Name"
                  value={editableProfile.emergencyContactName}
                  name="emergencyContactName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Contact Number"
                  value={editableProfile.emergencyContactNumber}
                  name="emergencyContactNumber"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  type="tel"
                  icon={<Phone size={20} />}
                />
                <ProfileField
                  label="Relationship"
                  value={editableProfile.emergencyContactRelationship}
                  name="emergencyContactRelationship"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Heart size={20} />}
                />
              </div>
              <div className="mt-4">
                <ProfileField
                  label="Emergency Contact Address"
                  value={editableProfile.emergencyContactAddress}
                  name="emergencyContactAddress"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="textarea"
                  icon={<MapPin size={20} />}
                />
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'family') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                Family Background
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Spouse Name"
                  value={editableProfile.spouseName}
                  name="spouseName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Spouse Contact No."
                  value={editableProfile.spouseContactNumber}
                  name="spouseContactNumber"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Phone size={20} />}
                />
                <ProfileField
                  label="Spouse Occupation"
                  value={editableProfile.spouseOccupation}
                  name="spouseOccupation"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<Briefcase size={20} />}
                />
                <ProfileField
                  label="Spouse Address"
                  value={editableProfile.spouseAddress}
                  name="spouseAddress"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  as="textarea"
                  icon={<MapPin size={20} />}
                />
                <ProfileField
                  label="Father's Name"
                  value={editableProfile.fatherName}
                  name="fatherName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
                <ProfileField
                  label="Mother's Name"
                  value={editableProfile.motherName}
                  name="motherName"
                  isEditing={isEditing}
                  onChange={handleInputChange}
                  icon={<User size={20} />}
                />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Children (chronological from eldest)</h4>
                <div className="space-y-3">
                  {((editableProfile.children || []).slice().sort((a,b) => {
                    const da = a?.dob ? new Date(a.dob) : new Date(0);
                    const db = b?.dob ? new Date(b.dob) : new Date(0);
                    return da - db; // eldest (earliest dob) first
                  })).map((child, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-400 mb-1">Full Name</p>
                        {isEditing ? (
                          <input
                            type="text"
                            value={child.fullName || ''}
                            onChange={(e) => updateChild(idx, 'fullName', e.target.value)}
                            className="w-full font-medium border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 px-2 py-1 rounded"
                          />
                        ) : (
                          <p className="font-medium break-words">{child.fullName || 'Not provided'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Date of Birth</p>
                        {isEditing ? (
                          <input
                            type="date"
                            value={child.dob || ''}
                            onChange={(e) => updateChild(idx, 'dob', e.target.value)}
                            className="w-full font-medium border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 px-2 py-1 rounded"
                          />
                        ) : (
                          <p className="font-medium break-words">{child.dob || 'Not provided'}</p>
                        )}
                      </div>
                      <div className="flex items-end">
                        {isEditing && (
                          <button type="button" onClick={() => removeChild(idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="mt-4">
                    <button type="button" onClick={addChild} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Child</button>
                  </div>
                )}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'education') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Educational Background</h3>
              <div className="space-y-3">
                {(editableProfile.education || []).map((ed, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Degree / Course</p>
                      {isEditing ? (
                        <input type="text" value={ed.degree || ''} onChange={(e) => updateItem('education', idx, 'degree', e.target.value)} className="w-full font-medium border-b-2 border-blue-200 px-2 py-1 rounded" />
                      ) : <p>{ed.degree || 'Not provided'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">School</p>
                      {isEditing ? (
                        <input type="text" value={ed.school || ''} onChange={(e) => updateItem('education', idx, 'school', e.target.value)} className="w-full font-medium border-b-2 border-blue-200 px-2 py-1 rounded" />
                      ) : <p>{ed.school || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">
                      {isEditing && <button onClick={() => removeItem('education', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}
                    </div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('education', { degree: '', school: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Education</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'work') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Eligibility</h3>
              <div className="space-y-3">
                {(editableProfile.eligibility || []).map((el, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Eligibility</p>
                      {isEditing ? <input type="text" value={el.title || ''} onChange={(e) => updateItem('eligibility', idx, 'title', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{el.title || 'Not provided'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Rating / Date</p>
                      {isEditing ? <input type="text" value={el.rating || ''} onChange={(e) => updateItem('eligibility', idx, 'rating', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{el.rating || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('eligibility', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('eligibility', { title: '', rating: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Eligibility</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'work') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Work Experience</h3>
              <div className="space-y-3">
                {(editableProfile.workExperience || []).map((we, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Company / Position</p>
                      {isEditing ? <input type="text" value={we.company || ''} onChange={(e) => updateItem('workExperience', idx, 'company', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{we.company || 'Not provided'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Period</p>
                      {isEditing ? <input type="text" value={we.period || ''} onChange={(e) => updateItem('workExperience', idx, 'period', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{we.period || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('workExperience', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('workExperience', { company: '', period: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Work Experience</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'other') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Voluntary Community Involvement</h3>
              <div className="space-y-3">
                {(editableProfile.communityInvolvement || []).map((ci, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Organization / Role</p>
                      {isEditing ? <input type="text" value={ci.organization || ''} onChange={(e) => updateItem('communityInvolvement', idx, 'organization', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{ci.organization || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('communityInvolvement', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('communityInvolvement', { organization: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Involvement</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'trainings') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Learning and Development</h3>
              <div className="space-y-3">
                {(editableProfile.learningAndDevelopment || []).map((ld, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Title</p>
                      {isEditing ? <input type="text" value={ld.title || ''} onChange={(e) => updateItem('learningAndDevelopment', idx, 'title', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{ld.title || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('learningAndDevelopment', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('learningAndDevelopment', { title: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Item</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'trainings') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Trainings / Seminars Attended</h3>
              <div className="space-y-3">
                {(editableProfile.trainings || []).map((tr, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Title / Provider</p>
                      {isEditing ? <input type="text" value={tr.title || ''} onChange={(e) => updateItem('trainings', idx, 'title', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{tr.title || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('trainings', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('trainings', { title: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Training</button>}
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'other') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Other Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <ProfileField label="Special Skills" value={editableProfile.otherInformation?.skills} name="otherInformation.skills" isEditing={isEditing} onChange={handleInputChange} as="textarea" icon={<User size={20} />} />
                <ProfileField label="Recognitions Received" value={editableProfile.otherInformation?.recognitions} name="otherInformation.recognitions" isEditing={isEditing} onChange={handleInputChange} as="textarea" icon={<Heart size={20} />} />
                <ProfileField label="Membership in Organizations" value={editableProfile.otherInformation?.memberships} name="otherInformation.memberships" isEditing={isEditing} onChange={handleInputChange} as="textarea" icon={<Building2 size={20} />} />
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'legal') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Other Information — Declarations</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Have you ever been found guilty of any administrative offense?</p>
                  {isEditing ? (
                    <div className="mt-1">
                      <select value={editableProfile.legalResponses?.adminOffense?.answered ? 'yes' : 'no'} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, adminOffense: { ...editableProfile.legalResponses?.adminOffense, answered: e.target.value === 'yes' } } })} className="border rounded-lg px-3 py-2 bg-white font-medium">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {editableProfile.legalResponses?.adminOffense?.answered && (
                        <textarea value={editableProfile.legalResponses?.adminOffense?.details || ''} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, adminOffense: { ...editableProfile.legalResponses?.adminOffense, details: e.target.value } } })} placeholder="Please provide details..." className="w-full mt-3 border rounded-lg px-3 py-2" rows="3" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">{editableProfile.legalResponses?.adminOffense?.answered ? editableProfile.legalResponses?.adminOffense?.details || 'Yes' : 'No'}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Have you been criminally charged?</p>
                  {isEditing ? (
                    <div className="mt-1">
                      <select value={editableProfile.legalResponses?.criminalCharge?.answered ? 'yes' : 'no'} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, criminalCharge: { ...editableProfile.legalResponses?.criminalCharge, answered: e.target.value === 'yes' } } })} className="border rounded-lg px-3 py-2 bg-white font-medium">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {editableProfile.legalResponses?.criminalCharge?.answered && (
                        <textarea value={editableProfile.legalResponses?.criminalCharge?.details || ''} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, criminalCharge: { ...editableProfile.legalResponses?.criminalCharge, details: e.target.value } } })} placeholder="Please provide details..." className="w-full mt-3 border rounded-lg px-3 py-2" rows="3" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">{editableProfile.legalResponses?.criminalCharge?.answered ? editableProfile.legalResponses?.criminalCharge?.details || 'Yes' : 'No'}</p>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Have you been separated from service (resignation, retirement, termination, end/finish of contract)?</p>
                  {isEditing ? (
                    <div className="mt-1">
                      <select value={editableProfile.legalResponses?.separatedFromService?.answered ? 'yes' : 'no'} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, separatedFromService: { ...editableProfile.legalResponses?.separatedFromService, answered: e.target.value === 'yes' } } })} className="border rounded-lg px-3 py-2 bg-white font-medium">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                      {editableProfile.legalResponses?.separatedFromService?.answered && (
                        <textarea value={editableProfile.legalResponses?.separatedFromService?.details || ''} onChange={(e) => setEditableProfile({ ...editableProfile, legalResponses: { ...editableProfile.legalResponses, separatedFromService: { ...editableProfile.legalResponses?.separatedFromService, details: e.target.value } } })} placeholder="Please provide details..." className="w-full mt-3 border rounded-lg px-3 py-2" rows="3" />
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">{editableProfile.legalResponses?.separatedFromService?.answered ? editableProfile.legalResponses?.separatedFromService?.details || 'Yes' : 'No'}</p>
                  )}
                </div>
              </div>
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'references') && (
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">References (not related by consanguinity or affinity)</h3>
              <div className="space-y-3">
                {(editableProfile.references || []).map((ref, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Name</p>
                      {isEditing ? <input type="text" value={ref.name || ''} onChange={(e) => updateItem('references', idx, 'name', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{ref.name || 'Not provided'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Address</p>
                      {isEditing ? <input type="text" value={ref.address || ''} onChange={(e) => updateItem('references', idx, 'address', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{ref.address || 'Not provided'}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Tel. No.</p>
                      {isEditing ? <input type="text" value={ref.tel || ''} onChange={(e) => updateItem('references', idx, 'tel', e.target.value)} className="w-full border-b-2 px-2 py-1" /> : <p>{ref.tel || 'Not provided'}</p>}
                    </div>
                    <div className="flex items-end">{isEditing && <button onClick={() => removeItem('references', idx)} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium">Remove</button>}</div>
                  </div>
                ))}
                {isEditing && <button onClick={() => addItem('references', { name: '', address: '', tel: '' })} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">+ Add Reference</button>}
              </div>
                  </div>
                )}

                {/* Contract Information */}
            {contract && (
              <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100">Current Contract</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contract Type</p>
                      <p className="font-semibold text-gray-800 capitalize">{contract.contractType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Position</p>
                      <p className="font-semibold text-gray-800">{contract.position}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Department</p>
                      <p className="font-semibold text-gray-800">{contract.department}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Contract Period</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(contract.startDate).toLocaleDateString()} - {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
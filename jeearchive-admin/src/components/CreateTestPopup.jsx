// src/components/CreateTestPopup.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useTest from '../hooks/useTest';
import "./CreateTestPopup.css"
import { IoClose } from "react-icons/io5";


const CreateTestPopup = ({ onClose }) => {
  const { fetchTests } = useTest();

  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    totalMarks: '',
    date: '',
    shift: '',
    type: '',
    instructions: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error('Unauthorized');
        return;
      }

      await api.post('/test', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Test created successfully');
      await fetchTests();     // ✅ refresh test list
      onClose();              // ✅ close the popup
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create test');
    }
  };

  return (
    <div className='test-popup'>
      <div className="test-popup-heading">
        <p className="heading">Create Test</p>
      </div>
      <IoClose className='close-icon' onClick={onClose}/>
      <form onSubmit={handleSubmit}>
        <input name="title" type='text' placeholder="Title" onChange={handleChange} required />
        <input name="duration" type='number' placeholder="Duration(min)" onChange={handleChange} />
        <input name="totalMarks" type="number" placeholder="Total Marks" onChange={handleChange} />
        <input name="date" type="text" placeholder="25 May 2025" onChange={handleChange} required />
        <input name="shift" type="text" placeholder="Shift 1/ Paper 1" onChange={handleChange} required />
        <select name="type" onChange={handleChange} value={formData.type} required>
          <option value="" disabled>Select Type</option>
          <option value="Mains">Mains</option>
          <option value="Advance">Advance</option>
        </select>
        <textarea name="instructions" type="text" placeholder='Instructions' onChange={handleChange}></textarea>
        <button type="submit">Create Test</button>
      </form>
    </div>
  );
};

export default CreateTestPopup;

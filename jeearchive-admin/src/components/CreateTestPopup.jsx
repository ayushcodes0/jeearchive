import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useTest from '../hooks/useTest';
import "./CreateTestPopup.css";
import { IoClose } from "react-icons/io5";

const CreateTestPopup = ({ onClose, message, testData }) => {
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

  // ⏬ Autofill form if testData is provided
  useEffect(() => {
    if (testData) {
      setFormData({
        title: testData.title || '',
        duration: testData.duration || '',
        totalMarks: testData.totalMarks || '',
        date: testData.date || '',
        shift: testData.shift || '',
        type: testData.type || '',
        instructions: testData.instructions || ''
      });
    }
  }, [testData]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    if (!token) {
      toast.error('Unauthorized');
      return;
    }

    try {
      if (message === "Edit Test") {
        // 🔁 EDIT: PUT request
        await api.put(`/test/edit/${testData._id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Test updated successfully');
      } else {
        // ➕ CREATE: POST request
        await api.post('/test', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Test created successfully');
      }

      await fetchTests();
      onClose();

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className='test-popup'>
      <div className="test-popup-heading">
        <p className="heading">{message}</p>
      </div>
      <IoClose className='close-icon' onClick={onClose} />
      <form onSubmit={handleSubmit}>
        <input name="title" type='text' placeholder="Title" value={formData.title} onChange={handleChange} required />
        <input name="duration" type='number' placeholder="Duration(min)" value={formData.duration} onChange={handleChange} />
        <input name="totalMarks" type="number" placeholder="Total Marks" value={formData.totalMarks} onChange={handleChange} />
        <input name="date" type="text" placeholder="25 May 2025" value={formData.date} onChange={handleChange} required />
        <input name="shift" type="text" placeholder="Shift 1 / Paper 1" value={formData.shift} onChange={handleChange} required />
        <select name="type" onChange={handleChange} value={formData.type} required>
          <option value="" disabled>Select Type</option>
          <option value="Mains">Mains</option>
          <option value="Advance">Advance</option>
        </select>
        <textarea name="instructions" placeholder='Instructions' value={formData.instructions} onChange={handleChange}></textarea>
        <button type="submit">{message === "Edit Test" ? "Update Test" : "Create Test"}</button>
      </form>
    </div>
  );
};

export default CreateTestPopup;

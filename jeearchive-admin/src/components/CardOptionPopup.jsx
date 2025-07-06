import React, { useState } from 'react';
import './CardOptionPopup.css';
import { MdUpload } from 'react-icons/md';
import { AiFillEdit } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import useTest from '../hooks/useTest';
import ConfirmModal from './ConfirmModal'; 

const CardOptionPopup = ({ testId }) => {
  const { fetchTests } = useTest();
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ----- DELETE HANDLER ----- 
  const handleDelete = async () => {
    setConfirmOpen(false);               
    try {
      const token = localStorage.getItem('admin_token');
      await api.delete(`/test/delete/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Test deleted successfully');
      fetchTests();                    
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete test');
    }
  };

  return (
    <>
      <div className="card-option-popup">
        <p>
          <MdUpload className="options" />
          <span>Upload</span>
        </p>

        <p>
          <AiFillEdit className="options" />
          <span>Edit</span>
        </p>

        <p onClick={() => setConfirmOpen(true)}>
          <MdDelete className="options" />
          <span>Delete</span>
        </p>
      </div>

      {/* 🔹 Confirmation dialog */}
      <ConfirmModal
        isOpen={confirmOpen}
        message="Are you sure you want to delete this test?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default CardOptionPopup;

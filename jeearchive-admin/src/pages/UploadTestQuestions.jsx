import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import './UploadTestQuestions.css';

const UploadTestQuestions = () => {
  const { state } = useLocation();
  const testId = state?.testId;
  const [rawJson, setRawJson] = useState('');


  const handleSubmit = async () => {
    if (!rawJson.trim()) {
      toast.error('Please paste the JSON payload first.');
      return;
    }

    let payload;
    try {
      payload = JSON.parse(rawJson.trim());
      if (!Array.isArray(payload.questions)) {
        throw new Error('Payload must contain a "questions" array.');
      }
    } catch (err) {
      toast.error(`Invalid JSON: ${err.message}`);
      return;
    }

    if (testId) {
      payload.questions = payload.questions.map(q => ({
        ...q,
        test: testId,                 // <— key change
      }));
    }

    try {
      await api.post('/question/bulk', payload);
      toast.success(`${payload.questions.length} questions uploaded!`);
      setRawJson('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    }
  };

  return (
    <div className="upload-test-container">
      <h1 className="upload-heading">Bulk Upload Questions</h1>
      <textarea
        rows={20}
        placeholder="Paste the entire JSON payload here"
        value={rawJson}
        onChange={e => setRawJson(e.target.value)}
        className="json-input"
      />

      <button onClick={handleSubmit} className="upload-btn">
        Upload
      </button>
    </div>
  );
};

export default UploadTestQuestions;

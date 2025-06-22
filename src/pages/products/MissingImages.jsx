 import React, { useEffect, useState } from 'react';
import API from '../../services/api';

const fetchMedicinesWithoutImages = async () => {
  const res = await API.get('/medicines/no-images');
  return res.data;
};

const fetchSuggestedImage = async (productName, id) => {
  const res = await API.get(`/medicines/suggest-image?name=${encodeURIComponent(productName)}&id=${id}`);
  return res.data.imageUrl;
};

const approveImage = async (medicineId, imageUrl) => {
  await API.put(`/medicines/${medicineId}/add-image`, { imageUrl });
};

export default function MissingImages() {
  const [medicines, setMedicines] = useState([]);
  const [suggestedImages, setSuggestedImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setError(null);
    setStatus('');
    fetchMedicinesWithoutImages()
      .then(setMedicines)
      .catch(() => setError('Failed to load medicines without images.'));
  }, []);

  const handleSuggest = async (med) => {
    setLoading(true);
    setLoadingId(med._id);
    setError(null);
    setStatus('');
    try {
      const imageUrl = await fetchSuggestedImage(med.productName, med._id);
      if (imageUrl) {
        setSuggestedImages((prev) => ({ ...prev, [med._id]: imageUrl }));
        setStatus('Image suggested! You can approve or reject.');
      } else {
        setStatus('No image found for this medicine.');
      }
    } catch (err) {
      setError('Failed to fetch suggested image.');
    }
    setLoading(false);
    setLoadingId(null);
  };


  const handleApprove = async (med) => {
    const imageUrl = suggestedImages[med._id];
    if (!imageUrl) return;
    setLoading(true);
    setLoadingId(med._id);
    setError(null);
    setStatus('');
    try {
      await approveImage(med._id, imageUrl);
      setMedicines((prev) => prev.filter((m) => m._id !== med._id));
      setStatus('Image approved and saved!');
    } catch (err) {
      setError('Failed to approve image.');
    }
    setLoading(false);
    setLoadingId(null);
  };

  const handleReject = (med) => {
    setSuggestedImages((prev) => ({ ...prev, [med._id]: null }));
    setStatus('Image rejected.');
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 28, marginBottom: 20 }}>Medicines Without Images</h2>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      {status && <div style={{ color: '#007bff', marginBottom: 10 }}>{status}</div>}
      {medicines.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <span role="img" aria-label="celebrate" style={{ fontSize: 48 }}>🎉</span>
          <p style={{ fontSize: 20, marginTop: 10 }}>All medicines have images</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {medicines.map((med) => (
            <div key={med._id} style={{
              border: '1px solid #eee',
              borderRadius: 12,
              boxShadow: '0 2px 8px #f0f1f2',
              padding: 24,
              width: 260,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 20,
              background: '#fff',
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{med.productName}</div>
              <div style={{ color: '#888', fontSize: 14, marginBottom: 10 }}>{med.manufacturer}</div>
              <div style={{ marginBottom: 16, minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {suggestedImages[med._id] === undefined ? (
                  <button
                    disabled={loading && loadingId === med._id}
                    onClick={() => handleSuggest(med)}
                    style={{ padding: '6px 16px', borderRadius: 6, background: '#007bff', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    {loading && loadingId === med._id ? 'Loading...' : 'Suggest Image'}
                  </button>
                ) : suggestedImages[med._id] === null ? (
                  <span style={{ color: '#888' }}>No image found.</span>
                ) : (
                  <img
                    src={suggestedImages[med._id]}
                    alt={med.productName}
                    style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee', background: '#fafafa' }}
                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                  />
                )}
              </div>
              {suggestedImages[med._id] && suggestedImages[med._id] !== null && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    disabled={loading && loadingId === med._id}
                    onClick={() => handleApprove(med)}
                    style={{ padding: '6px 12px', borderRadius: 6, background: '#28a745', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {loading && loadingId === med._id ? 'Saving...' : 'Approve'}
                  </button>
                  <button
                    disabled={loading && loadingId === med._id}
                    onClick={() => handleReject(med)}
                    style={{ padding: '6px 12px', borderRadius: 6, background: '#dc3545', color: '#fff', border: 'none', fontWeight: 500, cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

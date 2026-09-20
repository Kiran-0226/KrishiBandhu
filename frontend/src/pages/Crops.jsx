import {
  useEffect,
  useState,
} from 'react';

import PageHeader from '../components/PageHeader';
import CropForm from '../components/CropForm';

import { useAuth } from '../context/AuthContext';

import API_URL from '../config/api';

import './Crops.css';

const API_BASE_URL = API_URL;

function Crops() {
  const {
    token,
    user,
  } = useAuth();

  const [crops, setCrops] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [showForm, setShowForm] =
    useState(false);

  const [editingCrop, setEditingCrop] =
    useState(null);

  const [deletingCropId, setDeletingCropId] =
    useState(null);

  // ==========================================
  // Fetch Farmer's Crops
  // ==========================================

  const fetchCrops = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/crops`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Failed to fetch crops.',
        );
      }

      if (result.success) {
        setCrops(result.data);
      } else {
        throw new Error(
          result.message ||
            'Failed to fetch crops.',
        );
      }
    } catch (err) {
      console.error(
        'Fetch crops error:',
        err,
      );

      setError(
        err.message ||
          'Unable to load crops. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load crops after authentication
  // ==========================================

  useEffect(() => {
    if (token) {
      fetchCrops();
    }
  }, [token]);

  // ==========================================
  // Crop Added
  // ==========================================

  const handleCropAdded = (
    newCrop,
  ) => {
    setCrops(
      (previousCrops) => [
        newCrop,
        ...previousCrops,
      ],
    );

    setShowForm(false);
  };

  // ==========================================
  // Edit Crop
  // ==========================================

  const handleEdit = (
    crop,
  ) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  // ==========================================
  // Crop Updated
  // ==========================================

  const handleCropUpdated = (
    updatedCrop,
  ) => {
    setCrops(
      (previousCrops) =>
        previousCrops.map(
          (crop) =>
            crop._id ===
            updatedCrop._id
              ? updatedCrop
              : crop,
        ),
    );

    setEditingCrop(null);
    setShowForm(false);
  };

  // ==========================================
  // Cancel Form
  // ==========================================

  const handleCancel = () => {
    setEditingCrop(null);
    setShowForm(false);
  };

  // ==========================================
  // Delete Crop
  // ==========================================

  const handleDelete = async (
    cropId,
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this crop?',
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCropId(cropId);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/crops/${cropId}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            'Failed to delete crop.',
        );
      }

      setCrops(
        (previousCrops) =>
          previousCrops.filter(
            (crop) =>
              crop._id !== cropId,
          ),
      );
    } catch (err) {
      console.error(
        'Delete crop error:',
        err,
      );

      setError(
        err.message ||
          'Unable to delete crop.',
      );
    } finally {
      setDeletingCropId(null);
    }
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <main className="dashboard">

      <PageHeader
        title="My Crops"
        description="Manage and monitor your crops."
      />

      {showForm ? (

        <CropForm
          crop={editingCrop}
          token={token}
          onCropAdded={
            handleCropAdded
          }
          onCropUpdated={
            handleCropUpdated
          }
          onCancel={
            handleCancel
          }
        />

      ) : (

        <div className="crops-page-card">

          {/* ==================================
              Header
          ================================== */}

          <div className="crops-section-header">

            <div>

              <h2>
                Your Crops
              </h2>

              {!loading &&
                !error && (
                  <p>
                    {user?.name
                      ? `${user.name}, you currently have `
                      : 'You currently have '}

                    {crops.length}{' '}

                    {crops.length === 1
                      ? 'crop'
                      : 'crops'}.
                  </p>
                )}

            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setEditingCrop(null);
                setShowForm(true);
              }}
            >
              + Add Crop
            </button>

          </div>

          {/* ==================================
              Loading
          ================================== */}

          {loading && (
            <div className="crops-message">
              <p>
                Loading your crops...
              </p>
            </div>
          )}

          {/* ==================================
              Error
          ================================== */}

          {error && (
            <div className="crops-message crops-error">
              <p>
                {error}
              </p>

              <button
                type="button"
                className="primary-button"
                onClick={fetchCrops}
              >
                Try Again
              </button>
            </div>
          )}

          {/* ==================================
              Empty State
          ================================== */}

          {!loading &&
            !error &&
            crops.length === 0 && (

              <div className="crops-message">

                <div className="empty-crop-icon">
                  🌱
                </div>

                <h3>
                  No crops added yet
                </h3>

                <p>
                  Add your first crop to
                  start managing your farm
                  information.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    setEditingCrop(null);
                    setShowForm(true);
                  }}
                >
                  Add Your First Crop
                </button>

              </div>

            )}

          {/* ==================================
              Crop Cards
          ================================== */}

          {!loading &&
            !error &&
            crops.length > 0 && (

              <div className="crops-grid">

                {crops.map(
                  (crop) => (

                    <div
                      className="crop-card"
                      key={crop._id}
                    >

                      <div className="crop-card-top">

                        <div className="crop-icon">
                          🌱
                        </div>

                        <span
                          className={`crop-status status-${crop.status}`}
                        >
                          {crop.status}
                        </span>

                      </div>

                      <div className="crop-card-title">

                        <h3>
                          {crop.name}
                        </h3>

                        {crop.variety && (
                          <p>
                            {crop.variety}
                          </p>
                        )}

                      </div>

                      <div className="crop-card-details">

                        <div className="crop-detail">

                          <span className="detail-label">
                            Area
                          </span>

                          <strong>
                            {crop.area}{' '}
                            {crop.areaUnit}
                          </strong>

                        </div>

                        {crop.sowingDate && (

                          <div className="crop-detail">

                            <span className="detail-label">
                              Sowing Date
                            </span>

                            <strong>
                              {new Date(
                                crop.sowingDate,
                              ).toLocaleDateString()}
                            </strong>

                          </div>

                        )}

                        {crop.expectedHarvestDate && (

                          <div className="crop-detail">

                            <span className="detail-label">
                              Expected Harvest
                            </span>

                            <strong>
                              {new Date(
                                crop.expectedHarvestDate,
                              ).toLocaleDateString()}
                            </strong>

                          </div>

                        )}

                      </div>

                      {crop.notes && (

                        <div className="crop-notes">

                          <span>
                            {crop.notes}
                          </span>

                        </div>

                      )}

                      <div className="crop-card-actions">

                        <button
                          type="button"
                          className="edit-crop-button"
                          onClick={() =>
                            handleEdit(crop)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-crop-button"
                          onClick={() =>
                            handleDelete(
                              crop._id,
                            )
                          }
                          disabled={
                            deletingCropId ===
                            crop._id
                          }
                        >
                          {deletingCropId ===
                          crop._id
                            ? 'Deleting...'
                            : '🗑️ Delete'}
                        </button>

                      </div>

                    </div>

                  ),
                )}

              </div>

            )}

        </div>

      )}

    </main>
  );
}

export default Crops;
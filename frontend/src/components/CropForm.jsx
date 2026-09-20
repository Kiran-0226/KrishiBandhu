import {
  useEffect,
  useState,
} from 'react';

import API_URL from '../config/api';

import './CropForm.css';

function CropForm({
  crop,
  token,
  onCropAdded,
  onCropUpdated,
  onCancel,
}) {
  const [formData, setFormData] =
    useState({
      name: '',
      variety: '',
      area: '',
      areaUnit: 'acre',
      sowingDate: '',
      expectedHarvestDate: '',
      status: 'planned',
      notes: '',
    });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const isEditing =
    Boolean(crop);


  // ==========================================
  // Load crop data when editing
  // ==========================================

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || '',
        variety: crop.variety || '',
        area: crop.area ?? '',
        areaUnit:
          crop.areaUnit || 'acre',

        sowingDate:
          crop.sowingDate
            ? crop.sowingDate.slice(0, 10)
            : '',

        expectedHarvestDate:
          crop.expectedHarvestDate
            ? crop.expectedHarvestDate.slice(
                0,
                10,
              )
            : '',

        status:
          crop.status || 'planned',

        notes:
          crop.notes || '',
      });
    } else {
      setFormData({
        name: '',
        variety: '',
        area: '',
        areaUnit: 'acre',
        sowingDate: '',
        expectedHarvestDate: '',
        status: 'planned',
        notes: '',
      });
    }

    setError('');
  }, [crop]);


  // ==========================================
  // Handle form changes
  // ==========================================

  const handleChange = (
    event,
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previousData) => ({
        ...previousData,
        [name]: value,
      }),
    );
  };


  // ==========================================
  // Submit
  // ==========================================

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError('');


    // ------------------------------------------
    // Authentication check
    // ------------------------------------------

    if (!token) {
      setError(
        'Your session has expired. Please login again.',
      );

      return;
    }


    // ------------------------------------------
    // Validation
    // ------------------------------------------

    if (
      !formData.name.trim()
    ) {
      setError(
        'Please enter a crop name.',
      );

      return;
    }


    if (
      !formData.area ||
      Number(formData.area) <= 0
    ) {
      setError(
        'Please enter a valid area.',
      );

      return;
    }


    // ------------------------------------------
    // API request
    // ------------------------------------------

    try {
      setSaving(true);

      const url = isEditing
        ? `${API_URL}/crops/${crop._id}`
        : `${API_URL}/crops`;

      const method =
        isEditing
          ? 'PUT'
          : 'POST';


      const response =
        await fetch(
          url,
          {
            method,

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              ...formData,

              name:
                formData.name.trim(),

              variety:
                formData.variety.trim(),

              area:
                Number(formData.area),

              notes:
                formData.notes.trim(),
            }),
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
            `Failed to ${
              isEditing
                ? 'update'
                : 'create'
            } crop.`,
        );
      }


      // ----------------------------------------
      // Notify parent component
      // ----------------------------------------

      if (isEditing) {
        onCropUpdated(
          result.data,
        );
      } else {
        onCropAdded(
          result.data,
        );
      }

    } catch (err) {
      console.error(
        isEditing
          ? 'Update crop error:'
          : 'Create crop error:',
        err,
      );

      setError(
        err.message ||
          `Unable to ${
            isEditing
              ? 'update'
              : 'save'
          } crop.`,
      );

    } finally {
      setSaving(false);
    }
  };


  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="crop-form-card">

      {/* ========================================
          Header
      ======================================== */}

      <div className="crop-form-header">

        <div>

          <h2>
            {isEditing
              ? 'Edit Crop'
              : 'Add Crop'}
          </h2>

          <p>
            {isEditing
              ? 'Update your crop details.'
              : 'Enter the details of your crop.'}
          </p>

        </div>


        <button
          type="button"
          className="crop-form-close"
          onClick={onCancel}
          aria-label="Close form"
          disabled={saving}
        >
          ×
        </button>

      </div>


      {/* ========================================
          Form
      ======================================== */}

      <form
        onSubmit={handleSubmit}
      >

        <div className="crop-form-grid">

          {/* Crop Name */}

          <div className="form-group">

            <label htmlFor="name">
              Crop Name{' '}
              <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Tomato"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* Variety */}

          <div className="form-group">

            <label htmlFor="variety">
              Variety
            </label>

            <input
              id="variety"
              name="variety"
              type="text"
              placeholder="e.g. Arka Rakshak"
              value={
                formData.variety
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* Area */}

          <div className="form-group">

            <label htmlFor="area">
              Area{' '}
              <span>*</span>
            </label>

            <input
              id="area"
              name="area"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.5"
              value={
                formData.area
              }
              onChange={
                handleChange
              }
              required
            />

          </div>


          {/* Area Unit */}

          <div className="form-group">

            <label htmlFor="areaUnit">
              Area Unit
            </label>

            <select
              id="areaUnit"
              name="areaUnit"
              value={
                formData.areaUnit
              }
              onChange={
                handleChange
              }
            >

              <option value="acre">
                Acre
              </option>

              <option value="hectare">
                Hectare
              </option>

              <option value="gunta">
                Gunta
              </option>

            </select>

          </div>


          {/* Sowing Date */}

          <div className="form-group">

            <label htmlFor="sowingDate">
              Sowing Date
            </label>

            <input
              id="sowingDate"
              name="sowingDate"
              type="date"
              value={
                formData.sowingDate
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* Expected Harvest */}

          <div className="form-group">

            <label htmlFor="expectedHarvestDate">
              Expected Harvest Date
            </label>

            <input
              id="expectedHarvestDate"
              name="expectedHarvestDate"
              type="date"
              value={
                formData.expectedHarvestDate
              }
              onChange={
                handleChange
              }
            />

          </div>


          {/* Status */}

          <div className="form-group">

            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={
                formData.status
              }
              onChange={
                handleChange
              }
            >

              <option value="planned">
                Planned
              </option>

              <option value="growing">
                Growing
              </option>

              <option value="ready">
                Ready
              </option>

              <option value="harvested">
                Harvested
              </option>

            </select>

          </div>


          {/* Notes */}

          <div className="form-group form-group-full">

            <label htmlFor="notes">
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows="4"
              placeholder="Add any additional notes..."
              value={
                formData.notes
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>


        {/* ======================================
            Error
        ====================================== */}

        {error && (
          <div className="crop-form-error">
            {error}
          </div>
        )}


        {/* ======================================
            Actions
        ====================================== */}

        <div className="crop-form-actions">

          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>


          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? isEditing
                ? 'Updating...'
                : 'Saving...'
              : isEditing
                ? 'Update Crop'
                : 'Save Crop'}
          </button>

        </div>

      </form>

    </div>
  );
}

export default CropForm;
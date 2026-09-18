import { useEffect, useState } from 'react';
import './CropForm.css';

function CropForm({
  crop,
  onCropAdded,
  onCropUpdated,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    area: '',
    areaUnit: 'acre',
    sowingDate: '',
    expectedHarvestDate: '',
    status: 'planned',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(crop);

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || '',
        variety: crop.variety || '',
        area: crop.area ?? '',
        areaUnit: crop.areaUnit || 'acre',
        sowingDate: crop.sowingDate
          ? crop.sowingDate.slice(0, 10)
          : '',
        expectedHarvestDate:
          crop.expectedHarvestDate
            ? crop.expectedHarvestDate.slice(0, 10)
            : '',
        status: crop.status || 'planned',
        notes: crop.notes || '',
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a crop name.');
      return;
    }

    if (
      !formData.area ||
      Number(formData.area) <= 0
    ) {
      setError('Please enter a valid area.');
      return;
    }

    try {
      setSaving(true);

      const url = isEditing
        ? `http://localhost:5000/api/crops/${crop._id}`
        : 'http://localhost:5000/api/crops';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          variety: formData.variety.trim(),
          area: Number(formData.area),
          notes: formData.notes.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Failed to ${
              isEditing ? 'update' : 'create'
            } crop.`
        );
      }

      if (isEditing) {
        onCropUpdated(result.data);
      } else {
        onCropAdded(result.data);
      }
    } catch (err) {
      console.error(
        isEditing
          ? 'Update crop error:'
          : 'Create crop error:',
        err
      );

      setError(
        err.message ||
          `Unable to ${
            isEditing ? 'update' : 'save'
          } crop.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="crop-form-card">
      <div className="crop-form-header">
        <div>
          <h2>
            {isEditing ? 'Edit Crop' : 'Add Crop'}
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
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="crop-form-grid">
          <div className="form-group">
            <label htmlFor="name">
              Crop Name <span>*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Tomato"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="variety">
              Variety
            </label>

            <input
              id="variety"
              name="variety"
              type="text"
              placeholder="e.g. Arka Rakshak"
              value={formData.variety}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">
              Area <span>*</span>
            </label>

            <input
              id="area"
              name="area"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 2.5"
              value={formData.area}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="areaUnit">
              Area Unit
            </label>

            <select
              id="areaUnit"
              name="areaUnit"
              value={formData.areaUnit}
              onChange={handleChange}
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

          <div className="form-group">
            <label htmlFor="sowingDate">
              Sowing Date
            </label>

            <input
              id="sowingDate"
              name="sowingDate"
              type="date"
              value={formData.sowingDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="expectedHarvestDate">
              Expected Harvest Date
            </label>

            <input
              id="expectedHarvestDate"
              name="expectedHarvestDate"
              type="date"
              value={formData.expectedHarvestDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
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

          <div className="form-group form-group-full">
            <label htmlFor="notes">
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows="4"
              placeholder="Add any additional notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && (
          <div className="crop-form-error">
            {error}
          </div>
        )}

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
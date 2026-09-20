import { useEffect, useMemo, useState } from 'react';

import {
  Warehouse,
  Snowflake,
  Search,
  MapPin,
  Package,
  Thermometer,
  IndianRupee,
  Phone,
  CheckCircle2,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import './Storage.css';

const API_URL = 'http://localhost:5000/api';

function Storage() {
  const { token } = useAuth();

  const [facilities, setFacilities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [selectedType, setSelectedType] =
    useState('all');

  const [selectedDistrict, setSelectedDistrict] =
    useState('all');

  const [selectedFacility, setSelectedFacility] =
    useState(null);

  /*
   * ==========================================
   * Fetch Storage Facilities
   * ==========================================
   */

  const fetchStorage = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_URL}/storage`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to load storage facilities.',
        );
      }

      setFacilities(
        data.data || [],
      );
    } catch (err) {
      console.error(
        'Storage fetch error:',
        err,
      );

      setError(
        err.message ||
          'Unable to load storage facilities.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorage();
  }, [token]);

  /*
   * ==========================================
   * Statistics
   * ==========================================
   */

  const coldStorageCount =
    facilities.filter(
      (facility) =>
        facility.type === 'cold_storage',
    ).length;

  const warehouseCount =
    facilities.filter(
      (facility) =>
        facility.type === 'warehouse',
    ).length;

  /*
   * ==========================================
   * District List
   * ==========================================
   */

  const districts = useMemo(() => {
    return [
      ...new Set(
        facilities
          .map(
            (facility) =>
              facility.location?.district,
          )
          .filter(Boolean),
      ),
    ].sort();
  }, [facilities]);

  /*
   * ==========================================
   * Filter Facilities
   * ==========================================
   */

  const filteredFacilities =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return facilities.filter(
        (facility) => {
          /*
           * Type
           */
          if (
            selectedType !== 'all' &&
            facility.type !==
              selectedType
          ) {
            return false;
          }

          /*
           * District
           */
          if (
            selectedDistrict !==
              'all' &&
            facility.location?.district !==
              selectedDistrict
          ) {
            return false;
          }

          /*
           * Search
           */
          if (searchValue) {
            const searchableText = [
              facility.name,

              facility.description,

              facility.location
                ?.district,

              facility.location
                ?.village,

              ...(facility.suitableCrops ||
                []),
            ]
              .join(' ')
              .toLowerCase();

            if (
              !searchableText.includes(
                searchValue,
              )
            ) {
              return false;
            }
          }

          return true;
        },
      );
    }, [
      facilities,
      search,
      selectedType,
      selectedDistrict,
    ]);

  /*
   * ==========================================
   * Format Currency
   * ==========================================
   */

  const formatCurrency = (
    amount,
  ) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(amount || 0);
  };

  /*
   * ==========================================
   * Reset Filters
   * ==========================================
   */

  const resetFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedDistrict('all');
  };

  /*
   * ==========================================
   * Loading State
   * ==========================================
   */

  if (loading) {
    return (
      <div className="storage-page">

        <div className="storage-loading">
          <RefreshCw
            size={28}
            className="storage-loading-icon"
          />

          <p>
            Loading storage facilities...
          </p>
        </div>

      </div>
    );
  }

  /*
   * ==========================================
   * Main UI
   * ==========================================
   */

  return (
    <div className="storage-page">

      {/* ======================================
          Header
      ====================================== */}

      <section className="storage-header">

        <div className="storage-header-content">

          <div className="storage-header-icon">
            <Warehouse size={30} />
          </div>

          <div>

            <p className="storage-eyebrow">
              KrishiBandhu Storage Network
            </p>

            <h1>
              Storage & Warehouses
            </h1>

            <p>
              Find suitable storage facilities
              for your agricultural produce.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="storage-refresh-button"
          onClick={fetchStorage}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </section>


      {/* ======================================
          Summary Cards
      ====================================== */}

      <section className="storage-summary">

        <div className="storage-summary-card">

          <div className="storage-summary-icon cold">
            <Snowflake size={22} />
          </div>

          <div>
            <span>
              Cold Storage
            </span>

            <strong>
              {coldStorageCount}
            </strong>

            <small>
              Temperature-controlled facilities
            </small>
          </div>

        </div>


        <div className="storage-summary-card">

          <div className="storage-summary-icon warehouse">
            <Warehouse size={22} />
          </div>

          <div>
            <span>
              Warehouses
            </span>

            <strong>
              {warehouseCount}
            </strong>

            <small>
              Dry agricultural storage
            </small>
          </div>

        </div>


        <div className="storage-summary-card">

          <div className="storage-summary-icon total">
            <Package size={22} />
          </div>

          <div>
            <span>
              Total Facilities
            </span>

            <strong>
              {facilities.length}
            </strong>

            <small>
              Available through KrishiBandhu
            </small>
          </div>

        </div>

      </section>


      {/* ======================================
          Search & Filters
      ====================================== */}

      <section className="storage-filter-panel">

        <div className="storage-search">

          <Search size={19} />

          <input
            type="text"
            placeholder="Search facility, district or crop..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch('')
              }
              className="storage-clear-search"
              aria-label="Clear search"
            >
              <X size={17} />
            </button>
          )}

        </div>


        <div className="storage-filter-group">

          <div className="storage-filter-label">
            <Filter size={16} />
            Filters
          </div>

          <select
            value={selectedDistrict}
            onChange={(event) =>
              setSelectedDistrict(
                event.target.value,
              )
            }
          >
            <option value="all">
              All Districts
            </option>

            {districts.map(
              (district) => (
                <option
                  key={district}
                  value={district}
                >
                  {district}
                </option>
              ),
            )}
          </select>

        </div>

      </section>


      {/* ======================================
          Type Tabs
      ====================================== */}

      <section className="storage-tabs">

        <button
          type="button"
          className={
            selectedType === 'all'
              ? 'active'
              : ''
          }
          onClick={() =>
            setSelectedType('all')
          }
        >
          <Package size={17} />
          All Facilities
        </button>

        <button
          type="button"
          className={
            selectedType ===
            'cold_storage'
              ? 'active'
              : ''
          }
          onClick={() =>
            setSelectedType(
              'cold_storage',
            )
          }
        >
          <Snowflake size={17} />
          Cold Storage
        </button>

        <button
          type="button"
          className={
            selectedType ===
            'warehouse'
              ? 'active'
              : ''
          }
          onClick={() =>
            setSelectedType(
              'warehouse',
            )
          }
        >
          <Warehouse size={17} />
          Warehouses
        </button>

      </section>


      {/* ======================================
          Error
      ====================================== */}

      {error && (
        <div className="storage-error">

          <strong>
            Unable to load storage
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchStorage}
          >
            Try Again
          </button>

        </div>
      )}


      {/* ======================================
          Result Information
      ====================================== */}

      {!error && (
        <div className="storage-result-bar">

          <div>
            Showing{' '}
            <strong>
              {filteredFacilities.length}
            </strong>{' '}
            of{' '}
            <strong>
              {facilities.length}
            </strong>{' '}
            facilities
          </div>

          {(search ||
            selectedType !== 'all' ||
            selectedDistrict !==
              'all') && (
            <button
              type="button"
              onClick={
                resetFilters
              }
            >
              Clear Filters
            </button>
          )}

        </div>
      )}


      {/* ======================================
          Empty State
      ====================================== */}

      {!error &&
        filteredFacilities.length ===
          0 && (
          <div className="storage-empty">

            <div className="storage-empty-icon">
              <Warehouse size={32} />
            </div>

            <h2>
              No storage facilities found
            </h2>

            <p>
              Try changing your search or
              filter options.
            </p>

            <button
              type="button"
              onClick={
                resetFilters
              }
            >
              Clear Filters
            </button>

          </div>
        )}


      {/* ======================================
          Facility Grid
      ====================================== */}

      {!error &&
        filteredFacilities.length >
          0 && (
          <section className="storage-grid">

            {filteredFacilities.map(
              (facility) => {
                const isColdStorage =
                  facility.type ===
                  'cold_storage';

                const capacity =
                  Number(
                    facility.capacity,
                  ) || 0;

                const availableCapacity =
                  Number(
                    facility.availableCapacity,
                  ) || 0;

                const availability =
                  capacity > 0
                    ? Math.round(
                        (availableCapacity /
                          capacity) *
                          100,
                      )
                    : 0;

                return (
                  <article
                    key={
                      facility._id
                    }
                    className="storage-card"
                  >

                    {/* Card Header */}

                    <div className="storage-card-top">

                      <div
                        className={
                          isColdStorage
                            ? 'storage-type-icon cold'
                            : 'storage-type-icon warehouse'
                        }
                      >
                        {isColdStorage ? (
                          <Snowflake
                            size={23}
                          />
                        ) : (
                          <Warehouse
                            size={23}
                          />
                        )}
                      </div>

                      <div className="storage-card-type">

                        <span>
                          {isColdStorage
                            ? 'Cold Storage'
                            : 'Warehouse'}
                        </span>

                        {facility.isVerified && (
                          <CheckCircle2
                            size={17}
                            className="verified-icon"
                          />
                        )}

                      </div>

                    </div>


                    {/* Name */}

                    <h2>
                      {facility.name}
                    </h2>

                    <p className="storage-description">
                      {facility.description}
                    </p>


                    {/* Location */}

                    <div className="storage-location">

                      <MapPin size={17} />

                      <span>
                        {facility.location
                          ?.district}
                        ,{' '}
                        {facility.location
                          ?.state}
                      </span>

                    </div>


                    {/* Capacity */}

                    <div className="storage-capacity">

                      <div className="storage-capacity-header">

                        <span>
                          Available Capacity
                        </span>

                        <strong>
                          {
                            facility.availableCapacity
                          }{' '}
                          /
                          {' '}
                          {
                            facility.capacity
                          }{' '}
                          {
                            facility.capacityUnit
                          }
                        </strong>

                      </div>

                      <div className="storage-capacity-bar">

                        <div
                          style={{
                            width: `${Math.min(
                              availability,
                              100,
                            )}%`,
                          }}
                        />

                      </div>

                      <small>
                        {availability}% capacity
                        available
                      </small>

                    </div>


                    {/* Crop Tags */}

                    <div className="storage-crops">

                      {(facility
                        .suitableCrops ||
                        [])
                        .slice(0, 4)
                        .map(
                          (crop) => (
                            <span
                              key={crop}
                            >
                              {crop}
                            </span>
                          ),
                        )}

                      {facility
                        .suitableCrops
                        ?.length >
                        4 && (
                        <span>
                          +
                          {facility
                            .suitableCrops
                            .length -
                            4}
                        </span>
                      )}

                    </div>


                    {/* Details */}

                    <div className="storage-details">

                      {isColdStorage &&
                        facility.temperatureRange && (
                          <div>
                            <Thermometer
                              size={16}
                            />

                            <span>
                              {
                                facility.temperatureRange
                              }
                            </span>
                          </div>
                        )}

                      <div>
                        <IndianRupee
                          size={16}
                        />

                        <span>
                          {formatCurrency(
                            facility
                              .storageCharges
                              ?.amount,
                          )}{' '}
                          {
                            facility
                              .storageCharges
                              ?.unit
                          }
                        </span>
                      </div>

                    </div>


                    {/* Footer */}

                    <div className="storage-card-footer">

                      <div className="storage-demo-badge">
                        {facility.isVerified ? (
                          <>
                            <CheckCircle2
                              size={14}
                            />
                            Verified
                          </>
                        ) : (
                          'Demo Facility'
                        )}
                      </div>

                      <button
                        type="button"
                        className="storage-view-button"
                        onClick={() =>
                          setSelectedFacility(
                            facility,
                          )
                        }
                      >
                        View Details
                      </button>

                    </div>

                  </article>
                );
              },
            )}

          </section>
        )}


      {/* ======================================
          Facility Details Modal
      ====================================== */}

      {selectedFacility && (
        <div
          className="storage-modal-overlay"
          onClick={() =>
            setSelectedFacility(
              null,
            )
          }
        >

          <div
            className="storage-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="storage-modal-close"
              onClick={() =>
                setSelectedFacility(
                  null,
                )
              }
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="storage-modal-header">

              <div
                className={
                  selectedFacility.type ===
                  'cold_storage'
                    ? 'storage-modal-icon cold'
                    : 'storage-modal-icon warehouse'
                }
              >
                {selectedFacility.type ===
                'cold_storage' ? (
                  <Snowflake size={27} />
                ) : (
                  <Warehouse size={27} />
                )}
              </div>

              <div>

                <span>
                  {selectedFacility.type ===
                  'cold_storage'
                    ? 'Cold Storage'
                    : 'Warehouse'}
                </span>

                <h2>
                  {selectedFacility.name}
                </h2>

              </div>

            </div>


            <div className="storage-modal-content">

              <div className="storage-modal-section">

                <h3>
                  Location
                </h3>

                <p>
                  <MapPin size={16} />

                  {selectedFacility
                    .location
                    ?.address &&
                    `${selectedFacility.location.address}, `}

                  {selectedFacility
                    .location
                    ?.village &&
                    `${selectedFacility.location.village}, `}

                  {selectedFacility
                    .location
                    ?.district}
                  ,{' '}
                  {selectedFacility
                    .location
                    ?.state}
                </p>

              </div>


              <div className="storage-modal-section">

                <h3>
                  Capacity
                </h3>

                <p>
                  <Package size={16} />

                  {
                    selectedFacility
                      .availableCapacity
                  }{' '}
                  {
                    selectedFacility
                      .capacityUnit
                  } available out of{' '}
                  {
                    selectedFacility
                      .capacity
                  }{' '}
                  {
                    selectedFacility
                      .capacityUnit
                  }
                </p>

              </div>


              {selectedFacility
                .temperatureRange && (
                <div className="storage-modal-section">

                  <h3>
                    Storage Conditions
                  </h3>

                  <p>
                    <Thermometer
                      size={16}
                    />

                    {
                      selectedFacility
                        .temperatureRange
                    }
                  </p>

                </div>
              )}


              <div className="storage-modal-section">

                <h3>
                  Suitable Crops
                </h3>

                <div className="storage-modal-crops">

                  {(
                    selectedFacility
                      .suitableCrops ||
                    []
                  ).map(
                    (crop) => (
                      <span
                        key={crop}
                      >
                        {crop}
                      </span>
                    ),
                  )}

                </div>

              </div>


              <div className="storage-modal-section">

                <h3>
                  Storage Charges
                </h3>

                <p>
                  <IndianRupee
                    size={16}
                  />

                  {formatCurrency(
                    selectedFacility
                      .storageCharges
                      ?.amount,
                  )}{' '}
                  {
                    selectedFacility
                      .storageCharges
                      ?.unit
                  }
                </p>

              </div>


              <div className="storage-modal-section">

                <h3>
                  Contact
                </h3>

                <p>
                  <Phone size={16} />

                  {
                    selectedFacility
                      .contact
                      ?.phone ||
                    'Contact information unavailable'
                  }
                </p>

              </div>


              <div className="storage-modal-section">

                <h3>
                  Operating Hours
                </h3>

                <p>
                  {
                    selectedFacility
                      .operatingHours
                  }
                </p>

              </div>

            </div>


            <div className="storage-modal-footer">

              <button
                type="button"
                className="storage-call-button"
                onClick={() => {
                  const phone =
                    selectedFacility
                      .contact
                      ?.phone;

                  if (phone) {
                    window.location.href =
                      `tel:${phone}`;
                  }
                }}
              >
                <Phone size={17} />
                Contact Facility
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Storage;
import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShoppingBag,
  Trash2,
  XCircle,
} from 'lucide-react';

import './Bids.css';

const API_BASE_URL = 'http://localhost:5000';

const getStatusClass = (status) => {
  switch (status) {
    case 'accepted':
      return 'bid-status accepted';

    case 'rejected':
      return 'bid-status rejected';

    default:
      return 'bid-status pending';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'accepted':
      return 'Accepted';

    case 'rejected':
      return 'Rejected';

    default:
      return 'Pending';
  }
};

const formatDate = (dateString) => {
  if (!dateString) {
    return '-';
  }

  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

function Bids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchBids = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await fetch(`${API_BASE_URL}/api/bids`);

      if (!response.ok) {
        throw new Error('Failed to fetch bids.');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch bids.');
      }

      setBids(result.data || []);
    } catch (err) {
      console.error('Fetch bids error:', err);
      setError(
        err.message ||
          'Unable to load bids. Please make sure the backend is running.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  const updateBidStatus = async (bidId, status) => {
    try {
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/bids/${bidId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to update bid status.',
        );
      }

      setBids((currentBids) =>
        currentBids.map((bid) =>
          bid._id === bidId ? result.data : bid,
        ),
      );
    } catch (err) {
      console.error('Update bid status error:', err);

      setError(
        err.message || 'Failed to update the bid status.',
      );
    }
  };

  const deleteBid = async (bidId) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this bid?',
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/api/bids/${bidId}`,
        {
          method: 'DELETE',
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to delete bid.',
        );
      }

      setBids((currentBids) =>
        currentBids.filter((bid) => bid._id !== bidId),
      );
    } catch (err) {
      console.error('Delete bid error:', err);

      setError(
        err.message || 'Failed to delete the bid.',
      );
    }
  };

  const pendingCount = bids.filter(
    (bid) => bid.status === 'pending',
  ).length;

  const acceptedCount = bids.filter(
    (bid) => bid.status === 'accepted',
  ).length;

  const rejectedCount = bids.filter(
    (bid) => bid.status === 'rejected',
  ).length;

  return (
    <div className="bids-page">
      <div className="bids-page-header">
        <div>
          <p className="bids-eyebrow">🌾 KrishiBandhu</p>

          <h1>Your Bids</h1>

          <p className="bids-subtitle">
            Manage buyer offers for your crops in one place.
          </p>
        </div>

        <button
          type="button"
          className="bids-refresh-button"
          onClick={() => fetchBids(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={18}
            className={refreshing ? 'spinning' : ''}
          />

          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="bid-summary-grid">
        <div className="bid-summary-card">
          <div className="bid-summary-icon total">
            <ShoppingBag size={21} />
          </div>

          <div>
            <span>Total Bids</span>
            <strong>{bids.length}</strong>
          </div>
        </div>

        <div className="bid-summary-card">
          <div className="bid-summary-icon pending">
            <Clock3 size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="bid-summary-card">
          <div className="bid-summary-icon accepted">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Accepted</span>
            <strong>{acceptedCount}</strong>
          </div>
        </div>

        <div className="bid-summary-card">
          <div className="bid-summary-icon rejected">
            <XCircle size={21} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="bids-error">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bids-state-card">
          <div className="bids-loader" />

          <h3>Loading bids...</h3>

          <p>
            Fetching the latest buyer offers from KrishiBandhu.
          </p>
        </div>
      ) : bids.length === 0 ? (
        <div className="bids-state-card">
          <div className="bids-empty-icon">
            <ShoppingBag size={30} />
          </div>

          <h3>No bids yet</h3>

          <p>
            Buyer offers will appear here when someone places a
            bid on your crops.
          </p>
        </div>
      ) : (
        <div className="bids-list">
          {bids.map((bid) => (
            <article className="bid-card" key={bid._id}>
              <div className="bid-card-top">
                <div className="bid-crop-info">
                  <div className="bid-crop-icon">🌾</div>

                  <div>
                    <h2>{bid.crop?.name || 'Unknown Crop'}</h2>

                    <p>
                      {bid.crop?.variety
                        ? bid.crop.variety
                        : 'Variety not specified'}
                    </p>
                  </div>
                </div>

                <span className={getStatusClass(bid.status)}>
                  {getStatusLabel(bid.status)}
                </span>
              </div>

              <div className="bid-details-grid">
                <div className="bid-detail">
                  <span>Market</span>
                  <strong>
                    {bid.market?.name || 'Unknown Market'}
                  </strong>
                </div>

                <div className="bid-detail">
                  <span>Buyer</span>
                  <strong>{bid.buyerName}</strong>
                </div>

                <div className="bid-detail">
                  <span>Contact</span>
                  <strong>{bid.buyerContact}</strong>
                </div>

                <div className="bid-detail">
                  <span>Quantity</span>
                  <strong>{bid.quantity}</strong>
                </div>

                <div className="bid-detail">
                  <span>Price / Unit</span>
                  <strong>
                    {formatCurrency(bid.pricePerUnit)}
                  </strong>
                </div>

                <div className="bid-detail highlight">
                  <span>Total Offer</span>
                  <strong>
                    {formatCurrency(bid.totalAmount)}
                  </strong>
                </div>
              </div>

              {bid.message && (
                <div className="bid-message">
                  <span>Message</span>
                  <p>{bid.message}</p>
                </div>
              )}

              <div className="bid-card-footer">
                <span className="bid-date">
                  Received {formatDate(bid.createdAt)}
                </span>

                <div className="bid-actions">
                  {bid.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        className="bid-action accept"
                        onClick={() =>
                          updateBidStatus(
                            bid._id,
                            'accepted',
                          )
                        }
                      >
                        <CheckCircle2 size={17} />
                        Accept
                      </button>

                      <button
                        type="button"
                        className="bid-action reject"
                        onClick={() =>
                          updateBidStatus(
                            bid._id,
                            'rejected',
                          )
                        }
                      >
                        <XCircle size={17} />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="bid-action delete"
                    onClick={() => deleteBid(bid._id)}
                  >
                    <Trash2 size={17} />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default Bids;
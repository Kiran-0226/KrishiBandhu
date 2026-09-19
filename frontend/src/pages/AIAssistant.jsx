import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Send,
  Sparkles,
  Sprout,
  X,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import './AIAssistant.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

/* =========================================================
   CONVERT QUINTAL PRICE TO KG PRICE
========================================================= */

const quintalToKg = (price) => {
  if (
    price === undefined ||
    price === null ||
    Number.isNaN(Number(price))
  ) {
    return 0;
  }

  return Number(price) / 100;
};

/* =========================================================
   FORMAT RUPEE
========================================================= */

const formatRupeesPerKg = (
  price,
) => {
  const kgPrice =
    quintalToKg(price);

  return kgPrice.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits:
        kgPrice % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    },
  );
};

/* =========================================================
   MARKDOWN CONTENT
========================================================= */

function MarkdownContent({
  children,
}) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}

/* =========================================================
   PARSE AI ANALYSIS
========================================================= */

function parseAnalysis(
  analysis = '',
) {
  const getSection = (
    start,
    endPatterns = [],
  ) => {
    const endPattern =
      endPatterns.length > 0
        ? `(?=\\n(?:${endPatterns.join('|')}):)`
        : '$';

    const regex = new RegExp(
      `${start}:\\s*([\\s\\S]*?)${endPattern}`,
      'i',
    );

    const match =
      analysis.match(regex);

    return match
      ? match[1].trim()
      : '';
  };

  return {
    crop: getSection(
      'CROP',
      [
        'QUALITY SCORE',
        'OVERALL QUALITY',
      ],
    ),

    quality: getSection(
      'QUALITY SCORE',
      [
        'OVERALL QUALITY',
        'LEAF CONDITION',
      ],
    ),

    overallQuality:
      getSection(
        'OVERALL QUALITY',
        [
          'LEAF CONDITION',
          'FRUIT / PRODUCE CONDITION',
        ],
      ),

    leafCondition:
      getSection(
        'LEAF CONDITION',
        [
          'FRUIT / PRODUCE CONDITION',
          'VISIBLE CONCERNS',
        ],
      ),

    produceCondition:
      getSection(
        'FRUIT / PRODUCE CONDITION',
        [
          'VISIBLE CONCERNS',
          'POSSIBLE ISSUES',
        ],
      ),

    concerns:
      getSection(
        'VISIBLE CONCERNS',
        [
          'POSSIBLE ISSUES',
          'RECOMMENDATIONS',
        ],
      ),

    issues:
      getSection(
        'POSSIBLE ISSUES',
        [
          'RECOMMENDATIONS',
          'CONFIDENCE',
        ],
      ),

    recommendations:
      getSection(
        'RECOMMENDATIONS',
        [
          'CONFIDENCE',
          'NOTE',
        ],
      ),

    confidence:
      getSection(
        'CONFIDENCE',
        ['NOTE'],
      ),

    note:
      getSection(
        'NOTE',
        [],
      ),
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function AIAssistant() {
  /* =======================================================
     CHAT STATE
  ======================================================= */

  const [
    chatMessages,
    setChatMessages,
  ] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I'm KrishiBandhu AI 🌾 Ask me anything about crops, farming, market prices, or agricultural practices.",
    },
  ]);

  const [
    chatInput,
    setChatInput,
  ] = useState('');

  const [
    chatLoading,
    setChatLoading,
  ] = useState(false);

  /* =======================================================
     IMAGE STATE
  ======================================================= */

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState('');

  const [
    imageMimeType,
    setImageMimeType,
  ] = useState('');

  const [
    imageLoading,
    setImageLoading,
  ] = useState(false);

  const [
    analysisResult,
    setAnalysisResult,
  ] = useState(null);

  /* =======================================================
     MARKET STATE
  ======================================================= */

  const [
    markets,
    setMarkets,
  ] = useState([]);

  const [
    selectedMarketId,
    setSelectedMarketId,
  ] = useState('');

  const [
    marketsLoading,
    setMarketsLoading,
  ] = useState(false);

  const [
    marketsError,
    setMarketsError,
  ] = useState('');

  /* =======================================================
     REFS
  ======================================================= */

  const fileInputRef =
    useRef(null);

  const chatEndRef =
    useRef(null);

  /* =======================================================
     LOAD MARKETS
  ======================================================= */

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setMarketsLoading(true);
      setMarketsError('');

      const response =
        await fetch(
          `${API_BASE_URL}/markets`,
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to load markets.',
        );
      }

      let marketList = [];

      if (Array.isArray(data)) {
        marketList = data;
      } else if (
        Array.isArray(data.data)
      ) {
        marketList =
          data.data;
      } else if (
        Array.isArray(
          data.markets,
        )
      ) {
        marketList =
          data.markets;
      }

      setMarkets(
        marketList,
      );

      const officialMarket =
        marketList.find(
          (market) =>
            market.isOfficial ===
            true,
        );

      if (officialMarket) {
        setSelectedMarketId(
          officialMarket._id,
        );
      } else if (
        marketList.length > 0
      ) {
        setSelectedMarketId(
          marketList[0]._id,
        );
      }
    } catch (error) {
      console.error(
        'Market Fetch Error:',
        error,
      );

      setMarketsError(
        error.message ||
          'Unable to load markets.',
      );
    } finally {
      setMarketsLoading(false);
    }
  };

  /* =======================================================
     CHAT SCROLL
  ======================================================= */

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [chatMessages]);

  /* =======================================================
     IMAGE SELECT
  ======================================================= */

  const handleImageSelect = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ];

    if (
      !allowedTypes.includes(
        file.type.toLowerCase(),
      )
    ) {
      alert(
        'Please upload a JPEG, PNG, WebP, HEIC or HEIF image.',
      );

      return;
    }

    const maxSize =
      12 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        'Image size must be 12MB or less.',
      );

      return;
    }

    setSelectedImage(file);

    setImageMimeType(
      file.type,
    );

    setAnalysisResult(null);

    const reader =
      new FileReader();

    reader.onload = () => {
      setImagePreview(
        reader.result,
      );
    };

    reader.readAsDataURL(file);
  };

  /* =======================================================
     CLEAR IMAGE
  ======================================================= */

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setImageMimeType('');
    setAnalysisResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        '';
    }
  };

  /* =======================================================
     IMAGE ANALYSIS
  ======================================================= */

  const analyzeImage = async () => {
    if (!selectedImage) {
      alert(
        'Please select a crop image first.',
      );

      return;
    }

    if (!selectedMarketId) {
      alert(
        'Please select the market where you plan to sell the crop.',
      );

      return;
    }

    try {
      setImageLoading(true);
      setAnalysisResult(null);

      let imageData =
        imagePreview;

      if (
        imagePreview.includes(
          'base64,',
        )
      ) {
        imageData =
          imagePreview.split(
            'base64,',
          )[1];
      }

      const response =
        await fetch(
          `${API_BASE_URL}/ai/image/analyze`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              image:
                imageData,

              mimeType:
                imageMimeType,

              marketId:
                selectedMarketId,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            'Unable to analyze image.',
        );
      }

      setAnalysisResult(
        data,
      );
    } catch (error) {
      console.error(
        'Image Analysis Error:',
        error,
      );

      alert(
        error.message ||
          'Unable to analyze the crop image.',
      );
    } finally {
      setImageLoading(false);
    }
  };

  /* =======================================================
     CHAT SEND
  ======================================================= */

  const sendChatMessage =
    async () => {
      const message =
        chatInput.trim();

      if (
        !message ||
        chatLoading
      ) {
        return;
      }

      const userMessage = {
        role: 'user',
        content: message,
      };

      setChatMessages(
        (previous) => [
          ...previous,
          userMessage,
        ],
      );

      setChatInput('');
      setChatLoading(true);

      try {
        const history =
          chatMessages.map(
            (item) => ({
              role:
                item.role,
              content:
                item.content,
            }),
          );

        const response =
          await fetch(
            `${API_BASE_URL}/ai/chat`,
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                message,
                history,
              }),
            },
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              'Unable to get AI response.',
          );
        }

        setChatMessages(
          (previous) => [
            ...previous,
            {
              role:
                'assistant',
              content:
                data.message ||
                'I could not generate a response.',
            },
          ],
        );
      } catch (error) {
        console.error(
          'Chat Error:',
          error,
        );

        setChatMessages(
          (previous) => [
            ...previous,
            {
              role:
                'assistant',
              content:
                `Sorry, I couldn't process that request.\n\n**Error:** ${error.message}`,
            },
          ],
        );
      } finally {
        setChatLoading(false);
      }
    };

  /* =======================================================
     CHAT KEYBOARD
  ======================================================= */

  const handleChatKeyDown = (
    event,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendChatMessage();
    }
  };

  /* =======================================================
     RESULT DATA
  ======================================================= */

  const parsedAnalysis =
    analysisResult?.analysis
      ? parseAnalysis(
          analysisResult.analysis,
        )
      : null;

  const marketData =
    analysisResult?.marketData;

  const indicativePrice =
    marketData?.indicativePrice;

  const selectedMarket =
    markets.find(
      (market) =>
        market._id ===
        selectedMarketId,
    );

  /* =======================================================
     QUALITY DISPLAY
  ======================================================= */

  let qualityDisplay = '—';

  if (
    analysisResult &&
    analysisResult.qualityScore !==
      undefined &&
    analysisResult.qualityScore !==
      null
  ) {
    qualityDisplay =
      `${analysisResult.qualityScore}/10`;
  } else if (
    parsedAnalysis?.quality
  ) {
    qualityDisplay =
      parsedAnalysis.quality;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="ai-assistant-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="ai-hero">

        <div className="ai-hero-content">

          <div className="ai-hero-icon">
            <Sparkles size={30} />
          </div>

          <div>
            <h1>
              KrishiBandhu AI
            </h1>

            <p>
              Your intelligent farming
              companion 🌾
            </p>
          </div>

        </div>

      </section>

      {/* =================================================
          IMAGE ANALYSIS
      ================================================= */}

      <section className="ai-analysis-section">

        <div className="ai-section-header">

          <div>

            <span className="ai-section-eyebrow">
              AI VISION
            </span>

            <h2>
              Analyze Your Crop
            </h2>

            <p>
              Upload a crop image to
              assess visible quality
              and get an indicative
              market-price range in
              ₹/kg.
            </p>

          </div>

          <div className="ai-section-icon">
            <Camera size={24} />
          </div>

        </div>

        <div className="ai-analysis-card">

          {/* =============================================
              UPLOAD
          ============================================= */}

          <div className="ai-upload-area">

            {!imagePreview ? (
              <button
                type="button"
                className="ai-upload-box"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <div className="ai-upload-icon">
                  <ImagePlus size={30} />
                </div>

                <strong>
                  Upload Crop Image
                </strong>

                <span>
                  JPEG, PNG, WebP, HEIC
                </span>

                <small>
                  Maximum 12MB
                </small>

              </button>
            ) : (
              <div className="ai-image-preview-wrapper">

                <img
                  src={imagePreview}
                  alt="Selected crop"
                  className="ai-image-preview"
                />

                <button
                  type="button"
                  className="ai-remove-image"
                  onClick={
                    clearImage
                  }
                  aria-label="Remove image"
                >
                  <X size={18} />
                </button>

              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              onChange={
                handleImageSelect
              }
              hidden
            />

          </div>

          {/* =============================================
              MARKET SELECTOR
          ============================================= */}

          <div className="ai-market-selector">

            <div className="ai-market-label">

              <div className="ai-market-label-icon">
                <MapPin size={18} />
              </div>

              <div>

                <strong>
                  Select Selling Market
                </strong>

                <span>
                  Choose the market where
                  you plan to sell this crop.
                </span>

              </div>

            </div>

            <div className="ai-select-wrapper">

              <select
                value={
                  selectedMarketId
                }
                onChange={(event) =>
                  setSelectedMarketId(
                    event.target.value,
                  )
                }
                disabled={
                  marketsLoading ||
                  imageLoading
                }
                className="ai-market-select"
              >

                <option value="">
                  {marketsLoading
                    ? 'Loading markets...'
                    : 'Select a market'}
                </option>

                {markets.map(
                  (market) => (
                    <option
                      key={
                        market._id
                      }
                      value={
                        market._id
                      }
                    >
                      {market.name}
                      {market.district
                        ? ` — ${market.district}`
                        : ''}
                    </option>
                  ),
                )}

              </select>

              <ChevronDown
                size={18}
                className="ai-select-icon"
              />

            </div>

            {selectedMarket && (
              <div className="ai-selected-market">

                <MapPin size={14} />

                <span>
                  {selectedMarket.name}

                  {selectedMarket.district
                    ? `, ${selectedMarket.district}`
                    : ''}

                  {selectedMarket.state
                    ? `, ${selectedMarket.state}`
                    : ''}
                </span>

              </div>
            )}

            {marketsError && (
              <div className="ai-market-error">

                <CircleAlert
                  size={16}
                />

                <span>
                  {marketsError}
                </span>

                <button
                  type="button"
                  onClick={
                    fetchMarkets
                  }
                >
                  Retry
                </button>

              </div>
            )}

          </div>

          {/* =============================================
              ANALYZE BUTTON
          ============================================= */}

          <button
            type="button"
            className="ai-analyze-button"
            onClick={
              analyzeImage
            }
            disabled={
              !selectedImage ||
              !selectedMarketId ||
              imageLoading
            }
          >

            {imageLoading ? (
              <>
                <Loader2
                  size={19}
                  className="spin"
                />

                Analyzing Crop...
              </>
            ) : (
              <>
                <Sparkles
                  size={19}
                />

                Analyze Crop
              </>
            )}

          </button>

          {/* =============================================
              ANALYSIS RESULT
          ============================================= */}

          {analysisResult && (
            <div className="ai-analysis-result">

              {/* =========================================
                  HEADER
              ========================================= */}

              <div className="ai-result-header">

                <div>

                  <span className="ai-section-eyebrow">
                    ANALYSIS COMPLETE
                  </span>

                  <h3>
                    Crop Assessment
                  </h3>

                </div>

                <CheckCircle2
                  size={28}
                  className="ai-success-icon"
                />

              </div>

              {/* =========================================
                  SCORE GRID
              ========================================= */}

              <div className="ai-score-grid">

                <div className="ai-score-card">

                  <span>
                    Visual Quality
                  </span>

                  <strong>
                    {qualityDisplay}
                  </strong>

                </div>

                <div className="ai-condition-card">

                  <span>
                    Overall Condition
                  </span>

                  <strong>
                    {parsedAnalysis?.overallQuality ||
                      '—'}
                  </strong>

                </div>

                <div className="ai-crop-card">

                  <span>
                    Crop Identified
                  </span>

                  <strong>
                    {analysisResult.crop ||
                      parsedAnalysis?.crop ||
                      'Unable to determine'}
                  </strong>

                </div>

              </div>

              {/* =========================================
                  INDICATIVE PRICE CARD
              ========================================= */}

              {marketData &&
              indicativePrice ? (
                <div className="ai-price-card">

                  <div className="ai-price-card-header">

                    <div>

                      <span className="ai-price-eyebrow">
                        INDICATIVE SELLING PRICE
                      </span>

                      <h3>
                        Expected Market Range
                      </h3>

                    </div>

                    <div className="ai-price-icon">
                      ₹
                    </div>

                  </div>

                  {/* =====================================
                      MAIN KG PRICE
                  ===================================== */}

                  <div className="ai-price-range">

                    <span>
                      ₹
                      {formatRupeesPerKg(
                        indicativePrice.minimum,
                      )}
                    </span>

                    <b>
                      –
                    </b>

                    <span>
                      ₹
                      {formatRupeesPerKg(
                        indicativePrice.maximum,
                      )}
                    </span>

                    <small>
                      / kg
                    </small>

                  </div>

                  <div className="ai-price-market">

                    <MapPin
                      size={15}
                    />

                    <span>
                      {marketData.market?.name ||
                        selectedMarket?.name ||
                        'Selected market'}
                    </span>

                  </div>

                  {/* =====================================
                      MSAMB REFERENCE PRICES
                  ===================================== */}

                  <div className="ai-price-reference">

                    <div>

                      <span>
                        MSAMB Minimum
                      </span>

                      <strong>
                        ₹
                        {formatRupeesPerKg(
                          marketData.minimumPrice,
                        )}
                        /kg
                      </strong>

                    </div>

                    <div>

                      <span>
                        MSAMB Modal
                      </span>

                      <strong>
                        ₹
                        {formatRupeesPerKg(
                          marketData.modalPrice,
                        )}
                        /kg
                      </strong>

                    </div>

                    <div>

                      <span>
                        MSAMB Maximum
                      </span>

                      <strong>
                        ₹
                        {formatRupeesPerKg(
                          marketData.maximumPrice,
                        )}
                        /kg
                      </strong>

                    </div>

                  </div>

                  {/* =====================================
                      MARKET METADATA
                  ===================================== */}

                  <div className="ai-price-meta">

                    <span>
                      Source:{' '}
                      {marketData.source ||
                        'MSAMB'}
                    </span>

                    <span>
                      Price date:{' '}
                      {marketData.priceDate
                        ? new Date(
                            marketData.priceDate,
                          ).toLocaleDateString(
                            'en-IN',
                          )
                        : '—'}
                    </span>

                    <span>
                      Unit:{' '}
                      ₹/kg
                    </span>

                  </div>

                  {/* =====================================
                      DISCLAIMER
                  ===================================== */}

                  <div className="ai-price-disclaimer">

                    <CircleAlert
                      size={16}
                    />

                    <span>
                      This is an indicative
                      estimate based on
                      visible crop quality
                      and the latest
                      available MSAMB
                      market prices. Actual
                      selling prices may
                      vary by lot quality,
                      quantity, buyer,
                      arrivals and auction
                      conditions.
                    </span>

                  </div>

                </div>
              ) : (
                <div className="ai-no-price-card">

                  <CircleAlert
                    size={20}
                  />

                  <div>

                    <strong>
                      Market price unavailable
                    </strong>

                    <p>
                      We analyzed the crop,
                      but couldn't find a
                      matching verified price
                      for this crop at the
                      selected market.
                    </p>

                  </div>

                </div>
              )}

              {/* =========================================
                  ASSESSMENT GRID
              ========================================= */}

              <div className="ai-assessment-grid">

                <div className="ai-assessment-card">

                  <div className="ai-assessment-title">

                    <Sprout
                      size={19}
                    />

                    <h4>
                      Produce Condition
                    </h4>

                  </div>

                  <p>
                    {parsedAnalysis?.produceCondition ||
                      'No additional visual assessment available.'}
                  </p>

                </div>

                <div className="ai-assessment-card">

                  <div className="ai-assessment-title">

                    <CircleAlert
                      size={19}
                    />

                    <h4>
                      Visible Concerns
                    </h4>

                  </div>

                  <p>
                    {parsedAnalysis?.concerns ||
                      'No major visible concerns reported.'}
                  </p>

                </div>

                <div className="ai-assessment-card">

                  <div className="ai-assessment-title">

                    <Sparkles
                      size={19}
                    />

                    <h4>
                      Possible Issues
                    </h4>

                  </div>

                  <p>
                    {parsedAnalysis?.issues ||
                      'No possible issues identified from the image.'}
                  </p>

                </div>

                <div className="ai-assessment-card">

                  <div className="ai-assessment-title">

                    <CheckCircle2
                      size={19}
                    />

                    <h4>
                      Confidence
                    </h4>

                  </div>

                  <p>
                    {parsedAnalysis?.confidence ||
                      '—'}
                  </p>

                </div>

              </div>

              {/* =========================================
                  RECOMMENDATIONS
              ========================================= */}

              {parsedAnalysis?.recommendations && (
                <div className="ai-recommendations-card">

                  <div className="ai-assessment-title">

                    <Sprout
                      size={20}
                    />

                    <h4>
                      Recommendations
                    </h4>

                  </div>

                  <MarkdownContent>
                    {
                      parsedAnalysis.recommendations
                    }
                  </MarkdownContent>

                </div>
              )}

              {/* =========================================
                  NOTE
              ========================================= */}

              {parsedAnalysis?.note && (
                <div className="ai-analysis-note">

                  <CircleAlert
                    size={16}
                  />

                  <span>
                    {parsedAnalysis.note}
                  </span>

                </div>
              )}

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          AI CHAT
      ================================================= */}

      <section className="ai-chat-section">

        <div className="ai-section-header">

          <div>

            <span className="ai-section-eyebrow">
              FARMING ASSISTANT
            </span>

            <h2>
              Ask KrishiBandhu AI
            </h2>

            <p>
              Get help with farming,
              crops, markets and
              agricultural practices.
            </p>

          </div>

          <div className="ai-section-icon">
            <MessageCircle
              size={24}
            />
          </div>

        </div>

        <div className="ai-chat-card">

          <div className="ai-chat-messages">

            {chatMessages.map(
              (message, index) => {
                const messageClass =
                  message.role ===
                  'user'
                    ? 'ai-chat-message user'
                    : 'ai-chat-message assistant';

                return (
                  <div
                    key={index}
                    className={
                      messageClass
                    }
                  >

                    <div className="ai-chat-avatar">

                      {message.role ===
                      'user' ? (
                        'You'
                      ) : (
                        <Sparkles
                          size={17}
                        />
                      )}

                    </div>

                    <div className="ai-chat-bubble">

                      <MarkdownContent>
                        {
                          message.content
                        }
                      </MarkdownContent>

                    </div>

                  </div>
                );
              },
            )}

            {chatLoading && (
              <div className="ai-chat-message assistant">

                <div className="ai-chat-avatar">

                  <Sparkles
                    size={17}
                  />

                </div>

                <div className="ai-chat-bubble ai-chat-loading">

                  <Loader2
                    size={18}
                    className="spin"
                  />

                  Thinking...

                </div>

              </div>
            )}

            <div
              ref={chatEndRef}
            />

          </div>

          {/* =========================================
              CHAT INPUT
          ========================================= */}

          <div className="ai-chat-input-area">

            <textarea
              value={chatInput}
              onChange={(event) =>
                setChatInput(
                  event.target.value,
                )
              }
              onKeyDown={
                handleChatKeyDown
              }
              placeholder="Ask about crops, farming, market prices..."
              rows={1}
              disabled={
                chatLoading
              }
            />

            <button
              type="button"
              onClick={
                sendChatMessage
              }
              disabled={
                !chatInput.trim() ||
                chatLoading
              }
              aria-label="Send message"
            >

              {chatLoading ? (
                <Loader2
                  size={19}
                  className="spin"
                />
              ) : (
                <Send size={19} />
              )}

            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AIAssistant;
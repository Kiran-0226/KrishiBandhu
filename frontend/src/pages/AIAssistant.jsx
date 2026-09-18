import PageHeader from '../components/PageHeader';

function AIAssistant() {
  return (
    <main className="dashboard">
      <PageHeader
        title="AI Assistant"
        description="Get farming assistance using AI."
      />

      <div className="empty-page-card">
        <h2>How can I help you?</h2>

        <p>
          Ask questions about crops, diseases,
          weather, farming practices and more.
        </p>

        <button className="primary-button">
          Start Conversation
        </button>
      </div>
    </main>
  );
}

export default AIAssistant;
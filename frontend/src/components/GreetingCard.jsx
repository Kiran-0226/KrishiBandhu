import './GreetingCard.css';

function GreetingCard() {
  const hour = new Date().getHours();

  let greeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17) {
    greeting = 'Good evening';
  }

  return (
    <section className="greeting-card">

      <div className="greeting-content">
        <p className="greeting-label">
          {greeting}
        </p>

        <h2>
          Welcome to KrishiBandhu
        </h2>

        <span>
          Everything you need to make better farming decisions.
        </span>
      </div>

    </section>
  );
}

export default GreetingCard;
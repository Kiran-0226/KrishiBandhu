import './DashboardCard.css';

function DashboardCard({
  icon,
  title,
  value,
  description,
  action,
}) {
  return (
    <article className="dashboard-card">

      <div className="card-top">

        <div className="card-icon">
          {icon}
        </div>

        {action && (
          <button className="card-action">
            {action}
          </button>
        )}

      </div>

      <h3>
        {title}
      </h3>

      <div className="card-value">
        {value}
      </div>

      <p>
        {description}
      </p>

    </article>
  );
}

export default DashboardCard;
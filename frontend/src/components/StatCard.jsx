function StatCard({
  title,
  value,
  description,
  icon,
  type
}) {
  return (
    <div className={`stat-card ${type}`}>

      <div className="stat-card-content">

        <p className="stat-title">
          {title}
        </p>

        <h2 className="stat-value">
          {value}
        </h2>

        <span className="stat-description">
          {description}
        </span>

      </div>

      <div className="stat-icon">
        {icon}
      </div>

    </div>
  );
}

export default StatCard;
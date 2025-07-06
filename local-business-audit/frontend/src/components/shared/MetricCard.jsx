// frontend/src/components/shared/MetricCard.jsx
import { colors } from "./colors";
import ProgressBar from "./ProgressBar";

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = colors.primary,
  progress = null,
}) => (
  <div
    style={{
      background: colors.white,
      padding: "20px",
      borderRadius: "12px",
      border: `1px solid ${colors.lightGray}`,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}
    >
      <h4
        style={{
          margin: 0,
          color: colors.primary,
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {title}
      </h4>
      {Icon && <Icon size={20} style={{ color: color }} />}
    </div>
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        color: color,
        marginBottom: "4px",
      }}
    >
      {value}
    </div>
    {subtitle && (
      <div
        style={{
          fontSize: "14px",
          color: "#666",
          marginBottom: progress ? "12px" : "0",
        }}
      >
        {subtitle}
      </div>
    )}
    {progress !== null && <ProgressBar value={progress} color={color} />}
  </div>
);

export default MetricCard;

// frontend/src/components/shared/StatusBadge.jsx
import { colors } from "./colors";

const StatusBadge = ({ status, children }) => {
  const getStatusColor = () => {
    switch (status) {
      case "excellent":
        return { bg: "#D1FAE5", color: "#065F46" };
      case "good":
        return { bg: "#DBEAFE", color: "#1E40AF" };
      case "warning":
        return { bg: "#FEF3C7", color: "#92400E" };
      case "critical":
        return { bg: "#FEE2E2", color: "#991B1B" };
      default:
        return { bg: colors.lightGray, color: "#374151" };
    }
  };

  const statusColors = getStatusColor();

  return (
    <span
      style={{
        background: statusColors.bg,
        color: statusColors.color,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {children}
    </span>
  );
};

export default StatusBadge;

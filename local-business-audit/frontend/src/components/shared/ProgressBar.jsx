// frontend/src/components/shared/ProgressBar.jsx
import { colors } from "./colors";

const ProgressBar = ({ value, color = colors.success, height = "8px" }) => (
  <div
    style={{
      width: "100%",
      height: height,
      background: colors.lightGray,
      borderRadius: "4px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min(value, 100)}%`,
        height: "100%",
        background: color,
        borderRadius: "4px",
        transition: "width 0.3s ease",
      }}
    />
  </div>
);

export default ProgressBar;

export const COLOR_MAP: Record<string, string> = {
  yes: "#3498db",
  no: "#e67e22",
  partially: "#f1c40f", // changed from green to yellow
};

const KEY_LABELS: Record<string, string> = {
  yes: "Considered in Algorithm",
  no: "Not Considered in Algorithm",
  partially: "Partially Considered in Algorithm",
};

const CustomLegend = () => {
  return (
    <ul
      style={{
        listStyle: "none",
        flexDirection: "row",
        display: "flex",
        padding: 0,
        width: "100%",
        justifyContent: "center",
        gap: "20px",
      }}
    >
      {Object.entries(COLOR_MAP).map(([key, color]) => (
        <li
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              backgroundColor: color,
              marginRight: 4,
              borderRadius: 2,
            }}
          />
          <span>{KEY_LABELS[key]}</span>
        </li>
      ))}
    </ul>
  );
};

export default CustomLegend;

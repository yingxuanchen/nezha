interface Props {
  groups: string[];
}

export default function SerialScrollBar({ groups }: Props) {
  const handleClick = (sn: string) => {
    const el = document.getElementById(sn);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      style={{
        position: "fixed",
        height: "90%",
        left: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "grey",
        border: "1px solid #ccc",
        borderRadius: "8px",
        overflowY: "auto",
        padding: "0.2rem",
        zIndex: 1000,
        color: "white",
      }}
    >
      跳转
      {groups.map((group) => (
        <div
          key={group}
          onClick={() => handleClick(group)}
          title={group}
          style={{
            height: "1.7rem",
            margin: "6px 0",
            padding: "0 6px",
            background: "#007bff",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {group}
        </div>
      ))}
    </div>
  );
}

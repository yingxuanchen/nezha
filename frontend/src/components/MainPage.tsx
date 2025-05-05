import { useCallback, useEffect, useState } from "react";
import AddSprout from "./AddSprout";
import { backendUrl, types } from "../utils/utils";
import { useSystemTheme } from "../hooks/useSystemTheme";
import ScrollToTopButton from "./ScrollToTopButton";
import SnScrollBar from "./SnScrollBar";
import About from "./About";

interface Sprout {
  sn: string;
  type: string;
}

function MainPage() {
  const systemTheme = useSystemTheme();

  const [openModal, setOpenModal] = useState(false);
  const [openAboutModal, setOpenAboutModal] = useState(false);

  const [sprouts, setSprouts] = useState<Sprout[]>([]);
  const [splitSn, setSplitSn] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);

  useEffect(() => {
    getSprouts();
  }, []);

  const getSprouts = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/sprouts`);
    const data = await res.json();
    setSprouts(data);
  }, []);

  useEffect(() => {
    setGroups([...new Set(sprouts.map((sprout) => sprout.sn.slice(0, 3)))]);
  }, [sprouts]);

  const handleCloseModal = (toRefresh: boolean) => {
    setOpenModal(false);
    if (toRefresh) {
      getSprouts();
    }
  };

  const downloadPdf = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/pdf`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nezha.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("下载失败");
    }
  };

  const downloadGroupedPdf = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/group`);
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nezha-grouped.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("下载失败");
    }
  };

  return (
    <>
      <SnScrollBar groups={groups} />
      <ScrollToTopButton />
      {openModal && <AddSprout onClose={handleCloseModal} />}
      {openAboutModal && <About onClose={() => setOpenAboutModal(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
        <h3>哪吒芽豆豆编码</h3>
        <button onClick={() => setOpenAboutModal(true)} style={{ fontSize: "12px" }}>
          使用说明
        </button>
      </div>
      <div className="container">
        <button onClick={() => setOpenModal(true)}>加入已确认编码</button>
        <div style={{ fontSize: "14px" }}>
          下载编码pdf：
          <button onClick={downloadPdf} style={{ marginRight: "0.5rem" }}>
            编码顺序
          </button>
          <button onClick={downloadGroupedPdf}>分款式</button>
        </div>
        <div className="checkbox">
          <input type="checkbox" onClick={() => setSplitSn((prev) => !prev)} />
          <label>分割编码前6位</label>
        </div>
        <div>总数：{sprouts.length}</div>
        <table style={{ alignSelf: "end" }}>
          <thead>
            <tr>
              <th>编码</th>
              <th>款式</th>
            </tr>
          </thead>
          <tbody>
            {sprouts.map((sprout, i) => {
              const type = types.find((type) => type.name === sprout.type);
              const bgColor =
                type === undefined ? "transparent" : systemTheme === "dark" ? type.darkBgColor : type.lightBgColor;

              const isFirstInGroup = i === 0 || sprout.sn.slice(0, 3) !== sprouts[i - 1].sn.slice(0, 3);

              return (
                <tr
                  key={sprout.sn}
                  style={{ backgroundColor: bgColor }}
                  id={isFirstInGroup ? sprout.sn.slice(0, 3) : undefined}
                >
                  <td>{splitSn ? `${sprout.sn.slice(0, 6)}(${sprout.sn.slice(6)})` : sprout.sn}</td>
                  <td>{sprout.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default MainPage;

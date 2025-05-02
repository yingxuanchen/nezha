import { useCallback, useEffect, useState } from "react";
import AddSprout from "./AddSprout";
import { backendUrl, types } from "../utils/utils";
import { useSystemTheme } from "../hooks/useSystemTheme";
import ScrollToTopButton from "./ScrollToTopButton";

interface Sprout {
  sn: string;
  type: string;
}

function MainPage() {
  const systemTheme = useSystemTheme();

  const [openModal, setOpenModal] = useState(false);
  const [sprouts, setSprouts] = useState<Sprout[]>([]);
  const [splitSn, setSplitSn] = useState(false);

  useEffect(() => {
    getSprouts();
  }, []);

  const getSprouts = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/sprouts`);
    const data = await res.json();
    setSprouts(data);
  }, []);

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

  return (
    <>
      <ScrollToTopButton />
      {openModal && <AddSprout onClose={handleCloseModal} />}
      <h3>哪吒芽豆豆编码</h3>
      <div className="container">
        <button onClick={() => setOpenModal(true)}>加入已确认编码</button>
        <button onClick={downloadPdf}>下载编码pdf文件</button>
        <div className="checkbox">
          <input type="checkbox" onClick={() => setSplitSn((prev) => !prev)} />
          <label>分割编码前6位</label>
        </div>
        <div>总数：{sprouts.length}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>编码</th>
            <th>款式</th>
          </tr>
        </thead>
        <tbody>
          {sprouts.map((sprout) => {
            const type = types.find((type) => type.name === sprout.type);
            const bgColor =
              type === undefined ? "transparent" : systemTheme === "dark" ? type.darkBgColor : type.lightBgColor;
            return (
              <tr key={sprout.sn} style={{ backgroundColor: bgColor }}>
                <td>{splitSn ? `${sprout.sn.slice(0, 6)}(${sprout.sn.slice(6)})` : sprout.sn}</td>
                <td>{sprout.type}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

export default MainPage;

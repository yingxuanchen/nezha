import { useCallback, useEffect, useState } from "react";
import AddSprout from "./AddSprout";
import { backendUrl, types } from "../utils/utils";
import { useSystemTheme } from "../hooks/useSystemTheme";

interface Sprout {
  sn: string;
  type: string;
}

function MainPage() {
  const systemTheme = useSystemTheme();

  const [openModal, setOpenModal] = useState(false);
  const [sprouts, setSprouts] = useState<Sprout[]>([]);

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

  return (
    <>
      {openModal && <AddSprout onClose={handleCloseModal} />}
      <h3>哪吒芽豆豆编码</h3>
      <button onClick={() => setOpenModal(true)}>加入已确认编码</button>
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
                <td>{sprout.sn}</td>
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

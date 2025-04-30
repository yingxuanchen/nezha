import { useCallback, useEffect, useState } from "react";
import AddSprout from "./AddSprout";
import { backendUrl } from "../utils/utils";

interface Sprout {
  sn: string;
  type: string;
}

function MainPage() {
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
      <button onClick={() => setOpenModal(true)}>+</button>
      <table>
        <thead>
          <tr>
            <th>SN</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {sprouts.map((sprout) => (
            <tr key={sprout.sn}>
              <td>{sprout.sn}</td>
              <td>{sprout.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default MainPage;

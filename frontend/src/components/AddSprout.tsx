import { useEffect, useRef, useState } from "react";
import { useDialogClickOutside } from "../hooks/useDialogClickOutside";
import { backendUrl, types } from "../utils/utils";

interface Props {
  onClose: (toRefresh: boolean) => void;
}

function AddSprout({ onClose }: Props) {
  const [sn, setSn] = useState("");
  const [type, setType] = useState("");

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useDialogClickOutside(dialogRef, onClose);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/sprouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sn, type }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      // for prod
      alert("成功加入编码！祝你成功抽中想要的芽豆豆！");
      onClose(true);

      // for fast insert during dev
      // setSn((prevSn) => prevSn.slice(0, 4));
    } catch (error) {
      alert(error);
    }
  };

  return (
    <dialog ref={dialogRef}>
      <form className="container" onSubmit={handleSubmit}>
        <div>
          <select
            name="type"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ fontSize: "1rem" }}
          >
            <option disabled value="">
              -- 请选择已确认款式 --
            </option>
            {types.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            name="sn"
            type="text"
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            required
            pattern="[0-9]{8}"
            title="Should be 8 digits"
            style={{ fontSize: "1rem" }}
            placeholder="编码 (8位数字)"
          />
        </div>
        <button type="submit">加入</button>
      </form>
    </dialog>
  );
}

export default AddSprout;

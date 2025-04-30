import { useEffect, useRef, useState } from "react";
import { useDialogClickOutside } from "../hooks/useDialogClickOutside";
import { backendUrl } from "../utils/utils";

const types = ["少年哪吒", "笑笑哪吒", "坏坏哪吒", "战斗哪吒", "灵珠版哪吒", "笑笑敖丙", "委屈敖丙"];

interface Props {
  onClose: (toRefresh: boolean) => void;
}

function AddSprout({ onClose }: Props) {
  const [sn, setSn] = useState("");
  const [type, setType] = useState(types[0]);

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
      alert("Sprout added successfully!");
      onClose(true);

      // for fast insert during dev
      // setSn("");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <dialog ref={dialogRef}>
      <form className="container" onSubmit={handleSubmit}>
        <div>
          <input
            name="sn"
            type="text"
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            required
            pattern="[0-9]{8}"
            title="Should be 8 digits"
          />
        </div>
        <div>
          <select name="type" required value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Add</button>
      </form>
    </dialog>
  );
}

export default AddSprout;

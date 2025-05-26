import { useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
}

function Notice({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef}>
      <p>请前往新网址 https://yadou.onrender.com</p>
      <p>此旧网址将在6月2日停用</p>
      <button onClick={onClose}>前往新网址</button>
    </dialog>
  );
}

export default Notice;

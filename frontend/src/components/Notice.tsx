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
      <p>此旧网址已经停用</p>
      <p>请前往新网址 https://yadou.onrender.com</p>
      <p>5月31日公告：由于服务器这个月的用时顶限已超过，新网站今天暂时不能用，请先到百度网盘下载pdf</p>
      <p>提取码: 0699</p>
      {/* <button onClick={onClose}>前往新网址</button> */}
      <button onClick={onClose}>前往百度网盘</button>
    </dialog>
  );
}

export default Notice;

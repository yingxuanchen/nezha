import { useEffect, useRef } from "react";
import { useDialogClickOutside } from "../hooks/useDialogClickOutside";

interface Props {
  onClose: (toRefresh: boolean) => void;
}

function About({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  useDialogClickOutside(dialogRef, onClose);

  return (
    <dialog ref={dialogRef}>
      <p>1. 搜索编码请用浏览器的搜索功能</p>
      <p>2. 输入编码是给已确认款式的编码</p>
      <p>3. 如有错误输入，请到小红书联系我(lemonzchen)，我会从数据库删除</p>
    </dialog>
  );
}

export default About;

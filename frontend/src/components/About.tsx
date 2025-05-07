import { useEffect, useRef } from "react";

interface Props {
  onClose: (toRefresh: boolean) => void;
}

function About({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef}>
      <p>1. 搜索编码请用浏览器的搜索功能</p>
      <p>2. 输入编码是给已确认款式的编码</p>
      <p>3. 如有错误输入，请到小红书联系我(lemonzchen)，我会从数据库删除</p>
      <p>4. 编码不应该有重复的，如果发现，可能是别人输入错误，也请跟我说</p>
      <button onClick={() => onClose(false)}>我知道了</button>
    </dialog>
  );
}

export default About;

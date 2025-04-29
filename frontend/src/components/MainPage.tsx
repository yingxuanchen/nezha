import { useEffect, useRef, useState } from "react";
import { useDialogClickOutside } from "../hooks/useDialogClickOutside";

function MainPage() {
  const [openModal, setOpenModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useDialogClickOutside(dialogRef);

  return (
    <>
      <h1>Test</h1>
      <h1>Test</h1>
      <h1>Test</h1>
      <h1>Test</h1>
      <h1>Test</h1>
      <h1>Test</h1>
      <dialog ref={dialogRef}>
        Test
        <button>Add test</button>
      </dialog>
      <button onClick={() => dialogRef.current?.showModal()}>+</button>
    </>
  );
}

export default MainPage;

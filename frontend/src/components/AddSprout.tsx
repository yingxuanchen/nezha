import { useEffect, useRef } from "react";

interface Props {
  onClose: () => void;
}

function AddSprout({ onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <dialog ref={dialogRef} open>
        Test
        <button>Add test</button>
      </dialog>
      test
    </>
  );
}

export default AddSprout;

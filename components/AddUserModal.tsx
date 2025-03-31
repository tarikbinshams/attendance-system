import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const navigation = useNavigation();

  // **Determine if the form is submitting**
  const isSubmitting = navigation.state === "submitting";

  return (
    <dialog ref={modalRef} className="modal h-full overflow-y-auto">
      <div className="modal-box ">
        <form method="dialog">
          <button
            type="button"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>
        <p className="font-bold text-lg mb-5">Add New User</p>
        <div className="p-2"></div> {/* Proper spacing */}
        <Form method="post">
          <div className="flex flex-col gap-4">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Name</legend>
              <input
                type="text"
                name="name"
                id="name"
                className="input mt-2 w-full"
                placeholder="Type here"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email</legend>
              <input
                type="text"
                name="email"
                id="email"
                className="input mt-2  w-full"
                placeholder="Type here"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password</legend>
              <input
                type="text"
                name="password"
                id="password"
                className="input mt-2  w-full"
                placeholder="Type here"
              />
            </fieldset>
            <div className="flex justify-center gap-4 pb-0 w-full">
              <button className="btn btn-soft btn-error flex-1">Cancel</button>
              <button
                disabled={isSubmitting}
                type="submit"
                className="btn btn-soft btn-primary flex-1"
              >
                {isSubmitting ? (
                  <span className="">Adding...</span>
                ) : (
                  "Add User"
                )}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </dialog>
  );
}

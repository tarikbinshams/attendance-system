import { Form, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors?: {
    name?: string;
    email?: string;
    password?: string;
  };
  actionData?: {
    error: { error?: string } | null;
  };
}

export default function AddUserModal({
  isOpen,
  onClose,
  errors,
  actionData,
}: AddUserModalProps) {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleClose = () => {
    formRef.current?.reset(); // Reset the form fields
    onClose();
    modalRef.current?.close();
    if (actionData?.error) {
      actionData.error = null;
    }
  };

  console.log("Modal actionData:", actionData?.error?.error);

  return (
    <dialog
      ref={modalRef}
      className="modal"
      style={{
        width: "400px",
        minHeight: "400px",
        padding: "24px",
        borderRadius: "8px",
      }}
    >
      <div className="modal-box w-[400px]">
        <div className="flex justify-between">
          <p className="font-bold text-lg mb-5">Add New User</p>
          <form method="dialog">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleClose}
            >
              ✕
            </button>
          </form>
        </div>
        <div className="p-2"></div> {/* Proper spacing */}
        {actionData && actionData?.error && (
          <div
            role="alert"
            className="alert alert-error alert-soft"
            style={{ marginBottom: "16px" }}
          >
            <span>{actionData?.error?.error || "Something went wrong!"}</span>
          </div>
        )}
        <Form ref={formRef} method="post">
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
            {errors?.name && (
              <p className="mt-0 text-sm text-red-600">{errors.name}</p>
            )}
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
            {errors?.email && (
              <p className="mt-0 text-sm text-red-600">{errors.email}</p>
            )}
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
            {errors?.password && (
              <p className="mt-0 text-sm text-red-600">{errors.password}</p>
            )}
            <div className="flex justify-center gap-4 pb-0 w-full">
              <button
                type="button"
                className="btn btn-soft btn-error flex-1"
                onClick={handleClose}
              >
                Cancel
              </button>
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

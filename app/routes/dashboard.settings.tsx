import { ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { addUser, getUsers } from "api/api";
import { z } from "zod";
import { useEffect, useState } from "react";
import AddUserModal from "components/AddUserModal";

const DataSchema = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string(),
});
type DataSchema = z.infer<typeof DataSchema>;

export async function loader({ request }: ActionFunctionArgs) {
  const users = await getUsers(request);
  return new Response(JSON.stringify({ status: 200, data: users || [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.formData();
    const name = body.get("name");
    const email = body.get("email");
    const password = body.get("password");

    console.log("Name:", name); // Debugging line
    console.log("Email:", email); // Debugging line
    console.log("Password:", password); // Debugging line

    const errors: { name?: string; email?: string; password?: string } = {};

    // Basic Validation
    if (!name || typeof name !== "string" || name.length < 3) {
      errors.name = "Name must be at least 3 characters long.";
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({ errors }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    //wait 3 seconds
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulate login (replace with actual login logic)
    const res = await addUser({
      name: name as string,
      email: email as string,
      password: password as string,
      status: "ACTIVE",
      request,
    });

    if (res) {
      if (res.error) {
        errors.email = res.error;
        return new Response(JSON.stringify({ errors }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      // console.log("Response:", res); // Debugging line
      if (res) {
        // return redirect("/dashboard/settings");

        return new Response(JSON.stringify({ status: 200 }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    }

    errors.email = "Something went wrong. Please try again later.";
    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Action error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export default function Settings() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  console.log("Data:", data.data);

  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log("Action Data:", actionData); // Debugging line

  // Check if there are any errors in actionData
  const errors = actionData?.errors || {};
  const hasErrors = Object.keys(errors).length > 0;
  console.log("Errors:", errors); // Debugging line
  if (hasErrors) {
    // Handle errors (e.g., show a notification or alert)
    console.error("Form submission errors:", errors);
  }

  useEffect(() => {
    if (actionData?.status === 200) {
      setIsModalOpen(false);
    }
  }, [actionData]);

  return (
    <div>
      {data.data.length === 0 ? (
        <div className="flex justify-center items-center h-[calc(100vh-140px)]">
          <p className="text-xl">No data found!</p>
        </div>
      ) : (
        <div>
          <div className="flex justify-between p-8">
            <p className="text-[24px] font-[600]">Manage Users</p>
            <button
              className="btn btn-dash btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Add User
            </button>
          </div>
          <div className="rounded-box border border-base-content/5 bg-base-100 mx-8 h-[calc(100vh-200px)] overflow-y-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="font-sans font-[500] italic text-[16px]">
                  <th></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.data.map((item: DataSchema, index: number) => (
                  <tr key={index} className="font-[600] text-[16px]">
                    <th>{index + 1}</th>
                    <td>{item?.name}</td>
                    <td>{item?.email}</td>
                    <td className="my-auto flex gap-4">
                      <button className="btn btn-sm btn-soft btn-accent">
                        Edit
                      </button>
                      <button className="btn btn-sm btn-soft btn-error">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

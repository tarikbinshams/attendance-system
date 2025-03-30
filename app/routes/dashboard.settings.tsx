import { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUsers } from "api/api";

import { z } from "zod";

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

export default function Settings() {
  const data = useLoaderData<typeof loader>();
  console.log("Data:", data.data); // Debugging line

  if (data.data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-140px)]">
        <p className="text-xl">No data found!</p>
      </div>
    );
  }
  return (
    <div className="">
      <div className="flex justify-between p-8">
        <p className="text-[24px] font-[600]">Manage Users</p>
        <button className="btn btn-dash btn-primary">Add User</button>
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
  );
}

import { ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserActivity } from "api/api";
import { z } from "zod";

const DataSchema = z.object({
  _id: z.string(),
  type: z.string(),
  created_at: z.string(),
  user: z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});

type DataSchema = z.infer<typeof DataSchema>;

export async function loader({ request }: ActionFunctionArgs) {
  const userActivity = await getUserActivity(request);
  return new Response(
    JSON.stringify({ status: 200, data: userActivity.activities || [] }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
export default function DashboardIndex() {
  const data = useLoaderData<typeof loader>();
  // console.log("Data:", data.data); // Debugging line

  if (data.data.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-140px)]">
        <p className="text-xl">No data found!</p>
      </div>
    );
  }

  return (
    <div className="rounded-box border border-base-content/5 bg-base-100 mt-8 h-[calc(100vh-140px)] overflow-y-auto">
      <table className="table table-zebra">
        <thead>
          <tr className="font-sans font-[500] italic text-[16px]">
            <th></th>
            <th>Name</th>
            <th>Time</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((item: DataSchema, index: number) => (
            <tr key={index} className="font-[600] text-[16px]">
              <th>{index + 1}</th>
              <td>{item?.user.name}</td>
              <td>{new Date(item?.created_at).toLocaleString()}</td>
              <td className="my-auto">
                {item.type === "login" ? (
                  <div className="badge badge-success">
                    <svg
                      className="size-[1em]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="currentColor"
                        strokeLinejoin="miter"
                        strokeLinecap="butt"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="square"
                          strokeMiterlimit="10"
                          strokeWidth="2"
                        ></circle>
                        <polyline
                          points="7 13 10 16 17 8"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="square"
                          strokeMiterlimit="10"
                          strokeWidth="2"
                        ></polyline>
                      </g>
                    </svg>
                    <span className="pb-1 capitalize">{item.type}</span>
                  </div>
                ) : (
                  <div className="badge badge-error">
                    <svg
                      className="size-[1em]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <g fill="currentColor">
                        <rect
                          x="1.972"
                          y="11"
                          width="20.056"
                          height="2"
                          transform="translate(-4.971 12) rotate(-45)"
                          fill="currentColor"
                          strokeWidth={0}
                        ></rect>
                        <path
                          d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z"
                          strokeWidth={0}
                          fill="currentColor"
                        ></path>
                      </g>
                    </svg>
                    <span className="pb-1 capitalize">{item.type}</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { ActionFunctionArgs } from "@remix-run/node";
import { Link, Outlet, redirect, useFetcher } from "@remix-run/react";
import { logout } from "api/api";
import { authCookie } from "~/cookies.server";

export async function loader({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");

  if (!cookieHeader?.includes("auth")) {
    return redirect("/");
  }
  return new Response(JSON.stringify({ status: 200 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action");
  if (actionType === "logout") {
    await logout(request);
    return redirect("/", {
      headers: {
        "Set-Cookie": await authCookie.serialize(null, {
          expires: new Date(1970, 0, 1),
        }),
      },
    });
  }
  return redirect("/dashboard");
}

export default function Dashboard() {
  const fetcher = useFetcher();

  function handleLogout() {
    fetcher.submit({ _action: "logout" }, { method: "post" });
  }
  return (
    <div className="w-screen px-8">
      <div className="navbar bg-base-100 flex justify-between">
        <div className="">
          <Link to={"/dashboard"} className="btn btn-ghost text-xl">
            Attendance
          </Link>
        </div>
        <div className="">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered md:w-64 w-auto"
          />
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                />
              </div>
            </div>
            <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <Link to="/dashboard/profile" className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard/settings">Settings</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
                {/* <form method="post">
                  <button type="submit" name="_action" value="logout">
                    Logout
                  </button>
                </form> */}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Outlet />
    </div>
  );
}
